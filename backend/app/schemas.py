from pydantic import BaseModel, Field, field_validator
from typing import Literal

class PredictRequest(BaseModel):
    rank: int = Field(..., gt=0, description="JEE Main/Advanced rank (must be > 0)")
    category: str = Field("OPEN", description="JoSAA candidate category")
    gender: str = Field("Gender-Neutral", description="Gender quota type")
    preferred_branch: str = Field("Any", description="Target engineering branch")
    quota: str = Field("AI", description="Quota category: AI, HS, or OS")

    @field_validator("category")
    def validate_category(cls, v: str) -> str:
        valid_map = {
            "open": "OPEN",
            "gen": "OPEN",
            "general": "OPEN",
            "obc": "OBC-NCL",
            "obc-ncl": "OBC-NCL",
            "sc": "SC",
            "st": "ST",
            "ews": "GEN-EWS",
            "gen-ews": "GEN-EWS"
        }
        normalized = v.strip().lower()
        if normalized in valid_map:
            return valid_map[normalized]
        return v.upper()

    @field_validator("quota")
    def validate_quota(cls, v: str) -> str:
        allowed = {"AI", "HS", "OS"}
        val_upper = v.strip().upper()
        return val_upper if val_upper in allowed else "AI"