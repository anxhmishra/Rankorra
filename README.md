# College Counselling Choice-List Optimizer

## Quick Start for Team Members

Clone the repository and run the FastAPI server locally (the pre-trained model bundle and dataset are already included, so no training is required):

```bash
git clone [https://github.com/anxhmishra/College-Counselling-Model.git](https://github.com/anxhmishra/College-Counselling-Model.git)
cd College-Counselling-Model

python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac / Linux:
source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload

Run locally - http://127.0.0.1:8000/docs or http://127.0.0.1:8000
