"""Grounded bilingual advisory chat over the user's latest diagnosis.

This intentionally uses curated agronomy responses instead of an unconstrained
language model, so the assistant cannot invent pesticide doses or model results.
"""
from __future__ import annotations

DISEASES = {
    "healthy": ("สุขภาพโดยรวมปกติ", "appears generally healthy", ["ติดตามซ้ำทุก 7–14 วัน", "ถ่ายภาพใหม่เมื่อพบใบผิดปกติ"]),
    "cmd": ("อาจเป็นโรคใบด่าง", "possible cassava mosaic disease", ["แยกต้นที่มีอาการชัด", "ใช้ท่อนพันธุ์สะอาด", "สำรวจแมลงหวี่ขาวใต้ใบ"]),
    "cbsd": ("อาจเป็นโรคเส้นใบสีน้ำตาล", "possible cassava brown streak disease", ["ทำเครื่องหมายต้นต้องสงสัย", "ตรวจลำต้นและหัวเมื่อเก็บตัวอย่าง", "ใช้ท่อนพันธุ์ปลอดโรค"]),
    "cbb": ("อาจเป็นโรคใบไหม้แบคทีเรีย", "possible bacterial blight", ["หลีกเลี่ยงทำงานขณะใบเปียก", "ทำความสะอาดเครื่องมือ", "ตัดส่วนรุนแรงและติดตามการลุกลาม"]),
    "cgm": ("อาจพบไรเขียวมันสำปะหลัง", "possible cassava green mite", ["ตรวจใต้ใบและยอดอ่อน", "อนุรักษ์ไรตัวห้ำ", "หลีกเลี่ยงสารกำจัดแมลงวงกว้างโดยไม่ยืนยัน"]),
}


def answer(message: str, prediction: dict | None, lang: str = "th") -> dict:
    text = " ".join(message.lower().split())
    thai = lang != "en"
    if not prediction:
        reply = ("กรุณาถ่ายภาพทั้งต้นในหน้า วิเคราะห์ ก่อนครับ แล้วผมจะใช้ผลล่าสุดให้คำแนะนำเฉพาะกรณี"
                 if thai else "Please analyze a whole-plant photo first, then I can use the latest result for contextual advice.")
        return {"reply": reply, "grounded": True, "prediction_id": None, "quick_replies": _quick(thai)}

    key = prediction.get("top_class", "healthy")
    confidence = float(prediction.get("confidence") or 0)
    info = DISEASES.get(key, ("พบความผิดปกติที่ต้องตรวจยืนยัน", "an abnormality requiring confirmation", ["ถ่ายภาพระยะใกล้เพิ่ม", "ปรึกษาเจ้าหน้าที่เกษตรในพื้นที่"]))
    if any(word in text for word in ("น้ำหนัก", "ผลผลิต", "yield", "weight")):
        reply = ("น้ำหนักหัวใต้ดินวัดจากภาพต้นโดยตรงไม่ได้ ระบบแสดงได้เพียงช่วงพยากรณ์ ควรใช้เป็นข้อมูลคัดกรองและสุ่มชั่งจริงก่อนซื้อขาย"
                 if thai else "Underground root weight cannot be measured directly from a standing-plant photo. Use the prediction range for screening and verify with sampled harvest weights before trade.")
    elif any(word in text for word in ("ปุ๋ย", "fertil", "ธาตุ")):
        reply = ("ยังแนะนำสูตรหรืออัตราปุ๋ยเฉพาะแปลงไม่ได้จากภาพอย่างเดียว ควรใช้ผลตรวจดิน อายุพืช และประวัติการใส่ปุ๋ยก่อน เพื่อหลีกเลี่ยงการใส่เกิน"
                 if thai else "A photo alone is insufficient for a field-specific fertilizer rate. Add a soil test, crop age, and fertilizer history first.")
    elif any(word in text for word in ("น้ำ", "ฝน", "รด", "water", "rain")):
        reply = ("ตรวจความชื้นดินลึกประมาณ 10–20 ซม. ก่อนให้น้ำ หากผูกผลกับแปลง ระบบจึงจะใช้สภาพอากาศจริงประกอบได้"
                 if thai else "Check soil moisture at roughly 10–20 cm before irrigation. Link the diagnosis to a field to include live weather context.")
    elif any(word in text for word in ("โรค", "อะไร", "result", "disease", "พบ")):
        reply = ((f"ผลล่าสุด: {info[0]} ความมั่นใจ {confidence * 100:.1f}% เป็นผลคัดกรองจากภาพ ไม่ใช่ผลห้องปฏิบัติการ")
                 if thai else f"Latest result: {info[1]} at {confidence * 100:.1f}% confidence. This is image screening, not a laboratory diagnosis.")
    elif any(word in text for word in ("ทำอะไร", "แนะนำ", "ดูแล", "next", "recommend", "advice")):
        actions = " • ".join(info[2])
        reply = ((f"จากผลล่าสุดที่{info[0]}: {actions} หากอาการลุกลามเร็วให้ติดต่อเจ้าหน้าที่เกษตรและเก็บตัวอย่างยืนยัน")
                 if thai else f"For the latest result ({info[1]}): inspect closely, isolate clearly affected plants, use clean planting material, and seek local agronomy confirmation if symptoms spread quickly.")
    elif any(word in text for word in ("ถ่าย", "รูป", "photo", "image")):
        reply = ("ถ่ายกลางแสงธรรมชาติให้เห็นทั้งต้นตั้งแต่โคนถึงยอด แล้วเพิ่มภาพใกล้ใบที่มีอาการ หลีกเลี่ยงภาพสั่น ย้อนแสง และฟิลเตอร์สี"
                 if thai else "Capture the whole plant from base to canopy in natural light, then add a close symptom view. Avoid blur, backlight, and color filters.")
    else:
        reply = ((f"ผมอ้างอิงผลล่าสุดที่{info[0]} ({confidence * 100:.1f}%) ถามต่อได้เรื่องโรค การดูแล น้ำ ปุ๋ย วิธีถ่ายภาพ หรือข้อจำกัดของผลผลิตครับ")
                 if thai else f"I am using the latest result: {info[1]} ({confidence * 100:.1f}%). Ask about disease, care, water, fertilizer, photo capture, or yield limitations.")
    return {"reply": reply, "grounded": True, "prediction_id": prediction.get("id"), "model_context": {"top_class": key, "confidence": confidence}, "quick_replies": _quick(thai)}


def _quick(thai: bool) -> list[str]:
    return (["ผลล่าสุดคืออะไร", "ควรทำอะไรต่อ", "ประเมินผลผลิตอย่างไร", "ควรถ่ายรูปแบบไหน"] if thai
            else ["What is the latest result?", "What should I do next?", "How is yield estimated?", "How should I take the photo?"])
