from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_predict_endpoint_structure():
    payload = {
        "rank": 4500,
        "category": "OBC-NCL",
        "gender": "Gender-Neutral",
        "preferred_branch": "Civil Engineering",
        "quota": "AI"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "results" in data
    assert isinstance(data["results"], list)
    
    if len(data["results"]) > 0:
        first = data["results"][0]
        # Verify rank ordering invariant: bestCase <= expected <= worstCase
        assert first["bestCaseRank"] <= first["expectedClosingRank"] <= first["worstCaseRank"]