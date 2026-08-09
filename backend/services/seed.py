"""Seed the database with demo users and Thai cassava fields (idempotent)."""
import datetime as dt
import json
import math
import secrets

from sqlalchemy.orm import Session

from backend.config import (
    AUTH_REQUIRED,
    BOOTSTRAP_ADMIN_EMAIL,
    BOOTSTRAP_ADMIN_PASSWORD,
    IS_PRODUCTION,
    SEED_DEMO_DATA,
)
from backend.core.security import hash_password
from backend.database import SessionLocal, run_migrations
from backend.models import Alert, Field, User
from backend.services import satellite_engine, soil_engine, weather_engine

# Real cassava-growing districts (Nakhon Ratchasima / Chaiyaphum / Kanchanaburi region)
FIELDS = [
    {"name": "Sung Noen North Plot",  "name_th": "แปลงสูงเนินเหนือ",   "province": "Nakhon Ratchasima", "variety": "KU50",     "area_rai": 24.0, "lat": 14.9012, "lon": 101.8231},
    {"name": "Dan Khun Thot A1",      "name_th": "ด่านขุนทด A1",       "province": "Nakhon Ratchasima", "variety": "Rayong 9",  "area_rai": 18.5, "lat": 15.2076, "lon": 101.7743},
    {"name": "Thepsathit Ridge",      "name_th": "เทพสถิตสันเขา",       "province": "Chaiyaphum",        "variety": "Rayong 72", "area_rai": 31.2, "lat": 15.5619, "lon": 101.5088},
    {"name": "Sikhio Riverside",      "name_th": "สีคิ้วริมน้ำ",         "province": "Nakhon Ratchasima", "variety": "KU50",     "area_rai": 12.8, "lat": 14.8896, "lon": 101.7126},
    {"name": "Bo Phloi Upland",       "name_th": "บ่อพลอยที่ดอน",       "province": "Kanchanaburi",      "variety": "Huay Bong 80", "area_rai": 27.6, "lat": 14.3327, "lon": 99.5169},
    {"name": "Nong Bua Daeng East",   "name_th": "หนองบัวแดงตะวันออก",  "province": "Chaiyaphum",        "variety": "Rayong 11", "area_rai": 20.4, "lat": 15.9564, "lon": 101.9312},
]


def _boundary(lat: float, lon: float, area_rai: float, seed: int) -> str:
    """Irregular polygon (GeoJSON [lon,lat] ring) sized from area."""
    side_m = math.sqrt(area_rai * 1600)  # 1 rai = 1600 m2
    dlat = side_m / 111_000 / 2
    dlon = side_m / (111_000 * math.cos(math.radians(lat))) / 2
    pts = []
    for i in range(7):
        ang = 2 * math.pi * i / 7
        jitter = 0.72 + 0.4 * ((seed * (i + 3)) % 97) / 97
        pts.append([round(lon + math.cos(ang) * dlon * jitter, 6),
                    round(lat + math.sin(ang) * dlat * jitter, 6)])
    pts.append(pts[0])
    return json.dumps(pts)


def run() -> dict:
    run_migrations()
    db: Session = SessionLocal()
    try:
        created = {"users": 0, "fields": 0, "alerts": 0}
        if not AUTH_REQUIRED and db.query(User).filter_by(email="app@cassavaguard.local").first() is None:
            db.add(User(
                email="app@cassavaguard.local",
                full_name="CassavaGuard",
                role="admin",
                hashed_password=hash_password(secrets.token_urlsafe(32)),
            ))
            db.commit()
            created["users"] += 1

        if db.query(User).count() == 0:
            if SEED_DEMO_DATA:
                for email, name, role, pw in [
                    ("admin@cassavaguard.ai", "Admin User", "admin", "admin123"),
                    ("researcher@cassavaguard.ai", "Dr. Somchai Res.", "researcher", "research123"),
                    ("farmer@cassavaguard.ai", "Farmer Prasert", "farmer", "farmer123"),
                ]:
                    db.add(User(email=email, full_name=name, role=role,
                                hashed_password=hash_password(pw)))
                    created["users"] += 1
            elif BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD:
                if len(BOOTSTRAP_ADMIN_PASSWORD) < 10:
                    raise RuntimeError("BOOTSTRAP_ADMIN_PASSWORD must be at least 10 characters")
                db.add(User(
                    email=BOOTSTRAP_ADMIN_EMAIL,
                    full_name="System Administrator",
                    role="admin",
                    hashed_password=hash_password(BOOTSTRAP_ADMIN_PASSWORD),
                ))
                created["users"] = 1
            else:
                message = (
                    "No users exist. Set BOOTSTRAP_ADMIN_EMAIL and "
                    "BOOTSTRAP_ADMIN_PASSWORD to create the first production admin."
                )
                if IS_PRODUCTION:
                    raise RuntimeError(message)
                print(f"[seed] {message}")
            db.commit()

        if SEED_DEMO_DATA and db.query(Field).count() == 0:
            admin = db.query(User).filter_by(role="admin").first()
            farmer = db.query(User).filter_by(role="farmer").first()
            for i, fd in enumerate(FIELDS):
                planted = dt.date.today() - dt.timedelta(days=60 + i * 35)
                plant_count = int(fd["area_rai"] * 1600 / 1.2)  # ~1.2 m2/plant
                # derive an initial health score from soil + ndvi
                soil = soil_engine.profile(i + 1, fd["lat"], fd["lon"])
                ndvi = satellite_engine.field_ndvi(i + 1, fd["lat"], fd["lon"], planted, 82, dt.date.today())
                health = round(max(38, min(96, 55 + ndvi * 45 - {"low": 0, "medium": 10, "high": 22}[soil["risk_level"]])), 1)
                risk = "high" if health < 60 else ("medium" if health < 78 else "low")
                db.add(Field(
                    name=fd["name"], name_th=fd["name_th"], province=fd["province"],
                    variety=fd["variety"], area_rai=fd["area_rai"], plant_count=plant_count,
                    planted_at=dt.datetime.combine(planted, dt.time()),
                    lat=fd["lat"], lon=fd["lon"],
                    boundary_json=_boundary(fd["lat"], fd["lon"], fd["area_rai"], i + 1),
                    health_score=health, risk_level=risk,
                    owner_id=(farmer.id if farmer and i % 2 else admin.id if admin else None),
                ))
                created["fields"] += 1
            db.commit()

        if SEED_DEMO_DATA and db.query(Alert).count() == 0:
            fields = db.query(Field).all()
            now = dt.datetime.now(dt.UTC).replace(tzinfo=None)
            samples = [
                ("disease", "high", "CMD symptoms detected", "พบอาการโรคใบด่าง (CMD)",
                 "Leaf AI flagged mosaic mottling in {f} — inspect and rogue affected plants.",
                 "AI ตรวจพบลายด่างที่ {f} — ตรวจและถอนต้นที่เป็นโรค"),
                ("nutrient", "medium", "Potassium deficiency risk", "เสี่ยงขาดโพแทสเซียม",
                 "Low soil K + heavy rain leaching at {f}.", "ดิน K ต่ำ + ฝนชะล้างที่ {f}"),
                ("water", "high", "Water stress warning", "เตือนภาวะขาดน้ำ",
                 "Dry spell and low soil moisture at {f}.", "ฝนทิ้งช่วงและความชื้นดินต่ำที่ {f}"),
                ("weather", "medium", "Heavy rainfall forecast", "พยากรณ์ฝนตกหนัก",
                 "72h rainfall > 80mm expected near {f}.", "คาดฝน 72 ชม. เกิน 80 มม. ใกล้ {f}"),
            ]
            for j, (kind, sev, ten, tth, men, mth) in enumerate(samples):
                f = fields[j % len(fields)]
                db.add(Alert(kind=kind, severity=sev, title=ten, title_th=tth,
                             message=men.format(f=f.name), message_th=mth.format(f=f.name_th),
                             field_id=f.id, created_at=now - dt.timedelta(hours=j * 5 + 1)))
                created["alerts"] += 1
            db.commit()
        return created
    finally:
        db.close()


if __name__ == "__main__":
    print(run())
