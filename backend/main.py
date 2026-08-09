"""CassavaGuard AI — FastAPI application entry point.

Precision-agriculture decision-support platform for cassava:
dashboard, GIS, AI diagnosis, satellite/weather/soil analytics, recommendations.
"""
from contextlib import asynccontextmanager
import time

from fastapi import Depends, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import (
    APP_ENV,
    AI_SERVING_MODE,
    CORS_ORIGINS,
    ENABLE_API_DOCS,
    ENVIRONMENTAL_DATA_MODE,
    FRONTEND_DIR,
    LOG_RETENTION_ROWS,
    SEED_DEMO_DATA,
)
from backend.core.rate_limit import rate_limit_middleware
from backend.core.security import require_role
from backend.database import SessionLocal
from backend.models import LogEntry, User
from backend.api import (admin, auth, dashboard, fields, files, history, models,
                         notifications, predict, satellite, soil, weather)
from backend.services import ml_classifier, seed


@asynccontextmanager
async def lifespan(_app: FastAPI):
    created = seed.run()
    print(f"[CassavaGuard] seed: {created}")
    ml_classifier.get_classifier()
    yield


app = FastAPI(
    title="CassavaGuard AI",
    description="AI-powered precision-agriculture platform for cassava monitoring, "
                "disease diagnosis, and evidence-based agronomy decision support.",
    version="1.0.0",
    docs_url="/api/docs" if ENABLE_API_DOCS else None,
    redoc_url="/api/redoc" if ENABLE_API_DOCS else None,
    openapi_url="/api/openapi.json" if ENABLE_API_DOCS else None,
    lifespan=lifespan,
)

if CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials="*" not in CORS_ORIGINS,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )

app.middleware("http")(rate_limit_middleware)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob: https://*.arcgisonline.com "
        "https://*.openstreetmap.org https://*.opentopomap.org https://*.basemaps.cartocdn.com; "
        "connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; "
        "frame-ancestors 'none'; form-action 'self'"
    )
    if APP_ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    t0 = time.perf_counter()
    response = await call_next(request)
    dur = (time.perf_counter() - t0) * 1000
    if request.url.path.startswith("/api") and not request.url.path.startswith("/api/docs"):
        db = None
        try:
            db = SessionLocal()
            entry = LogEntry(level="INFO", method=request.method, path=request.url.path,
                             status_code=response.status_code, duration_ms=round(dur, 2))
            db.add(entry)
            db.flush()
            if entry.id and entry.id % 100 == 0:
                cutoff = (db.query(LogEntry.id).order_by(LogEntry.id.desc())
                          .offset(LOG_RETENTION_ROWS).limit(1).scalar())
                if cutoff:
                    db.query(LogEntry).filter(LogEntry.id <= cutoff).delete(synchronize_session=False)
            db.commit()
        except Exception:
            if db:
                db.rollback()
        finally:
            if db:
                db.close()
    response.headers["X-Process-Time-ms"] = f"{dur:.1f}"
    return response


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "CassavaGuard AI", "version": "1.0.0",
            "environment": APP_ENV, "demo_mode": SEED_DEMO_DATA,
            "environmental_data_mode": ENVIRONMENTAL_DATA_MODE,
            "ai_serving_mode": AI_SERVING_MODE}


@app.get("/api/logs")
def logs(limit: int = Query(100, ge=1, le=500),
         _admin: User = Depends(require_role("admin"))):
    db = SessionLocal()
    try:
        rows = db.query(LogEntry).order_by(LogEntry.created_at.desc()).limit(limit).all()
        return [{"id": r.id, "at": r.created_at.isoformat(), "level": r.level,
                 "method": r.method, "path": r.path, "status": r.status_code,
                 "ms": r.duration_ms} for r in rows]
    finally:
        db.close()


for r in (auth, admin, dashboard, fields, files, predict, satellite, weather,
          soil, notifications, history, models):
    app.include_router(r.router)


# ----- serve pre-built frontend -------------------------------------------- #
app.mount("/vendor", StaticFiles(directory=str(FRONTEND_DIR / "vendor")), name="vendor")
app.mount("/dist", StaticFiles(directory=str(FRONTEND_DIR / "dist")), name="dist")


@app.get("/")
def index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/favicon.svg", include_in_schema=False)
def favicon():
    return FileResponse(str(FRONTEND_DIR / "favicon.svg"), media_type="image/svg+xml")
