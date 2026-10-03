# Paste this whole file into any AI to continue the project

You are continuing a hackathon project: **SeatWise**, a JoSAA engineering counselling helper.
An ML model (built, working, saved as a pickle) takes `{rank, category, gender, preferred_branch, quota}` and returns
`{total_unique_choices_found, latest_year_reference, portfolio_risk_audit{safe_options,target_options,reach_options,portfolio_health},
optimized_choice_list[{institute, branch, final_round_analyzed, expected_closing_rank, optimistic_best_case_rank, conservative_worst_case_rank,
admission_probability_percent, status:SAFE|TARGET|REACH, rank_margin, branch_match}]}`.

## Stack and structure
- Frontend (root): React 18 + Vite + react-router-dom, plain CSS tokens. src/pages (Landing, Predictor, Shortlist, NotFound),
  src/features/predictor, src/features/shortlist (context + localStorage + CSV export), src/services/api.js (all HTTP), mock.js (used when VITE_API_URL is empty)
- Backend (backend/): FastAPI. app/schemas.py (request validation), app/model_service.py (the ONLY place that loads/calls the pickle; demo mode with sample_response.json if no pickle),
  app/mapper.py (raw model output -> API shape), app/main.py (/health, /predict, CORS)

## API contract
POST /predict `{rank, category, gender, preferred_branch, quota}` ->
`{summary:{total,year,safe,target,reach,health}, results:[{institute, branch, quota, finalRound, expectedClosingRank, bestCaseRank, worstCaseRank, probability, status:'Safe'|'Target'|'Reach', rankMargin, branchMatch}]}`

## Done
Landing, predictor form + results table (status filter, branch-match filter), choice list (reorder, remove, CSV, print, localStorage), FastAPI backend skeleton with demo mode.

## Open items
1. Connect the real pickle in model_service.run_model(); confirm category and quota strings match what the model was trained on
2. Verify model behaviour: a "Civil Engineering" input returned mostly Computer Science rows marked branch_match true; some REACH rows have best-case rank above expected rank
3. Compare + FAQ pages, tests (Vitest, pytest), deploy (Vercel + Render), optional accounts/DB for shortlist

## Rules
Keep folder-per-feature structure, API calls only in src/services, sentence-case copy, accessible UI, no heavy new dependencies. Explain concepts briefly before big changes; make small tagged Git milestones.
