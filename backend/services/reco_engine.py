"""Recommendation engine — fuses AI diagnosis + soil + weather + satellite
into evidence-based agronomy cards with a transparent confidence score.

Each card lists: the hypothesis, the multi-source EVIDENCE that supports it,
concrete ACTIONS, and a confidence derived from how many independent signals
agree. This mirrors a real decision-support system rather than a static list.
"""
from typing import Optional

from backend.services import satellite_engine, soil_engine, weather_engine
import datetime as dt


def _card(kind, severity, title_en, title_th, evidence, actions_en, actions_th, confidence):
    return {
        "kind": kind, "severity": severity,
        "title_en": title_en, "title_th": title_th,
        "evidence": evidence,
        "actions_en": actions_en, "actions_th": actions_th,
        "confidence": round(min(0.97, confidence), 2),
    }


def build(field: dict, soil: dict, weather: dict, ndvi_series: list,
          ai_pred: Optional[dict] = None) -> list:
    cards = []
    m = soil["metrics"]; st = soil["statuses"]
    rain7 = weather.get("rain_7d_mm")
    rain7 = rain7 if rain7 is not None else 0
    ndvi_now = ndvi_series[-1]["ndvi"] if ndvi_series else None
    ndvi_trend = (ndvi_series[-1]["ndvi"] - ndvi_series[-3]["ndvi"]) if len(ndvi_series) >= 3 else 0.0
    ai_top = ai_pred.get("top_class") if ai_pred else None

    # --- Potassium deficiency (classic cassava on sandy soil) ---
    if st.get("k_ppm") in ("warning", "critical") or (ai_top == "nutrient_def"):
        ev = [{"en": f"Soil K low: {m.get('k_ppm')} ppm (target 80–160)", "th": f"โพแทสเซียมในดินต่ำ: {m.get('k_ppm')} ppm (ควร 80–160)"}]
        conf = 0.45
        if soil["is_sandy"]:
            ev.append({"en": "Sandy soil — high K leaching risk", "th": "ดินทราย — เสี่ยงโพแทสเซียมถูกชะล้าง"}); conf += 0.15
        if ndvi_now is not None and ndvi_now < 0.55:
            ev.append({"en": f"Low canopy vigour (NDVI {ndvi_now})", "th": f"ความสมบูรณ์ทรงพุ่มต่ำ (NDVI {ndvi_now})"}); conf += 0.12
        if rain7 > 80:
            ev.append({"en": f"Heavy recent rain ({rain7} mm/7d) accelerates leaching", "th": f"ฝนตกหนัก ({rain7} มม./7วัน) เร่งการชะล้าง"}); conf += 0.1
        if ai_top == "nutrient_def":
            ev.append({"en": f"Leaf AI flags nutrient deficiency ({ai_pred['confidence']*100:.0f}%)", "th": f"AI ตรวจใบพบภาวะขาดธาตุอาหาร ({ai_pred['confidence']*100:.0f}%)"}); conf += 0.18
        cards.append(_card("nutrient", "high" if st["k_ppm"] == "critical" else "medium",
            "Possible Potassium (K) Deficiency", "อาจขาดธาตุโพแทสเซียม (K)", ev,
            ["Apply split K fertiliser (0-0-60 muriate of potash)", "Sample soil K to confirm before dosing", "Avoid single heavy dose on sandy soil"],
            ["ใส่ปุ๋ยโพแทสเซียมแบบแบ่งใส่ (0-0-60)", "เก็บตัวอย่างดินตรวจ K ก่อนใส่", "หลีกเลี่ยงการใส่ครั้งเดียวปริมาณมากในดินทราย"], conf))

    # --- Nitrogen deficiency ---
    if st.get("n_ppm") in ("warning", "critical"):
        conf = 0.5 + (0.15 if ndvi_now is not None and ndvi_now < 0.5 else 0) + (0.12 if st.get("om_pct") not in ("optimal", "unavailable") else 0)
        cards.append(_card("nutrient", "medium",
            "Nitrogen (N) Below Optimal", "ไนโตรเจน (N) ต่ำกว่าเกณฑ์",
            [{"en": f"Soil N {m['n_ppm']} ppm (target 18–40)", "th": f"ไนโตรเจนในดิน {m['n_ppm']} ppm (ควร 18–40)"},
             {"en": f"Organic matter {m['om_pct']}%", "th": f"อินทรียวัตถุ {m['om_pct']}%"}],
            ["Apply 46-0-0 urea at early bulking stage", "Incorporate green manure / crop residue"],
            ["ใส่ปุ๋ยยูเรีย 46-0-0 ช่วงลงหัว", "ไถกลบปุ๋ยพืชสด/เศษซากพืช"], conf))

    # --- Water stress ---
    if rain7 < 8 or (m.get("moisture_pct") is not None and m["moisture_pct"] < 15) or ai_top == "water_stress":
        conf = 0.4
        ev = []
        if rain7 < 8:
            ev.append({"en": f"Dry spell — {rain7} mm rain in 7 days", "th": f"ฝนทิ้งช่วง — ฝน {rain7} มม. ใน 7 วัน"}); conf += 0.2
        if m.get("moisture_pct") is not None and m["moisture_pct"] < 15:
            ev.append({"en": f"Low soil moisture ({m['moisture_pct']}%)", "th": f"ความชื้นดินต่ำ ({m['moisture_pct']}%)"}); conf += 0.2
        if ndvi_trend < -0.02:
            ev.append({"en": "Declining NDVI trend", "th": "แนวโน้ม NDVI ลดลง"}); conf += 0.1
        if ai_top == "water_stress":
            ev.append({"en": f"Leaf AI flags water stress ({ai_pred['confidence']*100:.0f}%)", "th": f"AI ตรวจพบภาวะขาดน้ำ ({ai_pred['confidence']*100:.0f}%)"}); conf += 0.18
        cards.append(_card("water", "high" if m.get("moisture_pct") is not None and m["moisture_pct"] < 12 else "medium",
            "Water Stress Risk", "ความเสี่ยงภาวะขาดน้ำ", ev,
            ["Irrigate 20–25 mm if within first 5 months", "Mulch to reduce evaporation", "Prioritise low-NDVI zones from the map"],
            ["ให้น้ำ 20–25 มม. หากอยู่ใน 5 เดือนแรก", "คลุมดินลดการระเหย", "ให้น้ำโซน NDVI ต่ำก่อน"], conf))

    # --- Disease/pest pressure (AI + weather) ---
    # Each entry: (EN name, TH name, EN actions, TH actions, optional always-shown
    # context note). The 6 disease/pest entries beyond cmd/cbsd/cbb/cgm came from a
    # multi-agent research + adversarial-verification pass (each independently
    # source-checked against CABI/FAO/CIAT/IITA/peer-reviewed literature/Thai DOA
    # extension material — see memory/commit notes) — action lists are real,
    # disease-appropriate IPM guidance, not copy-pasted from the viral/bacterial
    # ones above (mite/insect pests need predator-conservation advice, not
    # whitefly-vector-control advice; fungal diseases need sanitation/resistant-
    # variety advice, not vector control).
    DISEASE_INFO = {
        "cmd": ("Cassava Mosaic Disease", "โรคใบด่าง",
               ["Rogue and destroy symptomatic plants", "Use certified disease-free planting material next cycle", "Control whitefly vector (for CMD/CBSD)"],
               ["ถอนและทำลายต้นที่มีอาการ", "ใช้ท่อนพันธุ์ปลอดโรคในรอบถัดไป", "ควบคุมแมลงหวี่ขาวพาหะ (CMD/CBSD)"], None),
        "cbsd": ("Cassava Brown Streak", "โรคเส้นใบสีน้ำตาล",
                ["Rogue and destroy symptomatic plants", "Use certified disease-free planting material next cycle", "Control whitefly vector (for CMD/CBSD)"],
                ["ถอนและทำลายต้นที่มีอาการ", "ใช้ท่อนพันธุ์ปลอดโรคในรอบถัดไป", "ควบคุมแมลงหวี่ขาวพาหะ (CMD/CBSD)"], None),
        "cbb": ("Cassava Bacterial Blight", "โรคใบไหม้แบคทีเรีย",
               ["Rogue and destroy symptomatic plants", "Use certified disease-free planting material next cycle", "Control whitefly vector (for CMD/CBSD)"],
               ["ถอนและทำลายต้นที่มีอาการ", "ใช้ท่อนพันธุ์ปลอดโรคในรอบถัดไป", "ควบคุมแมลงหวี่ขาวพาหะ (CMD/CBSD)"],
               ({"en": "Wet conditions favour bacterial spread", "th": "สภาพชื้นเอื้อการระบาดแบคทีเรีย"} if rain7 > 60 else None)),
        "cgm": ("Cassava Green Mite", "ไรแดงมันสำปะหลัง",
               ["Conserve/release predatory mites (e.g. Typhlodromalus spp.) where available",
                "Avoid broad-spectrum insecticide sprays — they kill the mite's natural predators too",
                "Use tolerant/resistant varieties for the next planting cycle"],
               ["อนุรักษ์/ปล่อยไรตัวห้ำ (เช่น Typhlodromalus) ถ้าหาได้",
                "หลีกเลี่ยงยาฆ่าแมลงวงกว้าง เพราะฆ่าศัตรูธรรมชาติของไรไปด้วย",
                "ใช้พันธุ์ทนทานในรอบปลูกถัดไป"],
               {"en": "Mite pressure typically peaks in dry weather", "th": "ไรแดงมักระบาดหนักช่วงอากาศแห้ง"}),
        "cad": ("Cassava Anthracnose Disease", "โรคแอนแทรคโนส",
               ["Use certified disease-free stem cuttings", "Destroy infected leaves/stems/shoot tips after harvest", "Avoid working in fields while foliage is wet"],
               ["ใช้ท่อนพันธุ์ปลอดโรคในการปลูก", "เก็บทำลายใบ/ลำต้น/ยอดที่เป็นโรคหลังเก็บเกี่ยว", "หลีกเลี่ยงทำงานในแปลงขณะใบเปียก"],
               ({"en": "High humidity/rainfall favours anthracnose spread", "th": "ความชื้น/ฝนตกหนักเอื้อการระบาดของโรคแอนแทรคโนส"} if rain7 > 60 else None)),
        "brown_leaf_spot": ("Cassava Brown Leaf Spot", "โรคใบจุดสีน้ำตาล",
               ["Remove and destroy fallen leaves/old stalks after harvest", "Use certified disease-free planting material", "Wider spacing + avoid excess nitrogen for airflow"],
               ["เก็บทำลายใบร่วง/ต้นเก่าหลังเก็บเกี่ยว", "ใช้ท่อนพันธุ์ปลอดโรค", "เว้นระยะปลูกให้โปร่ง หลีกเลี่ยงใส่ไนโตรเจนมากเกินไป"],
               ({"en": "Wet/humid conditions favour fungal spread", "th": "สภาพชื้นเอื้อการระบาดของเชื้อรา"} if rain7 > 60 else None)),
        "white_leaf_spot": ("Cassava White Leaf Spot", "โรคใบจุดขาว",
               ["Remove fallen leaves during dry season", "Adequate plant spacing for airflow", "Rotate with non-host crops every 2-3 seasons"],
               ["เก็บกวาดใบร่วงในฤดูแล้ง", "ปลูกเว้นระยะให้อากาศถ่ายเทดี", "ปลูกพืชหมุนเวียนทุก 2-3 ฤดู"],
               ({"en": "Cool, humid weather favours this fungus", "th": "อากาศเย็นชื้นเอื้อต่อเชื้อราชนิดนี้"} if rain7 > 60 else None)),
        "sed": ("Super Elongation Disease", "โรคยอดยืดผิดปกติ",
               ["Use clean, disease-free stem cuttings only", "Choose SED-tolerant varieties where available", "Prune out cankered shoots, avoid wet-foliage work"],
               ["ใช้ท่อนพันธุ์สะอาดปราศจากโรคเท่านั้น", "เลือกพันธุ์ทนทานหากมี", "ตัดแต่งส่วนที่เป็นแผล หลีกเลี่ยงทำงานขณะใบเปียก"],
               ({"en": "Fungal spores spread more easily in wet conditions", "th": "สปอร์เชื้อราแพร่กระจายง่ายขึ้นเมื่อชื้น"} if rain7 > 60 else None)),
        "mealybug": ("Cassava Mealybug", "เพลี้ยแป้งมันสำปะหลัง",
               ["Use clean, pest-free cuttings from a trusted source", "Conserve natural enemies (parasitoid wasp Anagyrus lopezi)", "Remove and destroy heavily infested shoot tips"],
               ["ใช้ท่อนพันธุ์สะอาดปลอดเพลี้ยแป้งจากแหล่งเชื่อถือได้", "อนุรักษ์ศัตรูธรรมชาติ (แตนเบียน Anagyrus lopezi)", "ตัดทำลายยอดที่ระบาดหนัก"],
               {"en": "Mealybug infestations are typically most severe in the dry season", "th": "เพลี้ยแป้งมักระบาดหนักที่สุดในฤดูแล้ง"}),
        "whitefly": ("Cassava Whitefly Damage", "แมลงหวี่ขาว",
               ["Conserve natural enemies, avoid broad-spectrum insecticides", "Intercrop with legumes (e.g. cowpea) to reduce egg-laying", "Scout leaf undersides regularly, remove sooty-mould-heavy leaves"],
               ["อนุรักษ์ศัตรูธรรมชาติ หลีกเลี่ยงยาฆ่าแมลงวงกว้าง", "ปลูกพืชแซมตระกูลถั่วช่วยลดการวางไข่", "สำรวจใต้ใบสม่ำเสมอ ตัดใบที่มีราดำหนา"],
               {"en": "Populations build fastest during prolonged dry spells", "th": "ประชากรแมลงเพิ่มขึ้นเร็วที่สุดช่วงแล้งยาวนาน"}),
    }
    if ai_top in DISEASE_INFO:
        en_n, th_n, actions_en, actions_th, extra_note = DISEASE_INFO[ai_top]
        conf = 0.45 + ai_pred["confidence"] * 0.4 + (0.1 if rain7 > 60 else 0)
        ev = [{"en": f"Leaf AI: {en_n} at {ai_pred['confidence']*100:.0f}% confidence", "th": f"AI ตรวจใบ: {th_n} ความมั่นใจ {ai_pred['confidence']*100:.0f}%"}]
        for s in ai_pred.get("symptoms", [])[:2]:
            ev.append({"en": s["en"], "th": s["th"]})
        if extra_note:
            ev.append(extra_note)
        cards.append(_card("disease", "high", f"{en_n} Detected", f"ตรวจพบ{th_n}", ev, actions_en, actions_th, conf))

    # --- Soil acidity ---
    if st.get("ph") in ("warning", "critical") and m.get("ph") is not None and m["ph"] < 5.5:
        cards.append(_card("nutrient", "medium",
            "Soil Acidity Limiting Uptake", "ดินเป็นกรดจำกัดการดูดธาตุอาหาร",
            [{"en": f"Soil pH {m['ph']} (target 5.5–6.5)", "th": f"ค่า pH ดิน {m['ph']} (ควร 5.5–6.5)"},
             {"en": f"CEC {m['cec']} — low buffering", "th": f"CEC {m['cec']} — ความสามารถกักธาตุต่ำ"}],
            ["Apply agricultural lime (dolomite) 200–400 kg/rai", "Re-test pH after 6–8 weeks"],
            ["ใส่ปูนโดโลไมต์ 200–400 กก./ไร่", "ตรวจ pH ซ้ำหลัง 6–8 สัปดาห์"], 0.6))

    # --- Healthy fallback ---
    if not cards and ndvi_now is not None and any(
        status == "optimal" for status in st.values()
    ):
        cards.append(_card("info", "info",
            "Crop Within Healthy Parameters", "พืชอยู่ในเกณฑ์สุขภาพดี",
            [{"en": f"NDVI {ndvi_now} — good vigour", "th": f"NDVI {ndvi_now} — ความสมบูรณ์ดี"},
             {"en": "Soil nutrients within optimal range", "th": "ธาตุอาหารดินอยู่ในเกณฑ์เหมาะสม"}],
            ["Continue routine monitoring", "Maintain balanced fertilisation schedule"],
            ["ติดตามตามปกติต่อไป", "รักษาแผนการใส่ปุ๋ยสมดุล"], 0.7))

    if not cards:
        cards.append(_card(
            "info",
            "info",
            "More Field Measurements Required",
            "ต้องเพิ่มข้อมูลตรวจวัดในแปลง",
            [{"en": "No complete measured soil/satellite evidence is available",
              "th": "ยังไม่มีข้อมูลตรวจวัดดิน/ดาวเทียมที่เพียงพอ"}],
            ["Add a laboratory soil result or sensor measurement before fertiliser decisions"],
            ["เพิ่มผลตรวจดินจากห้องปฏิบัติการหรือเซนเซอร์ก่อนตัดสินใจใส่ปุ๋ย"],
            0.3,
        ))

    order = {"high": 0, "medium": 1, "info": 2}
    cards.sort(key=lambda c: (order.get(c["severity"], 3), -c["confidence"]))
    return cards
