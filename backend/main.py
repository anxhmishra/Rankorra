import os
import joblib
import pandas as pd
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engine import optimize_choices

app = FastAPI(
    title="GOATLIKE Backend API",
    description="JEE Choice Optimization Engine with CatBoost ML",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://rankorra.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/api/college-insights")
async def get_college_insights(institute: str):
    # Your TinyFish / insights extraction logic
    return {
        "institute": institute,
        "avg_package": "18.5 LPA",
        "highest_package": "52 LPA",
        "top_recruiter": "Google, Microsoft, Amazon",
        "fee_structure": "₹5.5 Lakhs (4 Years)"
    }

DATA_PATH = r"data\cutoffsfinal.csv"
BUNDLE_PATH = "model_bundle.pkl"

df_cutoffs = pd.DataFrame()
model_bundle = None

@app.on_event("startup")
def load_assets():
    global df_cutoffs, model_bundle
    if os.path.exists(DATA_PATH):
        # Added low_memory=False to silence the pandas DtypeWarning
        df_cutoffs = pd.read_csv(DATA_PATH, low_memory=False)
        
        # FIX: Standardize column names exactly like we did in train.py
        col_map = {c: str(c).strip().lower().replace(" ", "_") for c in df_cutoffs.columns}
        df_cutoffs.rename(columns=col_map, inplace=True)
        
        print(f"[+] Loaded dataset: {len(df_cutoffs)} rows.")
    else:
        print(f"[!] Warning: {DATA_PATH} not found.")

    if os.path.exists(BUNDLE_PATH):
        model_bundle = joblib.load(BUNDLE_PATH)
        print(f"[+] Loaded CatBoost model bundle successfully.")
    else:
        print(f"[!] Warning: {BUNDLE_PATH} not found. Running in rule-based fallback mode.")

class StudentProfile(BaseModel):
    mains_rank: int
    advanced_rank: Optional[int] = None
    category: str
    quota: str
    gender: str
    preferred_branch: str = "All Branches (Any Discipline)"

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "dataset_loaded": not df_cutoffs.empty,
        "catboost_loaded": model_bundle is not None
    }

@app.post("/api/optimize-choices")
def get_optimized_choices(profile: StudentProfile):
    if df_cutoffs.empty:
        raise HTTPException(status_code=500, detail="Cutoff dataset not available on the server.")

    recommendations = optimize_choices(
        mains_rank=profile.mains_rank,
        advanced_rank=profile.advanced_rank,
        category=profile.category,
        quota=profile.quota,
        gender=profile.gender,
        preferred_branch=profile.preferred_branch,
        df=df_cutoffs,
        model_bundle=model_bundle
    )

    return recommendations