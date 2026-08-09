"""SQLAlchemy ORM models."""
import datetime as dt

from sqlalchemy import (Boolean, Column, DateTime, Float, ForeignKey, Integer,
                        String, Text)
from sqlalchemy.orm import relationship

from backend.database import Base


def now():
    """Return UTC without tzinfo for the existing timezone-naive DB columns."""
    return dt.datetime.now(dt.UTC).replace(tzinfo=None)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, default="")
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="farmer")  # admin | researcher | farmer
    language = Column(String, default="th")
    auth_version = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=now)
    reset_token = Column(String, nullable=True)

    predictions = relationship("Prediction", back_populates="user")


class Field(Base):
    __tablename__ = "fields"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    name_th = Column(String, default="")
    province = Column(String, default="")
    variety = Column(String, default="KU50")           # cassava variety
    area_rai = Column(Float, default=10.0)             # Thai rai
    plant_count = Column(Integer, default=16000)
    planted_at = Column(DateTime, default=now)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    boundary_json = Column(Text, nullable=False)       # GeoJSON polygon coords
    health_score = Column(Float, default=85.0)         # 0..100
    risk_level = Column(String, default="low")         # low | medium | high
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    predictions = relationship("Prediction", back_populates="field")
    alerts = relationship("Alert", back_populates="field")
    soil_samples = relationship(
        "SoilSample", back_populates="field", cascade="all, delete-orphan"
    )


class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=now, index=True)
    source = Column(String, default="leaf")            # leaf | plant | canopy | csv
    filename = Column(String, default="")
    image_path = Column(String, default="")
    heatmap_path = Column(String, default="")
    top_class = Column(String, index=True)
    confidence = Column(Float, default=0.0)
    probs_json = Column(Text, default="{}")            # full distribution
    auxiliary_json = Column(Text, default="[]")        # independent auxiliary model findings
    symptoms_json = Column(Text, default="[]")
    features_json = Column(Text, default="{}")         # feature importance
    explanation = Column(Text, default="")
    explanation_th = Column(Text, default="")
    inference_ms = Column(Float, default=0.0)
    model_id = Column(String, default="")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)

    user = relationship("User", back_populates="predictions")
    field = relationship("Field", back_populates="predictions")


class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=now, index=True)
    kind = Column(String, default="disease")   # disease | nutrient | water | weather | system
    severity = Column(String, default="medium")  # info | medium | high
    title = Column(String, default="")
    title_th = Column(String, default="")
    message = Column(Text, default="")
    message_th = Column(Text, default="")
    read = Column(Boolean, default=False)
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=True)

    field = relationship("Field", back_populates="alerts")


class AlertRead(Base):
    __tablename__ = "alert_reads"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), primary_key=True)
    read_at = Column(DateTime, default=now, nullable=False)


class LogEntry(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=now, index=True)
    level = Column(String, default="INFO")
    method = Column(String, default="")
    path = Column(String, default="")
    status_code = Column(Integer, default=200)
    duration_ms = Column(Float, default=0.0)
    user_email = Column(String, default="")


class SoilSample(Base):
    """A real field/laboratory measurement; no generated values are stored here."""

    __tablename__ = "soil_samples"
    id = Column(Integer, primary_key=True)
    sampled_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=now, nullable=False)
    source = Column(String, nullable=False, default="lab")  # lab | sensor | field_kit
    lab_name = Column(String, default="")
    texture = Column(String, default="")
    ph = Column(Float, nullable=True)
    om_pct = Column(Float, nullable=True)
    n_ppm = Column(Float, nullable=True)
    p_ppm = Column(Float, nullable=True)
    k_ppm = Column(Float, nullable=True)
    cec = Column(Float, nullable=True)
    moisture_pct = Column(Float, nullable=True)
    notes = Column(Text, default="")
    field_id = Column(Integer, ForeignKey("fields.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    field = relationship("Field", back_populates="soil_samples")
