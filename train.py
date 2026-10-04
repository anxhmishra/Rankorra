import os
import joblib
import pandas as pd
import numpy as np
from catboost import CatBoostRegressor, Pool
from sklearn.model_selection import train_test_split

CSV_PATH = r"data\cutoffsfinal.csv"  # Updated to match your exact file location
BUNDLE_PATH = "model_bundle.pkl"

def train():
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Dataset '{CSV_PATH}' not found in the current directory.")

    print(f"[*] Loading dataset from {CSV_PATH}...")
    df = pd.read_csv(CSV_PATH)

    # Standardize column names
    col_map = {c: c.strip().lower().replace(" ", "_") for c in df.columns}
    df.rename(columns=col_map, inplace=True)

    # 1. Purge Architecture and Planning rows
    initial_len = len(df)
    branch_col = 'branch' if 'branch' in df.columns else 'academic_program_name'
    df = df[~df[branch_col].astype(str).str.contains('Architecture|Planning', case=False, na=False)].copy()
    print(f"[+] Dropped {initial_len - len(df)} Architecture & Planning rows.")

    # 2. Tag Institute Types and Exam Type
    inst_col = 'institute' if 'institute' in df.columns else 'institute_name'
    is_iit = df[inst_col].str.contains('Indian Institute of Technology', case=False, na=False) & \
             ~df[inst_col].str.contains('Information', case=False, na=False)

    df['exam_type'] = np.where(is_iit, 'JEE_ADVANCED', 'JEE_MAINS')

    # 3. Clean numeric ranks (Raw string r'\d+' applied to fix Python 3.12 syntax warning)
    rank_col = 'closing_rank' if 'closing_rank' in df.columns else 'close_rank'
    df[rank_col] = pd.to_numeric(df[rank_col].astype(str).str.replace(',', '').str.extract(r'(\d+)')[0], errors='coerce')
    df = df.dropna(subset=[rank_col]).copy()
    df[rank_col] = df[rank_col].astype(int)

    # 4. Feature Selection
    cat_features = [inst_col, branch_col, 'quota', 'category', 'gender', 'exam_type']
    for col in cat_features:
        if col not in df.columns:
            # Map standard alternative column names
            if col == 'category' and 'seat_type' in df.columns:
                df['category'] = df['seat_type']
            elif col == 'gender' and 'gender_pool' in df.columns:
                df['gender'] = df['gender_pool']

    df[cat_features] = df[cat_features].fillna("NA").astype(str)

    X = df[cat_features]
    y = df[rank_col]

    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15, random_state=42)

    print(f"[*] Training CatBoost model on {len(X_train)} samples across {len(cat_features)} features...")
    train_pool = Pool(X_train, y_train, cat_features=cat_features)
    val_pool = Pool(X_val, y_val, cat_features=cat_features)

    model = CatBoostRegressor(
        iterations=600,
        learning_rate=0.08,
        depth=6,
        loss_function='RMSE',
        verbose=100,
        random_seed=42
    )

    model.fit(train_pool, eval_set=val_pool, early_stopping_rounds=40)

    # 5. Save model bundle
    bundle = {
        "model": model,
        "cat_features": cat_features,
        "features": {
            "institute_col": inst_col,
            "branch_col": branch_col,
            "rank_col": rank_col
        }
    }

    joblib.dump(bundle, BUNDLE_PATH)
    print(f"[✓] Model trained and saved successfully to '{BUNDLE_PATH}'")

if __name__ == "__main__":
    train()