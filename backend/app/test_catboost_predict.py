import json
import pickle
import pandas as pd
from pathlib import Path
from catboost import Pool

APP_DIR = Path(__file__).resolve().parent
BUNDLE_PATH = APP_DIR / "cutoff_model_bundle.pkl"
SAMPLE_PATH = APP_DIR / "sample_response.json"

print(f"Loading bundle from {BUNDLE_PATH}...")
with open(BUNDLE_PATH, "rb") as f:
    bundle = pickle.load(f)

model_median = bundle.get("model_median")
cat_features = bundle.get("cat_features", ['institute', 'academic_program_name', 'quota', 'seat_type', 'gender'])

# Test single row input
test_data = [{
    "round": 6,
    "year": 2025,
    "quota": "AI",
    "seat_type": "OBC-NCL",
    "gender": "Gender-Neutral",
    "is_iit": 1,
    "institute": "Indian Institute of Technology Bombay",
    "academic_program_name": "Civil Engineering (4 Years, Bachelor of Technology)",
    "rank_velocity": 0.0,
    "prev_year_closing_rank": 5000
}]

df = pd.DataFrame(test_data)
for col in cat_features:
    df[col] = df[col].astype(str)

print("\nTesting CatBoost prediction...")
try:
    pool = Pool(df, cat_features=cat_features)
    pred = model_median.predict(pool)
    print("SUCCESS! Predicted Rank:", pred)
except Exception as e:
    print("\n[CATBOOST PREDICTION ERROR]:", e)