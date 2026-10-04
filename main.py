import io
import logging
import os
import re
from typing import Literal

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

import engine  # owned by the model author; this file never touches model internals

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
log = logging.getLogger("seatwise")

API_VERSION = "2.1.0"
MODEL_VERSION = os.getenv("MODEL_VERSION", "unversioned")  # bump whenever the model changes
ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

app = FastAPI(title="SeatWise Choice-List API", version=API_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,  # exact origins only; never "*" together with credentials
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class StudentProfile(BaseModel):
    rank: int = Field(..., ge=1, le=2_000_000)
    category: str = Field(..., min_length=2, max_length=30)
    gender: str = Field(..., min_length=3, max_length=40)
    preferred_branch: str = Field(..., min_length=2, max_length=100)
    quota: Literal["AI", "HS", "OS", "GO", "JK", "LA"] = "AI"


def _run(p: StudentProfile) -> dict:
    """Adapter: calls the engine and normalises its output into one consistent contract."""
    try:
        res = engine.generate_optimized_choices(
            student_rank=p.rank, category=p.category, gender=p.gender,
            preferred_branch=re.escape(p.preferred_branch.strip()),  # engine treats this as a regex; escaping makes it literal
            quota=p.quota)
    except Exception:
        log.exception("engine crashed")  # details go to logs, never to the client
        raise HTTPException(status_code=500, detail="Prediction failed. Please try again later.")
    if "error" in res:
        log.error("engine not ready: %s", res["error"])
        raise HTTPException(status_code=503, detail="Prediction service is not ready.")
    if "message" in res:  # "no seats match" is a valid answer, not a failure
        return {"total_unique_choices_found": 0, "latest_year_reference": None,
                "portfolio_risk_audit": {"safe_options": 0, "target_options": 0, "reach_options": 0, "portfolio_health": None},
                "optimized_choice_list": [], "message": res["message"], "model_version": MODEL_VERSION}
    res["model_version"] = MODEL_VERSION
    return res


@app.get("/")
def home():
    return {"status": "Online", "docs": "/docs"}


@app.get("/health")
def health():
    ready = getattr(engine, "df_master", None) is not None and getattr(engine, "model_median", None) is not None
    body = {"status": "ok" if ready else "degraded", "api_version": API_VERSION, "model_version": MODEL_VERSION}
    return JSONResponse(body, status_code=200 if ready else 503)  # 503 makes host health checks fail honestly


@app.post("/api/optimize-choices")
def optimize_choices(profile: StudentProfile):
    return _run(profile)


@app.post("/api/export-choice-list-csv")
def export_choice_list_csv(profile: StudentProfile):
    data = _run(profile)
    if not data["optimized_choice_list"]:
        raise HTTPException(status_code=404, detail=data.get("message", "No results to export."))
    df = pd.DataFrame(data["optimized_choice_list"]).rename(columns={
        "institute": "Institute Name", "branch": "Academic Program / Branch", "final_round_analyzed": "Reference Round",
        "expected_closing_rank": "Expected Closing Rank", "optimistic_best_case_rank": "Optimistic Best-Case Rank",
        "conservative_worst_case_rank": "Conservative Worst-Case Rank", "admission_probability_percent": "Admission Probability (%)",
        "status": "Risk Status", "rank_margin": "Rank Margin"})
    buf = io.StringIO()
    df.to_csv(buf, index=False)
    resp = StreamingResponse(iter([buf.getvalue()]), media_type="text/csv")
    resp.headers["Content-Disposition"] = "attachment; filename=seatwise_choice_list.csv"
    return resp
