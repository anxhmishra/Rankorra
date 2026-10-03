import re
from typing import Dict, Any, List

def evaluate_branch_match(preferred_branch: str, row_branch: str) -> bool:
    """Performs token-aware branch matching to avoid false positives (e.g. Civil vs CS)."""
    if not preferred_branch or preferred_branch.strip().lower() in ["any", "all", ""]:
        return True

    def sanitize(text: str) -> set:
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", " ", text.lower())
        stop_words = {"and", "engineering", "tech", "technology", "btech", "four", "years"}
        return {word for word in cleaned.split() if word not in stop_words}

    pref_tokens = sanitize(preferred_branch)
    row_tokens = sanitize(row_branch)

    if not pref_tokens:
        return True

    intersection = pref_tokens.intersection(row_tokens)
    return len(intersection) / len(pref_tokens) >= 0.5

def transform_raw_to_api(raw: Dict[str, Any], request_branch: str = "") -> Dict[str, Any]:
    audit = raw.get("portfolio_risk_audit", {})
    raw_choices = raw.get("optimized_choice_list", [])

    results: List[Dict[str, Any]] = []

    for item in raw_choices:
        branch_name = item.get("branch", "Engineering")
        is_matched = evaluate_branch_match(request_branch, branch_name)

        exp_rank = int(item.get("expected_closing_rank", 0))
        opt_rank = int(item.get("optimistic_best_case_rank", exp_rank))
        con_rank = int(item.get("conservative_worst_case_rank", exp_rank))

        # Enforce valid rank numerical hierarchy: best_case <= expected <= worst_case
        best_case = min(opt_rank, exp_rank, con_rank)
        worst_case = max(opt_rank, exp_rank, con_rank)

        raw_status = str(item.get("status", "TARGET")).upper()
        status_map = {"SAFE": "Safe", "TARGET": "Target", "REACH": "Reach"}
        api_status = status_map.get(raw_status, "Target")

        results.append({
            "institute": item.get("institute", "IIT"),
            "branch": branch_name,
            "quota": item.get("quota", "AI"),
            "finalRound": item.get("final_round_analyzed", 6),
            "expectedClosingRank": exp_rank,
            "bestCaseRank": best_case,
            "worstCaseRank": worst_case,
            "probability": round(float(item.get("admission_probability_percent", 0.0)), 1),
            "status": api_status,
            "rankMargin": item.get("rank_margin", exp_rank),
            "branchMatch": is_matched
        })

    return {
        "summary": {
            "total": raw.get("total_unique_choices_found", len(results)),
            "year": raw.get("latest_year_reference", 2025),
            "safe": audit.get("safe_options", 0),
            "target": audit.get("target_options", 0),
            "reach": audit.get("reach_options", 0),
            "health": audit.get("portfolio_health", "Moderate")
        },
        "results": results
    }

# Alias to satisfy main.py import statement
to_api = transform_raw_to_api