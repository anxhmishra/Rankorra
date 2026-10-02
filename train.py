import os
import joblib
import numpy as np
import pandas as pd
from catboost import CatBoostRegressor
from sklearn.metrics import mean_absolute_error, r2_score

os.makedirs("models", exist_ok=True)
os.makedirs("data", exist_ok=True)

data_path = os.path.join("data", "cutoffsfinal.csv")
if not os.path.exists(data_path):
  print("❌ Error: Place your 'cutoffsfinal.csv' inside the 'data/' folder first!")
  exit()

print("Loading dataset for Elite CatBoost + Quantile Regression training...")
df = pd.read_csv(data_path, low_memory=False)
df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

df["closing_rank"] = pd.to_numeric(df["closing_rank"], errors="coerce")
df["year"] = pd.to_numeric(df["year"], errors="coerce")
df["round"] = pd.to_numeric(df["round"], errors="coerce")
df = df.dropna(
    subset=[
        "closing_rank",
        "round",
        "year",
        "institute",
        "academic_program_name",
    ]
)

# --- FIX: Fill missing values in categorical columns to prevent NaN errors ---
categorical_features = [
    "institute",
    "academic_program_name",
    "quota",
    "seat_type",
    "gender",
]
for col in categorical_features:
  df[col] = df[col].fillna("UNKNOWN").astype(str)

# Feature 1: Separate IITs from NITs/IIITs
df["is_iit"] = (
    df["institute"].str.contains("Indian Institute of Technology", case=False)
).astype(int)

# Feature 2: Rank Velocity (Year-over-Year Drift)
df = df.sort_values(by=["year", "round"])
df["prev_year_closing_rank"] = df.groupby([
    "institute",
    "academic_program_name",
    "quota",
    "seat_type",
    "gender",
    "round",
])["closing_rank"].shift(1)
df["rank_velocity"] = (df["closing_rank"] - df["prev_year_closing_rank"]).fillna(
    0
)

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

df["log_closing_rank"] = np.log1p(df["closing_rank"])

max_year = df["year"].max()
train_df = df[df["year"] < max_year]
val_df = df[df["year"] == max_year]

X_train = train_df[features]
y_train = train_df["log_closing_rank"]
X_val = val_df[features]
y_val_actual = val_df["closing_rank"]

print("Training CatBoost Median Regressor (Expected Ranks)...")
model_median = CatBoostRegressor(
    iterations=600,
    learning_rate=0.05,
    depth=6,
    loss_function="RMSE",
    cat_features=categorical_features,
    random_seed=42,
    verbose=100,
)
model_median.fit(
    X_train,
    y_train,
    eval_set=(X_val, val_df["log_closing_rank"]),
    early_stopping_rounds=50,
)

print(
    "Training CatBoost Quantile Models for Confidence Bounds (10th and 90th"
    " Percentiles)..."
)
model_lower = CatBoostRegressor(
    iterations=400,
    learning_rate=0.05,
    depth=6,
    loss_function="Quantile:alpha=0.1",
    cat_features=categorical_features,
    random_seed=42,
    verbose=False,
)
model_lower.fit(X_train, y_train)

model_upper = CatBoostRegressor(
    iterations=400,
    learning_rate=0.05,
    depth=6,
    loss_function="Quantile:alpha=0.9",
    cat_features=categorical_features,
    random_seed=42,
    verbose=False,
)
model_upper.fit(X_train, y_train)

# Validation Metrics
preds_log = model_median.predict(X_val)
preds_actual = np.expm1(preds_log)
mae = mean_absolute_error(y_val_actual, preds_actual)
r2 = r2_score(y_val_actual, preds_actual)

print("========================================")
print(f"🎯 Elite CatBoost Validation Results ({max_year}):")
print(f"   - Mean Absolute Error (MAE): ±{mae:.2f} ranks")
print(f"   - R² Accuracy Score: {r2:.4f}")
print("========================================")

print("Retraining final models on 100% of historical data...")
X_full = df[features]
y_full = df["log_closing_rank"]

model_median.fit(X_full, y_full, verbose=False)
model_lower.fit(X_full, y_full, verbose=False)
model_upper.fit(X_full, y_full, verbose=False)

bundle = {
    "model_median": model_median,
    "model_lower": model_lower,
    "model_upper": model_upper,
    "validation_mae": mae,
    "features": features,
    "cat_features": categorical_features,
}

joblib.dump(bundle, "models/cutoff_model_bundle.pkl")
print("✅ Elite CatBoost + Quantile bundle saved successfully!")