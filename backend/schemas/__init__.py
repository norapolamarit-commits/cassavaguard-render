"""Pydantic request/response schemas."""
import datetime as dt
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, model_validator

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)
    full_name: str = Field(default="", max_length=120)
    language: str = "th"


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    token: str = Field(min_length=20, max_length=256)
    new_password: str = Field(min_length=10, max_length=128)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    language: Optional[str] = None


class FieldIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    name_th: str = Field(default="", max_length=120)
    province: str = Field(default="", max_length=120)
    variety: str = Field(default="KU50", max_length=80)
    area_rai: float = Field(default=10.0, gt=0, le=100000)
    lat: float = Field(ge=-90, le=90)
    lon: float = Field(ge=-180, le=180)


class RoleUpdate(BaseModel):
    role: str


class SoilSampleIn(BaseModel):
    sampled_at: dt.datetime
    source: str = Field(default="lab", pattern="^(lab|sensor|field_kit)$")
    lab_name: str = Field(default="", max_length=160)
    texture: str = Field(default="", max_length=80)
    ph: Optional[float] = Field(default=None, ge=0, le=14)
    om_pct: Optional[float] = Field(default=None, ge=0, le=100)
    n_ppm: Optional[float] = Field(default=None, ge=0, le=100000)
    p_ppm: Optional[float] = Field(default=None, ge=0, le=100000)
    k_ppm: Optional[float] = Field(default=None, ge=0, le=100000)
    cec: Optional[float] = Field(default=None, ge=0, le=200)
    moisture_pct: Optional[float] = Field(default=None, ge=0, le=100)
    notes: str = Field(default="", max_length=2000)

    @model_validator(mode="after")
    def require_measurement(self):
        metrics = (
            self.ph,
            self.om_pct,
            self.n_ppm,
            self.p_ppm,
            self.k_ppm,
            self.cec,
            self.moisture_pct,
        )
        if all(value is None for value in metrics):
            raise ValueError("At least one measured soil value is required")
        return self
