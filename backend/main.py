import os
import urllib.parse
import joblib
import pandas as pd
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

from engine import optimize_choices

# Load environment variables
load_dotenv()

TINYFISH_API_KEY = os.getenv("TINYFISH_API_KEY")

app = FastAPI(
    title="GOATLIKE Backend API",
    description="JEE Choice Optimization Engine with CatBoost ML and Tinyfish AI",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://rankorra.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_institute_fallback(institute_name: str) -> dict:
    """Generates tier-aware fallback placement & fee data based on college keywords."""
    name_upper = institute_name.upper()

    # Tier 1 Top IITs
    if any(k in name_upper for k in ["BOMBAY", "DELHI", "MADRAS", "KANPUR", "KHARAGPUR", "ROORKEE", "GUWAHATI"]):
        return {
            "avg_package": "₹21.5–25.0 LPA",
            "highest_package": "₹1.2–2.1 CR PA",
            "fee_structure": "₹8.5–10.0 Lakhs (4 Years)",
            "top_recruiter": "Google, Microsoft, Texas Instruments, Qualcomm, Goldman Sachs"
        }
    # Other IITs
    elif "INDIAN INSTITUTE OF TECHNOLOGY" in name_upper or "IIT" in name_upper:
        return {
            "avg_package": "₹15.5–19.5 LPA",
            "highest_package": "₹55.0–95.0 LPA",
            "fee_structure": "₹8.0–9.5 Lakhs (4 Years)",
            "top_recruiter": "Amazon, Microsoft, Nvidia, Intel, Oracle"
        }
    # Top Tier NITs & BITS
    elif any(k in name_upper for k in ["TRICHY", "SURATHKAL", "WARANGAL", "ROURKELA", "CALICUT", "PILANI"]):
        return {
            "avg_package": "₹15.0–18.5 LPA",
            "highest_package": "₹50.0–88.0 LPA",
            "fee_structure": "₹5.5–6.5 Lakhs (4 Years)",
            "top_recruiter": "Amazon, Deloitte, Samsung, Texas Instruments, DE Shaw"
        }
    # Other NITs & Top IIITs (e.g. IIIT Allahabad, IIIT Hyderabad)
    elif "NATIONAL INSTITUTE OF TECHNOLOGY" in name_upper or "NIT" in name_upper:
        return {
            "avg_package": "₹10.5–14.5 LPA",
            "highest_package": "₹35.0–52.0 LPA",
            "fee_structure": "₹5.0–6.2 Lakhs (4 Years)",
            "top_recruiter": "TCS, Infosys, Capgemini, L&T, Samsung, Amazon"
        }
    elif "TRIPLE I T" in name_upper or "IIIT" in name_upper or "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY" in name_upper:
        return {
            "avg_package": "₹14.0–22.0 LPA",
            "highest_package": "₹45.0–65.0 LPA",
            "fee_structure": "₹9.0–13.0 Lakhs (4 Years)",
            "top_recruiter": "Amazon, Atlassian, Uber, MathWorks, Adobe"
        }
    # Standard GFTIs & Other Engineering Colleges
    else:
        return {
            "avg_package": "₹8.5–12.0 LPA",
            "highest_package": "₹25.0–40.0 LPA",
            "fee_structure": "₹4.5–6.5 Lakhs (4 Years)",
            "top_recruiter": "TCS Ninja, Wipro, Cognizant, Tech Mahindra, Reliance"
        }


@app.get("/api/insights")
async def get_insights(institute: str = Query(...)):
    if not institute:
        raise HTTPException(status_code=400, detail="Institute parameter is required")

    print(f"[+] Launching Tinyfish Agent for: {institute}...")

    # Pre-generate tier-aware fallback estimations
    tier_fallback = get_institute_fallback(institute)

    if not TINYFISH_API_KEY:
        print("[!] TINYFISH_API_KEY missing from .env! Returning tier fallback.")
        return {
            "institute": institute,
            **tier_fallback,
            "note": "Displaying estimated data (TINYFISH_API_KEY missing)."
        }

    target_url = f"https://www.google.com/search?q={urllib.parse.quote(institute + ' placement average package fees recruiters')}"

    headers = {
        "Content-Type": "application/json",
        "X-API-Key": TINYFISH_API_KEY,
        "Authorization": f"Bearer {TINYFISH_API_KEY}"
    }

    payload = {
        "url": target_url,
        "goal": (
            f"Find placement and fee data for {institute}. "
            "Extract: average package, highest package, total course fees, and top recruiters. "
            "Return output as a key-value JSON object with keys: avg_package, highest_package, fee_structure, top_recruiter."
        )
    }

    endpoints = [
        "https://agent.tinyfish.ai/v1/automation/run",
        "https://agent.tinyfish.ai/v1/run",
        "https://api.tinyfish.ai/v1/run"
    ]

    async with httpx.AsyncClient(timeout=25.0) as client:
        last_error = ""
        for endpoint in endpoints:
            try:
                print(f"[+] Calling Tinyfish at: {endpoint}")
                response = await client.post(endpoint, headers=headers, json=payload)
                
                print(f"[+] Response status from {endpoint}: {response.status_code}")
                
                if response.status_code == 200:
                    res_data = response.json()
                    print(f"[+] Tinyfish raw response: {res_data}")

                    extracted = res_data.get("result") or res_data.get("output") or res_data.get("data") or res_data

                    if isinstance(extracted, str):
                        return {
                            "institute": institute,
                            "avg_package": tier_fallback["avg_package"],
                            "highest_package": tier_fallback["highest_package"],
                            "fee_structure": tier_fallback["fee_structure"],
                            "top_recruiter": extracted
                        }

                    return {
                        "institute": institute,
                        "avg_package": extracted.get("avg_package") or extracted.get("avgPackage") or tier_fallback["avg_package"],
                        "highest_package": extracted.get("highest_package") or extracted.get("highestPackage") or tier_fallback["highest_package"],
                        "fee_structure": extracted.get("fee_structure") or extracted.get("fees") or tier_fallback["fee_structure"],
                        "top_recruiter": extracted.get("top_recruiter") or extracted.get("topRecruiters") or tier_fallback["top_recruiter"],
                    }
                elif response.status_code == 404:
                    last_error = f"404 Not Found at {endpoint}"
                    continue
                else:
                    print(f"[!] Tinyfish returned status {response.status_code}. Falling back to tier estimations.")
                    return {
                        "institute": institute,
                        **tier_fallback,
                        "note": f"Tinyfish returned HTTP {response.status_code}. Displaying tier estimation."
                    }

            except httpx.TimeoutException:
                print(f"[!] 504 Timeout on {endpoint} after 25s. Returning tier fallback for {institute}.")
                return {
                    "institute": institute,
                    **tier_fallback,
                    "note": "Tinyfish agent timed out (504). Displaying tier estimation."
                }
            except httpx.RequestError as exc:
                last_error = str(exc)

        # If all endpoints were unreachable or errored without a 200 response
        print(f"[!] All endpoints failed ({last_error}). Returning tier fallback.")
        return {
            "institute": institute,
            **tier_fallback,
            "note": "Tinyfish agent unreachable. Displaying tier estimation."
        }


# Dataset and Model Paths
DATA_PATH = os.path.join("data", "cutoffsfinal.csv")
BUNDLE_PATH = "model_bundle.pkl"

df_cutoffs = pd.DataFrame()
model_bundle = None

@app.on_event("startup")
def load_assets():
    global df_cutoffs, model_bundle
    if os.path.exists(DATA_PATH):
        df_cutoffs = pd.read_csv(DATA_PATH, low_memory=False)
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