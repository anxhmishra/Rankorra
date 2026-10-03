import json
import math
import pickle
import traceback
from pathlib import Path
from typing import Any, Dict, List

APP_DIR = Path(__file__).parent
BUNDLE_PATH = APP_DIR / "cutoff_model_bundle.pkl"
SAMPLE_PATH = APP_DIR / "sample_response.json"

_loaded_bundle = None

# Baseline choice set evaluated if sample_response.json is unavailable
DEFAULT_CHOICES = [
    {
        "institute": "Indian Institute of Technology Bombay",
        "branch": "Computer Science and Engineering (4 Years, Bachelor of Technology)",
        "expected_closing_rank": 68
    },
    {
        "institute": "Indian Institute of Technology Bombay",
        "branch": "Civil Engineering (4 Years, Bachelor of Technology)",
        "expected_closing_rank": 3500
    },
    {
        "institute": "Indian Institute of Technology Delhi",
        "branch": "Civil Engineering (4 Years, Bachelor of Technology)",
        "expected_closing_rank": 4200
    },
    {
        "institute": "Indian Institute of Technology Kharagpur",
        "branch": "Civil Engineering (4 Years, Bachelor of Technology)",
        "expected_closing_rank": 5800
    },
    {
        "institute": "National Institute of Technology Tiruchirappalli",
        "branch": "Computer Science and Engineering (4 Years, Bachelor of Technology)",
        "expected_closing_rank": 1500
    },
    {
        "institute": "National Institute of Technology Tiruchirappalli",
        "branch": "Civil Engineering (4 Years, Bachelor of Technology)",
        "expected_closing_rank": 18000
    }
]

def load_model():
    """Loads the CatBoost bundle into memory."""
    global _loaded_bundle
    if _loaded_bundle is not None:
        return _loaded_bundle

    if BUNDLE_PATH.exists():
        try:
            with open(BUNDLE_PATH, "rb") as f:
                _loaded_bundle = pickle.load(f)
            print("[Info] CatBoost bundle active.")
            return _loaded_bundle
        except Exception as e:
            print(f"[Warning] Failed to load cutoff_model_bundle.pkl: {e}")

    print("[Info] Operating in fallback mode.")
    return None

# Compatibility aliases
load_model_bundle = load_model
load_pickle_model = load_model

def get_candidate_choices() -> List[Dict[str, Any]]:
    """Loads candidate choices from sample_response.json or returns default fallback."""
    if SAMPLE_PATH.exists():
        try:
            with open(SAMPLE_PATH, "r") as f:
                data = json.load(f)
                choices = data.get("optimized_choice_list") or data.get("results") or []
                if choices:
                    return choices
        except Exception as e:
            print(f"[Warning] Error reading sample_response.json: {e}")
    return DEFAULT_CHOICES

def run_model(payload: Dict[str, Any]) -> Dict[str, Any]:
    bundle = load_model()

    candidate_choices = get_candidate_choices()
    user_rank = payload.get("rank", 5000)
    category = payload.get("category", "OPEN")
    gender = payload.get("gender", "Gender-Neutral")
    quota = payload.get("quota", "AI")
    preferred_branch = payload.get("preferred_branch", "").strip().lower()

    if bundle is not None and isinstance(bundle, dict):
        try:
            import pandas as pd
            from catboost import Pool

            model_median = bundle.get("model_median")
            model_lower = bundle.get("model_lower")
            model_upper = bundle.get("model_upper")
            cat_features = bundle.get(
                "cat_features",
                ['institute', 'academic_program_name', 'quota', 'seat_type', 'gender']
            )

            rows = []
            for choice in candidate_choices:
                institute_name = str(choice.get("institute", "IIT"))
                branch_name = str(choice.get("branch") or choice.get("academic_program_name", "Engineering"))
                is_iit_flag = 1 if ("iit" in institute_name.lower() or "indian institute of technology" in institute_name.lower()) else 0
                prev_rank = choice.get("expected_closing_rank") or choice.get("expectedClosingRank", user_rank)

                rows.append({
                    "round": 6,
                    "year": 2025,
                    "quota": str(quota),
                    "seat_type": str(category),
                    "gender": str(gender),
                    "is_iit": is_iit_flag,
                    "institute": institute_name,
                    "academic_program_name": branch_name,
                    "rank_velocity": 0.0,
                    "prev_year_closing_rank": math.log(max(1, int(prev_rank)))
                })

            df = pd.DataFrame(rows)

            expected_features = [
                'round', 'year', 'quota', 'seat_type', 'gender',
                'is_iit', 'institute', 'academic_program_name',
                'rank_velocity', 'prev_year_closing_rank'
            ]
            df = df[expected_features]

            for col in cat_features:
                if col in df.columns:
                    df[col] = df[col].astype(str)

            eval_pool = Pool(df, cat_features=cat_features)

            pred_median = model_median.predict(eval_pool) if model_median else [math.log(user_rank)] * len(df)
            pred_lower = model_lower.predict(eval_pool) if model_lower else pred_median
            pred_upper = model_upper.predict(eval_pool) if model_upper else pred_median

            updated_choices = []
            safe_cnt, target_cnt, reach_cnt = 0, 0, 0

            for i, choice in enumerate(candidate_choices):
                # Inverse exponentiation converting log predictions to true rank values
                exp_rank = int(round(math.exp(float(pred_median[i]))))
                best_rank = int(round(math.exp(float(pred_lower[i]))))
                worst_rank = int(round(math.exp(float(pred_upper[i]))))

                rank_margin = exp_rank - user_rank
                if rank_margin >= 1000:
                    status = "SAFE"
                    prob = min(99.0, max(85.0, 85.0 + (rank_margin / 100)))
                    safe_cnt += 1
                elif rank_margin >= -500:
                    status = "TARGET"
                    prob = min(84.0, max(50.0, 65.0 + (rank_margin / 50)))
                    target_cnt += 1
                else:
                    status = "REACH"
                    prob = max(5.0, min(49.0, 30.0 + (rank_margin / 50)))
                    reach_cnt += 1

                choice_branch = str(choice.get("branch") or choice.get("academic_program_name", ""))
                is_branch_match = preferred_branch in choice_branch.lower() if preferred_branch else True

                choice_copy = {
                    "institute": choice.get("institute", ""),
                    "branch": choice_branch,
                    "quota": str(quota),
                    "finalRound": 6,
                    "expected_closing_rank": exp_rank,
                    "optimistic_best_case_rank": min(best_rank, exp_rank),
                    "conservative_worst_case_rank": max(worst_rank, exp_rank),
                    "expectedClosingRank": exp_rank,
                    "bestCaseRank": min(best_rank, exp_rank),
                    "worstCaseRank": max(worst_rank, exp_rank),
                    "admission_probability_percent": round(prob, 1),
                    "probability": round(prob, 1),
                    "status": status.title(),
                    "rank_margin": rank_margin,
                    "rankMargin": rank_margin,
                    "branchMatch": is_branch_match
                }
                updated_choices.append(choice_copy)

            health = "Balanced"
            if reach_cnt > safe_cnt + target_cnt:
                health = "High Risk"
            elif safe_cnt > reach_cnt + target_cnt:
                health = "Conservative"

            return {
                "summary": {
                    "total": len(updated_choices),
                    "year": 2025,
                    "safe": safe_cnt,
                    "target": target_cnt,
                    "reach": reach_cnt,
                    "health": health
                },
                "results": updated_choices,
                "total_unique_choices_found": len(updated_choices),
                "latest_year_reference": 2025,
                "portfolio_risk_audit": {
                    "safe_options": safe_cnt,
                    "target_options": target_cnt,
                    "reach_options": reach_cnt,
                    "portfolio_health": health
                },
                "optimized_choice_list": updated_choices
            }

        except Exception as err:
            print(f"[Error] CatBoost execution failed: {err}")
            traceback.print_exc()

    # Fallback return on exception
    return {
        "summary": {"total": 0, "year": 2025, "safe": 0, "target": 0, "reach": 0, "health": "Moderate"},
        "results": [],
        "total_unique_choices_found": 0,
        "latest_year_reference": 2025,
        "portfolio_risk_audit": {"safe_options": 0, "target_options": 0, "reach_options": 0, "portfolio_health": "Moderate"},
        "optimized_choice_list": []
    }