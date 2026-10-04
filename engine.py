def optimize_choices(user_rank, user_category, user_gender, preferred_branch, quota, df, model_bundle):
    norm_category = str(user_category).strip().upper()
    norm_quota = str(quota).strip().upper()
    norm_branch = str(preferred_branch).strip().upper()

    category_col = 'Category' if 'Category' in df.columns else 'Seat Type'
    closing_col = 'Closing_Rank'

    df_clean = df.copy()
    df_clean['clean_cat'] = df_clean[category_col].astype(str).str.strip().str.upper()
    df_clean['clean_quota'] = df_clean['Quota'].astype(str).str.strip().str.upper()

    # Filter for category + quota
    filtered_df = df_clean[
        (df_clean['clean_cat'] == norm_category) & 
        (df_clean['clean_quota'] == norm_quota)
    ]

    if filtered_df.empty:
        filtered_df = df_clean[df_clean['clean_quota'] == norm_quota]

    results = []

    for idx, row in filtered_df.iterrows():
        expected_rank = float(row[closing_col])
        
        # Strict category bounds check to prevent wild/worst-case hallucinations
        if user_rank <= expected_rank * 1.25: # 25% tolerance buffer
            
            # Probability calculation
            if user_rank <= expected_rank * 0.85:
                status = "SAFE"
                prob = 90
            elif user_rank <= expected_rank:
                status = "TARGET"
                prob = 65
            else:
                status = "REACH"
                prob = 35

            branch_match = norm_branch in str(row['Branch']).upper()

            results.append({
                "institute": row['Institute'],
                "branch": row['Branch'],
                "expected_closing_rank": int(expected_rank),
                "admission_probability_percent": prob,
                "status": status,
                "branch_matched": branch_match
            })


    results.sort(key=lambda x: (
        not x["branch_matched"],     
        x["expected_closing_rank"]   
    ))

    return results
