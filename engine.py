import numpy as np
import pandas as pd

def optimize_choices(
    mains_rank: int,
    category: str,
    quota: str,
    gender: str,
    preferred_branch: str,
    df: pd.DataFrame,
    model_bundle: dict = None,
    advanced_rank: int = None
):
    sub_df = df.copy()

    # FIX: Ensure ML model can find exactly 'category' and 'gender' before inference
    if 'category' not in sub_df.columns and 'seat_type' in sub_df.columns:
        sub_df['category'] = sub_df['seat_type']
    if 'gender' not in sub_df.columns and 'gender_pool' in sub_df.columns:
        sub_df['gender'] = sub_df['gender_pool']

    # 1. Clean dataset: purge Architecture and Planning
    branch_col = 'branch' if 'branch' in sub_df.columns else 'academic_program_name'
    inst_col = 'institute' if 'institute' in sub_df.columns else 'institute_name'
    rank_col = 'closing_rank' if 'closing_rank' in sub_df.columns else 'close_rank'

    sub_df = sub_df[~sub_df[branch_col].astype(str).str.contains('Architecture|Planning', case=False, na=False)]

    # 2. Assign Institutional Hierarchy
    cond_iit = sub_df[inst_col].str.contains('Indian Institute of Technology', case=False, na=False) & \
               ~sub_df[inst_col].str.contains('Information', case=False, na=False)
    cond_nit = sub_df[inst_col].str.contains('National Institute of Technology', case=False, na=False)
    cond_iiit = sub_df[inst_col].str.contains('Indian Institute of Information Technology', case=False, na=False)

    # Weights: IIT=1, NIT=2, IIIT=3, GFTI/Other=4
    sub_df['inst_weight'] = np.select([cond_iit, cond_nit, cond_iiit], [1, 2, 3], default=4)
    sub_df['exam_type'] = np.where(cond_iit, 'JEE_ADVANCED', 'JEE_MAINS')

    # 3. Dynamic Rank Assignment (Advanced vs Mains)
    if advanced_rank is None or advanced_rank <= 0:
        sub_df = sub_df[~cond_iit].copy()
        cond_iit = sub_df[inst_col].str.contains('Indian Institute of Technology', case=False, na=False) & \
                   ~sub_df[inst_col].str.contains('Information', case=False, na=False)

    sub_df['student_applicable_rank'] = np.where(cond_iit, advanced_rank, mains_rank)

    # 4. Filter by student demographics
    sub_df = sub_df[
        (sub_df['category'].astype(str).str.upper() == category.upper()) &
        (sub_df['quota'].astype(str).str.upper() == quota.upper()) &
        (sub_df['gender'].astype(str).str.upper() == gender.upper())
    ]

    if preferred_branch and "All Branches" not in preferred_branch:
        sub_df = sub_df[sub_df[branch_col].str.contains(preferred_branch, case=False, na=False)]

    if sub_df.empty:
        return []

    # Clean historical closing rank
    sub_df[rank_col] = pd.to_numeric(sub_df[rank_col].astype(str).str.replace(',', '').str.extract(r'(\d+)')[0], errors='coerce')
    sub_df = sub_df.dropna(subset=[rank_col])

    # 5. CatBoost Inference
    if model_bundle and "model" in model_bundle:
        model = model_bundle["model"]
        cat_features = model_bundle.get("cat_features", [inst_col, branch_col, 'quota', 'category', 'gender', 'exam_type'])
        
        feat_df = sub_df[cat_features].fillna("NA").astype(str)
        sub_df['predicted_cutoff'] = model.predict(feat_df)
    else:
        sub_df['predicted_cutoff'] = sub_df[rank_col]

    # 6. Classification: Safe, Target, Reach
    sub_df['effective_cutoff'] = (0.6 * sub_df[rank_col]) + (0.4 * sub_df['predicted_cutoff'])
    sub_df['margin'] = sub_df['effective_cutoff'] - sub_df['student_applicable_rank']

    conditions = [
        sub_df['margin'] >= 0,                                   # Safe
        (sub_df['margin'] < 0) & (sub_df['margin'] >= -1800),     # Target
        (sub_df['margin'] < -1800) & (sub_df['margin'] >= -4500)  # Reach
    ]
    sub_df['chance'] = np.select(conditions, ['Safe', 'Target', 'Reach'], default='Drop')
    sub_df['chance_weight'] = np.select(conditions, [1, 2, 3], default=4)

    sub_df = sub_df[sub_df['chance'] != 'Drop']

    # 7. The 3k-Bucketing Sort
    sub_df['abs_margin'] = sub_df['margin'].abs()
    
    # Divide into 3k buckets (e.g., 0-2999 difference = Bucket 0, 3000-5999 = Bucket 1)
    sub_df['margin_bucket'] = sub_df['abs_margin'] // 3000

    # Sort Priority:
    # 1. Chance Tier (Safe -> Target -> Reach)
    # 2. 3k Range Bucket (0-3k before 3k-6k)
    # 3. Institute Tier inside that 3k bucket (IITs -> NITs -> IIITs -> GFTIs)
    # 4. Exact closeness (Tightest margin bubbles up inside the specific tier)
    sub_df = sub_df.sort_values(
        by=['chance_weight', 'margin_bucket', 'inst_weight', 'abs_margin'],
        ascending=[True, True, True, True]
    )

    # Output capped at top 150 choices to ensure snappy frontend performance
    sub_df = sub_df.head(150)

    # 8. Output Serialization
    results = []
    for _, row in sub_df.iterrows():
        results.append({
            "institute": row[inst_col],
            "branch": row[branch_col],
            "closing_rank": int(row[rank_col]),
            "predicted_cutoff": int(row['predicted_cutoff']),
            "chance": row['chance'],
            "exam_evaluated": row['exam_type'],
            "category_tag": f"{category} ({quota})"
        })

    return results