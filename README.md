# 🎓 Rankorra

### AI-Powered JoSAA College & Branch Prediction Platform

**Rankorra** is a machine-learning powered platform designed to help JEE aspirants make better decisions during **JoSAA counselling**.

It combines historical JoSAA cutoff data, machine learning, rank-based analysis, and institute prioritization to generate relevant **college and branch recommendations** for students.

Instead of manually analyzing thousands of cutoff records, Rankorra processes the data and presents the information in a simpler, more actionable format.

> **Turn your JEE rank into smarter college choices.**

---

## 🌐 Live Website

🚀 **Rankorra is hosted on Vercel and available online.**

**Website:**  
https://rankorra.vercel.app/

---

# ✨ Features

### 🎯 Personalized College & Branch Recommendations

Rankorra uses a student's counselling profile to identify relevant college and branch possibilities.

The system considers parameters such as:

- JEE Rank
- Category
- Quota
- Gender
- Institute
- Branch / Academic Program

The resulting recommendations are based on historical JoSAA cutoff patterns and the platform's recommendation logic.

---

### 🤖 Machine Learning-Based Prediction

Rankorra uses **CatBoost Regression** to learn patterns from historical closing-rank data.

The current model uses:

    Institute
    Branch
    Quota
    Category
    Gender

as its primary categorical features.

The target variable is:

    Closing Rank

The model provides the prediction layer used by the recommendation engine.

---

### 📊 Historical JoSAA Data

The system is backed by a consolidated dataset containing historical JoSAA opening and closing rank information.

This allows the platform to work with admission trends across:

- Institutes
- Branches
- Categories
- Quotas
- Genders
- Counselling years
- Counselling rounds

---

### 🏛️ Institute Prioritization

Recommendations are not based solely on numerical rank proximity.

Rankorra uses an institute hierarchy to prioritize results:

    IIT
     ↓
    NIT
     ↓
    IIIT
     ↓
    Other GFTIs

This allows the recommendation engine to prefer a higher-priority institute even when another option is numerically closer to the student's rank.

---

### 📐 Rank-Based Recommendation System

The recommendation engine organizes possible options around the student's rank using rank ranges.

A **3K bracket** is one component of this system.

For example, for a rank of:

    500

the initial search range can be:

    500 → 3500

The engine can then expand into subsequent ranges when required.

These brackets help the system explore realistic possibilities rather than relying on one exact predicted cutoff.

Importantly, the bracket is **not the only factor determining the final order**.

Institute hierarchy and other recommendation rules are also considered.

---

# 🧠 How Rankorra Works

The overall system can be represented as:

    Student Information
           │
           ▼
    Historical JoSAA Data
           │
           ▼
    Data Processing
           │
           ▼
    Machine Learning
           │
           ▼
    Closing Rank Prediction
           │
           ▼
    College & Branch Analysis
           │
           ▼
    Rank-Based Recommendation Logic
           │
           ▼
    Institute Prioritization
           │
           ▼
    Final Results

The machine-learning model is therefore **one part of a larger recommendation system**, rather than the entire application.

---

# 🏗️ System Architecture

    ┌─────────────────────────────────┐
    │            Student              │
    │                                 │
    │ Rank / Category / Quota         │
    │ Gender / Preferences            │
    └────────────────┬────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────┐
    │         Rankorra Frontend       │
    │                                 │
    │ React Interface                 │
    │ Predictor                       │
    │ Results                         │
    └────────────────┬────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────┐
    │        Prediction Engine        │
    │                                 │
    │ Feature Processing              │
    │ ML Inference                    │
    │ Recommendation Logic            │
    └────────────────┬────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────┐
    │         CatBoost Model          │
    │                                 │
    │ Closing Rank Prediction         │
    └────────────────┬────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────┐
    │       Recommendation Layer      │
    │                                 │
    │ Rank Ranges                     │
    │ College / Branch Filtering      │
    │ Institute Prioritization        │
    └────────────────┬────────────────┘
                     │
                     ▼
    ┌─────────────────────────────────┐
    │          Final Results          │
    └─────────────────────────────────┘

---

# 🛠️ Tech Stack

## Frontend

- **React.js**
- **JavaScript**
- **HTML5**
- **CSS3**
- **Vercel**

---

## Machine Learning

- **Python**
- **CatBoost**
- **Pandas**
- **NumPy**
- **Scikit-learn**
- **Joblib**

### Core ML Model

    CatBoostRegressor

---

## Data Processing

The data pipeline uses:

    Python
    Pandas
    NumPy

Processing includes:

- Column normalization
- Rank cleaning
- Missing-value handling
- Category normalization
- Institute classification
- Branch filtering
- Feature preparation

Architecture and Planning programs are currently excluded from the training pipeline to keep the model focused on engineering admissions.

---

# 📂 Dataset

The primary dataset is:

    data/cutoffsfinal.csv

It was created from historical JoSAA opening and closing rank information.

Important fields include:

    Year
    Round
    Institute
    Academic Program
    Opening Rank
    Closing Rank
    Seat Type / Category
    Gender
    Quota

The training pipeline cleans and standardizes these fields before using them.

---

# 🔬 Machine Learning Pipeline

### Dataset

    Historical JoSAA Data
            ↓
        Cleaning
            ↓
      Normalization
            ↓
    Feature Preparation

### Training

    Prepared Dataset
            ↓
    Train / Validation Split
            ↓
      CatBoost Regressor
            ↓
        Validation
            ↓
    Model Serialization

### Prediction

    Student Input
          ↓
    Feature Preparation
          ↓
      Trained Model
          ↓
    Predicted Closing Rank
          ↓
    Recommendation Engine

---

# ⚙️ Model Configuration

The current CatBoost model uses:

    Iterations       : 600
    Learning Rate    : 0.08
    Depth            : 6
    Loss Function    : RMSE
    Random Seed      : 42
    Early Stopping   : 40 rounds

The current feature set is:

    Institute
    Branch
    Quota
    Category
    Gender

The target variable is:

    Closing Rank

---

# 📈 Model Performance

The current model was evaluated using a held-out **15% validation set**.

| Metric | Result |
|---|---:|
| **MAE** | **3516.79** |
| **R²** | **0.8658** |
| **R² Percentage** | **86.58%** |

### MAE — Mean Absolute Error

**3516.79**

On the validation dataset, the model's predicted closing rank differs from the actual closing rank by approximately **3,517 ranks on average**.

### R² Score

**0.8658**

The model explains approximately **86.58% of the variance** in the closing-rank target on the validation dataset.

---

# 📊 Latest Training Result

The latest training run produced:

    bestTest = 15710.99868
    bestIteration = 596

Final validation metrics:

    ========== MODEL EVALUATION ==========

    MAE : 3516.79
    R²  : 0.8658

    ======================================

`bestTest` represents CatBoost's validation RMSE and is different from the MAE reported above.

---

# 📐 Recommendation Logic

The machine-learning model provides a predicted closing-rank signal, but the final recommendation system considers more than just that number.

A simplified representation is:

    Student Rank
         │
         ▼
    Predicted / Historical Rank Range
         │
         ▼
    Find Relevant College + Branch Options
         │
         ▼
    Evaluate Institute Type
         │
         ▼
    Prioritize:
         IIT
          ↓
         NIT
          ↓
         IIIT
          ↓
         GFTI
         │
         ▼
    Final Recommendations

The system can use rank brackets, including the 3K range concept, to broaden the search when necessary.

For example:

    Rank = 500

    Initial range:
    500 → 3500

If an option in a subsequent range belongs to a higher-priority institute category than an option in the current range, the higher-priority institute can be ranked ahead.

This allows Rankorra to balance:

- Rank proximity
- College type
- Branch
- Category
- Quota
- Gender
- Historical cutoff behavior

rather than relying on a single numerical comparison.

---

# 📁 Project Structure

A simplified representation of the project:

    Rankorra/
    │
    ├── src/
    │   ├── pages/
    │   │   └── Predictor.jsx
    │   ├── components/
    │   └── ...
    │
    ├── data/
    │   └── cutoffsfinal.csv
    │
    ├── models/
    │   └── ...
    │
    ├── train.py
    ├── model_bundle.pkl
    ├── package.json
    ├── package-lock.json
    ├── .gitignore
    └── README.md

The project structure may evolve as development continues.

---

# 🌐 Deployment

Rankorra is deployed using **Vercel**.

The production application is available directly through the web, so users do not need to install or configure the project locally.

The repository serves as the development and engineering source for:

- Frontend
- Machine-learning pipeline
- Dataset
- Model
- Prediction logic
- Supporting code
- Documentation

---

# 👨‍💻 Contributors

## Varun Mishra

### Backend & Machine Learning

Responsible for:

- Machine-learning pipeline
- CatBoost model
- JoSAA dataset processing
- Data cleaning
- Feature engineering
- Model training
- Model evaluation
- Prediction engine
- Recommendation logic
- Rank-bracket system
- Institute prioritization
- Backend integration
- Model serialization

---

## Ansh

### Frontend Development

Responsible for:

- React frontend
- User interface
- Predictor interface
- Frontend components
- User experience
- Frontend integration

---

# 🔮 Future Scope

### 🤖 Machine Learning Improvements

Potential improvements include:

- CatBoost hyperparameter optimization
- Improved feature engineering
- Ensemble models
- Alternative gradient-boosting models
- More robust validation strategies

---

### 📊 Advanced Analytics

Future versions could include:

- Historical cutoff graphs
- Branch-wise trends
- Institute comparisons
- Category comparisons
- Quota comparisons
- Round-wise analysis
- Rank vs cutoff visualization

---

### 🎯 Smarter Recommendations

Future versions could introduce more detailed recommendation categories such as:

    SAFE
    TARGET
    REACH

based on historical trends and the relationship between student rank and predicted closing ranks.

---

### 🔄 Automated Data Updates

The data pipeline could be automated to incorporate newly released JoSAA cutoff data after each counselling cycle.

This would allow the recommendation system to continuously benefit from new historical information.

---

# ⚠️ Disclaimer

Rankorra provides **data-driven estimates and recommendations** and does not guarantee admission.

Actual JoSAA seat allocation depends on factors including:

- Candidate preferences
- Number of applicants
- Seat availability
- Category
- Quota
- Gender
- Counselling round
- Candidate choices
- JoSAA allocation rules
- Changes in yearly admission trends

Students should always verify information using official JoSAA sources before making admission decisions.

---

# 🎯 Project Objective

Rankorra was built with one goal:

> **Make JoSAA counselling simpler, smarter, and more data-driven.**

The platform combines historical admission data, machine learning, and recommendation logic to transform a student's JEE rank into useful college and branch possibilities.

    JEE Rank
        │
        ▼
    Historical JoSAA Data
        │
        ▼
    Machine Learning
        │
        ▼
    Closing Rank Prediction
        │
        ▼
    College + Branch Data
        │
        ▼
    Recommendation Engine
        │
        ▼
    Institute Prioritization
        │
        ▼
    Final College Options

# 🚀 Rankorra

### **Turn your rank into smarter choices.**