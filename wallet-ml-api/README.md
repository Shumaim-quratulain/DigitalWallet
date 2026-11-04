# 🛡️ Fraudulent Transaction Detection System

A full-fledged fraud detection pipeline using machine learning and AI interpretability tools. This project includes data exploration, feature engineering, model selection (with XGBoost), visual explanations (SHAP), a Flask API, and a Streamlit frontend. We also integrated Google’s Gemini AI for advanced prediction interpretation.

---

## 📊 1. Dataset & Exploratory Data Analysis

- **Source**: [`synthetic_fraud_dataset.csv`](https://www.kaggle.com/datasets)
- We conducted **Exploratory Data Analysis (EDA)** using `ydata-profiling` and custom visualizations to understand:
  - Feature distributions
  - Correlation heatmaps
  - Class imbalance
  - Potential data quality issues

The EDA helped inform downstream preprocessing and feature engineering.

---

## 🧠 2. Feature Engineering

We selected and transformed features to improve model accuracy and reduce noise.

### ✅ Important Features:

- `Account_Balance`, `IP_Address_Flag`, `Previous_Fraudulent_Activity`
- `Daily_Transaction_Count`, `Risk_Score`, `Is_Weekend`, `Hour`, `Amount_Deviation`, etc.

### ❌ Dropped/Transformed Features:

- Identifiers like `Transaction_ID`, `User_ID`
- Raw `Timestamp`, `Device_Type`, `Location` (transformed into derived features)
- Low-informative fields like `Card_Type`, `Authentication_Method`

We scaled and normalized the final dataset, saving it as `preprocessed_fraud_dataset_numerical_only.csv`.

---

## 🏗️ 3. Model Selection & Training

We tested multiple classifiers:

- ✅ Logistic Regression
- ✅ Random Forest
- ✅ Gradient Boosting
- ✅ **XGBoost (Best Performance)**

After selecting **XGBoost**, we fine-tuned hyperparameters and saved the trained pipeline to `fraud_detection_model_numerical.pkl`.

---

## 📈 4. Model Validation & Interpretation

We built utility functions to:

- Predict fraud likelihood on new transactions
- Show evaluation metrics:
  - Confusion Matrix
  - Precision-Recall Curve
  - Classification Report
  - ROC-AUC Score
- Visualize feature importances and interpret predictions with **SHAP**:

```python
=== TRANSACTION DETAILS ===
Transaction_Amount: 1500
...
Amount_Deviation: 1300

=== PREDICTION ===
Prediction: FRAUD
Fraud Probability: 0.82
```

Visuals include:

- SHAP summary bar plot
- Force plots for individual transaction explanations

---

## 🧪 5. Flask API

We exposed the model via a REST API using **Flask**.

### 🔌 API Endpoints:

| Method | Endpoint         | Description                             |
| ------ | ---------------- | --------------------------------------- |
| POST   | `/predict`       | Predict using XGBoost model             |
| POST   | `/ai-prediction` | Get prediction + explanation via Gemini |
| GET    | `/health`        | API health check                        |

**Example AI Prompt (Gemini)**:

```python
"You are an AI fraud detection assistant. Based on the following transaction data..."
```

Uses `gemini-2.5-pro-exp-03-25` for rich explanations alongside predictions.

---

## 💻 6. Streamlit Frontend

We developed a simple, responsive **Streamlit app** to interact with the API:

- Enter transaction details manually
- Get instant predictions
- View explanations (via AI or SHAP)
- Toggle light/dark theme

---

## 🚀 Running the Project

### ▶️ Run Combined Flask + Streamlit

```bash
bash start.sh
```

### 📦 Manual Steps (Optional)

1. Start the Flask API:

```bash
python run.py
```

2. Launch the Streamlit UI:

```bash
streamlit run app/frontend/streamlit_app.py
```

---

## 📌 Technologies Used

- **Python** (Pandas, Scikit-learn, XGBoost, SHAP)
- **Flask** for backend API
- **Streamlit** for UI
- **Google Gemini AI** for natural language explanations
- **Matplotlib & Seaborn** for visualization
- **Joblib** for model serialization

---

## 📍 Future Improvements

- Add authentication & rate limiting to API
- Integrate live transaction feeds for real-time fraud scoring
- Add model monitoring dashboard (e.g., with Grafana + Prometheus)
- Expand AI explanation options using multiple LLMs

---

