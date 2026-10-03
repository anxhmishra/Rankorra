# SeatWise API
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Put your pickle at `backend/models/model.pkl` (or set `MODEL_PATH`) and edit `run_model()` in `app/model_service.py`.
Without a pickle the API runs in demo mode with `sample_response.json`. Docs: http://localhost:8000/docs
Pickle needs the same Python and library versions it was saved with, and any custom class it uses must be importable (copy that module next to `app/`).
Then set `VITE_API_URL=http://localhost:8000` in the frontend `.env`.
