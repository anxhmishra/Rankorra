import os
import joblib
import numpy as np
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "cutoffsfinal.csv")
BUNDLE_PATH = os.path.join(BASE_DIR, "models", "cutoff_model_bundle.pkl")

df_master = None
model_median = None
model_lower = None
model_upper = None
validation_mae = 1800.0

print(f"🔍 Looking for dataset at: {DATA_PATH}")
if os.path.exists(DATA_PATH):
  df_master = pd.read_csv(DATA_PATH, low_memory=False)
  df_master.columns = (
      df_master.columns.str.strip().str.lower().str.replace(" ", "_")
  )
  df_master["closing_rank"] = pd.to_numeric(
      df_master["closing_rank"], errors="coerce"
  )
  df_master["year"] = pd.to_numeric(df_master["year"], errors="coerce")
  df_master["round"] = pd.to_numeric(df_master["round"], errors="coerce")
  print(f"✅ Successfully loaded dataset with {len(df_master)} rows.")
else:
  print(f"❌ CRITICAL ERROR: Dataset not found at {DATA_PATH}")

if os.path.exists(BUNDLE_PATH):
  bundle = joblib.load(BUNDLE_PATH)
  model_median = bundle["model_median"]
  model_lower = bundle["model_lower"]
  model_upper = bundle["model_upper"]
  validation_mae = bundle.get("validation_mae", 1800.0)
  print(
      f"✅ Loaded Elite CatBoost Bundle (Validation MAE: ±{validation_mae:.2f}"
      " ranks)."
  )
else:
  print("❌ CRITICAL ERROR: Model bundle not found. Run train.py first.")


def generate_optimized_choices(
    student_rank: int,
    category: str,
    gender: str,
    preferred_branch: str,
    quota: str = "AI",
):
  if df_master is None or df_master.empty:
    return {"error": "Dataset is missing or failed to load."}
  if model_median is None:
    return {"error": "CatBoost bundle is missing. Run 'python train.py'."}

  latest_year = df_master["year"].max()

  # Re-compute features across master dataset
  df_sorted = df_master.sort_values(by=["year", "round"])
  df_sorted["is_iit"] = (
      df_sorted["institute"].str.contains(
          "Indian Institute of Technology", case=False
      )
  ).astype(int)
  df_sorted["prev_year_closing_rank"] = df_sorted.groupby([
      "institute",
      "academic_program_name",
      "quota",
      "seat_type",
      "gender",
      "round",
  ])["closing_rank"].shift(1)
  df_sorted["rank_velocity"] = (
      df_sorted["closing_rank"] - df_sorted["prev_year_closing_rank"]
  ).fillna(0)

  # Filter for latest year and user criteria
  filtered = df_sorted[df_sorted["year"] == latest_year].copy()
  filtered = filtered[
      (filtered["seat_type"].str.strip().str.upper() == category.upper())
      & (filtered["gender"].str.strip().str.lower() == gender.lower())
      & (filtered["quota"].str.strip().str.upper() == quota.upper())
  ].copy()

  if filtered.empty:
    return {"message": "No colleges match the base eligibility criteria."}

  features = [
      "round",
      "year",
      "quota",
      "seat_type",
      "gender",
      "is_iit",
      "institute",
      "academic_program_name",
      "rank_velocity",
      "prev_year_closing_rank",
  ]
  X_filtered = filtered[features]

  # Predict expected, optimistic, and conservative ranks using quantile models
  filtered["expected_closing_rank"] = np.expm1(model_median.predict(X_filtered))
  filtered["optimistic_rank"] = np.expm1(model_lower.predict(X_filtered))
  filtered["conservative_rank"] = np.expm1(model_upper.predict(X_filtered))

  filtered["rank_margin"] = (
      filtered["expected_closing_rank"] - student_rank
  )

  # Probabilistic Risk Scoring
  scale_factor = max(validation_mae, 300.0)
  filtered["admission_probability"] = (
      1 / (1 + np.exp(-filtered["rank_margin"] / scale_factor))
  ) * 100

  # Status Tagging
  def tag_status(prob, margin):
    if prob >= 70.0 or margin >= 2000:
      return "SAFE"
    elif 25.0 <= prob < 70.0 or -3000 <= margin < 2000:
      return "TARGET"
    elif 10.0 <= prob < 25.0 or -8000 <= margin < -3000:
      return "REACH"
    else:
      return "UNLIKELY"

  filtered["status"] = filtered.apply(
      lambda row: tag_status(
          row["admission_probability"], row["rank_margin"]
      ),
      axis=1,
  )

  # CRITICAL FIX: Drop completely unlikely/impossible options so junk data is gone
  viable = filtered[filtered["status"] != "UNLIKELY"].copy()

  if viable.empty:
    return {"message": "Rank is too low for available seats in this category."}

  # Preference Scoring
  viable["branch_match"] = (
      viable["academic_program_name"]
      .str.contains(preferred_branch, case=False, na=False)
      .astype(int)
  )

  # --- SMART PROXIMITY & PRESTIGE SCORING ---
  # 1. Heavily rewards branch match
  # 2. Rewards colleges whose closing rank is closest to student rank (minimizing distance)
  # 3. Among similar ranks, favors lower closing rank numbers (better/more prestigious institutes)
  viable["distance_penalty"] = np.abs(
      viable["expected_closing_rank"] - student_rank
  )
  viable["prestige_bonus"] = (100000 - viable["expected_closing_rank"]) / 500

  viable["composite_score"] = (
      viable["branch_match"] * 50000
      - viable["distance_penalty"]
      + viable["prestige_bonus"]
  )

  sorted_df = viable.sort_values(by="composite_score", ascending=False)

  unique_choices = sorted_df.drop_duplicates(
      subset=["institute", "academic_program_name"], keep="first"
  )

  results = []
  safe_count, target_count, reach_count = 0, 0, 0

  for _, row in unique_choices.head(40).iterrows():
    status = row["status"]
    if status == "SAFE":
      safe_count += 1
    elif status == "TARGET":
      target_count += 1
    elif status == "REACH":
      reach_count += 1

    results.append({
        "institute": row["institute"],
        "branch": row["academic_program_name"],
        "final_round_analyzed": int(row["round"]),
        "expected_closing_rank": int(row["expected_closing_rank"]),
        "optimistic_best_case_rank": int(row["optimistic_rank"]),
        "conservative_worst_case_rank": int(row["conservative_rank"]),
        "admission_probability_percent": round(
            float(row["admission_probability"]), 1
        ),
        "status": status,
        "rank_margin": int(row["rank_margin"]),
        "branch_match": bool(row["branch_match"]),
    })

  portfolio_audit = {
      "safe_options": safe_count,
      "target_options": target_count,
      "reach_options": reach_count,
      "portfolio_health": (
          "Balanced"
          if (safe_count >= 2 and target_count >= 3)
          else "Needs More Safe/Target Backups"
      ),
  }

  return {
      "total_unique_choices_found": len(results),
      "latest_year_reference": int(latest_year),
      "portfolio_risk_audit": portfolio_audit,
      "optimized_choice_list": results,
  }