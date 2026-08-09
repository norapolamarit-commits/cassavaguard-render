"""SMTP delivery for password-reset links."""
import smtplib
from email.message import EmailMessage
from urllib.parse import urlencode

from backend.config import (
    PUBLIC_BASE_URL,
    SMTP_FROM,
    SMTP_HOST,
    SMTP_PASSWORD,
    SMTP_PORT,
    SMTP_USERNAME,
    SMTP_USE_TLS,
)


def smtp_configured() -> bool:
    return bool(SMTP_HOST and SMTP_FROM)


def send_password_reset(email: str, token: str) -> None:
    if not smtp_configured():
        return
    reset_url = f"{PUBLIC_BASE_URL}/?{urlencode({'reset_token': token})}"
    message = EmailMessage()
    message["Subject"] = "CassavaGuard password reset"
    message["From"] = SMTP_FROM
    message["To"] = email
    message.set_content(
        "A password reset was requested for your CassavaGuard account.\n\n"
        f"Reset your password within 30 minutes:\n{reset_url}\n\n"
        "If you did not request this, ignore this email."
    )
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as smtp:
        if SMTP_USE_TLS:
            smtp.starttls()
        if SMTP_USERNAME:
            smtp.login(SMTP_USERNAME, SMTP_PASSWORD)
        smtp.send_message(message)
