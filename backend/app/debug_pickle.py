import pickle
from pathlib import Path

# Automatically resolves the folder where this script is located
APP_DIR = Path(__file__).resolve().parent
bundle_path = APP_DIR / "cutoff_model_bundle.pkl"

print(f"Checking path: {bundle_path.absolute()}")

if bundle_path.exists():
    with open(bundle_path, "rb") as f:
        data = pickle.load(f)
    
    print("\n--- PICKLE FOUND & INSPECTED ---")
    print("Type of loaded pickle:", type(data))
    
    if isinstance(data, dict):
        print("Dictionary keys:", list(data.keys()))
        for k, v in data.items():
            print(f"  Key '{k}': {type(v)}")
    elif hasattr(data, "feature_names_in_"):
        print("Expected Model Features:", data.feature_names_in_)
    else:
        print("Attributes/Methods:", [m for m in dir(data) if not m.startswith("_")])
else:
    print("\n[ERROR] File missing! Existing files in this folder:")
    for file in APP_DIR.iterdir():
        print(" -", file.name)