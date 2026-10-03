# Save as backend/debug_pickle.py and run: python debug_pickle.py
import pickle
from pathlib import Path

bundle_path = Path("app/cutoff_model_bundle.pkl")

if bundle_path.exists():
    with open(bundle_path, "rb") as f:
        data = pickle.load(f)
    
    print("--- PICKLE INSPECTION ---")
    print("Type of loaded pickle:", type(data))
    
    if isinstance(data, dict):
        print("Dictionary keys:", list(data.keys()))
        for k, v in data.items():
            print(f" Key '{k}': {type(v)}")
    elif hasattr(data, "feature_names_in_"):
        print("Expected Model Features:", data.feature_names_in_)
else:
    print("Bundle file not found at app/cutoff_model_bundle.pkl")