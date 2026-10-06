from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import PredictRequest
import app.model_service as ms
from app.mapper import to_api
import insights_router  

@asynccontextmanager
async def lifespan(app: FastAPI):
    if hasattr(ms, "load_model"):
        ms.load_model()
    yield

app = FastAPI(lifespan=lifespan)

# Mount TinyFish insights router
app.include_router(insights_router.router)  # <--- Include TinyFish router

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: PredictRequest):
    payload = req.model_dump()
    raw_result = ms.run_model(payload)
    return to_api(raw_result, req.preferred_branch)