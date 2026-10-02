import io
import pandas as pd
from engine import generate_optimized_choices
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

app = FastAPI(
    title="JoSAA/CSAB Choice-List Optimizer API",
    description=(
        "Elite Hackathon MVP Powered by CatBoost Quantile Ensembles & Risk"
        " Auditing"
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentProfile(BaseModel):
  rank: int = Field(..., example=12000)
  category: str = Field(..., example="OPEN")
  gender: str = Field(..., example="Gender-Neutral")
  preferred_branch: str = Field(..., example="Computer Science")
  quota: str = Field(default="AI", example="AI")


@app.get("/")
def home():
  return {
      "status": "Online",
      "message": "Elite CatBoost Counselling API is running. Go to /docs for UI.",
  }


@app.post("/api/optimize-choices")
def optimize_choices(profile: StudentProfile):
  try:
    response = generate_optimized_choices(
        student_rank=profile.rank,
        category=profile.category,
        gender=profile.gender,
        preferred_branch=profile.preferred_branch,
        quota=profile.quota,
    )
    return response
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/export-choice-list-csv")
def export_choice_list_csv(profile: StudentProfile):
  try:
    response_data = generate_optimized_choices(
        student_rank=profile.rank,
        category=profile.category,
        gender=profile.gender,
        preferred_branch=profile.preferred_branch,
        quota=profile.quota,
    )

    if "error" in response_data or "message" in response_data:
      return response_data

    choice_df = pd.DataFrame(response_data["optimized_choice_list"])

    export_columns = {
        "institute": "Institute Name",
        "branch": "Academic Program / Branch",
        "final_round_analyzed": "Reference Round",
        "expected_closing_rank": "Expected Closing Rank",
        "optimistic_best_case_rank": "Optimistic Best-Case Rank",
        "conservative_worst_case_rank": "Conservative Worst-Case Rank",
        "admission_probability_percent": "Admission Probability (%)",
        "status": "Risk Status",
        "rank_margin": "Rank Margin",
    }
    choice_df = choice_df.rename(columns=export_columns)

    stream = io.StringIO()
    choice_df.to_csv(stream, index=False)
    response = StreamingResponse(
        iter([stream.getvalue()]), media_type="text/csv"
    )
    response.headers["Content-Disposition"] = (
        "attachment; filename=josaa_elite_choice_list.csv"
    )
    return response
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))