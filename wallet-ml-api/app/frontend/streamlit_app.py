import streamlit as st
import requests
from dotenv import load_dotenv
import os

load_dotenv()

api_end_point = os.environ.get("API_END_POINT")
API_BASE = f"{api_end_point}/api"

# Set page config
st.set_page_config(
    page_title="Fraudulent Transaction Detection",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom styles for light/dark themes
st.markdown("""
    <style>
    .custom-header {
        background: linear-gradient(to right, #0e78b3, #37a963);
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        color: white;
    }

    .result-box {
        padding: 20px;
        border-radius: 10px;
        margin-top: 10px;
        text-align: center;
    }
    .fraud-box {
        background-color: #ffe6e6;
        border-left: 8px solid #cc0000;
        color: #990000;
    }
    .legit-box {
        background-color: #e6ffed;
        border-left: 8px solid #2e8b57;
        color: #14532d;
    }
    @media (prefers-color-scheme: dark) {
        .fraud-box {
            background-color: #ff0000;
            color: rgb(255, 255, 255);
            border-left: 8px solid #ffc333;
        }
        .legit-box {
            background-color: #03ff84;
            color: #025c00;
            border-left: 8px solid rgb(15 139 255);
        }
    }

    .explanation-box {
        padding: 20px;
        border-radius: 18px;
        white-space: pre-wrap;
        font-family: cursive;
        font-size: x-large;
    }
    @media (prefers-color-scheme: dark) {
        .explanation-box {
            background: #2673a9;
            color: #ffffff;
        }
    }

    .stRadio > div {
        flex-direction: row;
        justify-content: center;
        font-size: 18px;
        gap: 2rem;
    }
    </style>

    <div class="custom-header">
        <h1 style="font-size: 3rem;">🔍 Fraudulent Transaction Detection</h1>
        <p style="font-size: 1.2rem;">Use Machine Learning or Gemini AI to evaluate a transaction's legitimacy.</p>
    </div>
""", unsafe_allow_html=True)

# Model selection
st.markdown("""
    <div style="text-align:center; font-size: 22px; margin-top: 20px;">
        🔧 <strong>Choose a Prediction Model</strong>
    </div>
""", unsafe_allow_html=True)

model_option = st.radio("", ["ML Model", "AI Model (Gemini)"], horizontal=True)

# Input fields with constraints
st.markdown("### 📝 Enter Transaction Details")

user_input = {}
cols = st.columns(3)

with cols[0]:
    user_input["Transaction_Amount"] = st.number_input("Transaction Amount", value=1200.50, format="%.2f")
    user_input["IP_Address_Flag"] = st.selectbox("IP Address Flag", [0, 1])
    user_input["Transaction_Distance"] = st.number_input("Transaction Distance", value=20.5, format="%.2f")
    user_input["Risk_Score"] = st.slider("Risk Score", min_value=0.0, max_value=1.0, value=0.85)
with cols[1]:
    user_input["Account_Balance"] = st.number_input("Account Balance", value=5000.00, format="%.2f")
    user_input["Daily_Transaction_Count"] = st.number_input("Daily Transaction Count", value=3, format="%d", step=1)
    user_input["Avg_Transaction_Amount_7d"] = st.number_input("Avg Transaction Amount (7d)", value=1100.00, format="%.2f")
    user_input["Amount_to_Balance_Ratio"] = st.slider("Amount to Balance Ratio", 0.0, 1.0, 0.24)
with cols[2]:
    user_input["Failed_Transaction_Count_7d"] = st.number_input("Failed Transaction Count (7d)", min_value=0, max_value=10, step=1)
    user_input["Previous_Fraudulent_Activity"] = st.selectbox("Previous Fraudulent Activity", [0, 1])
    user_input["DayOfWeek"] = st.selectbox("Day of Week", [1, 2, 3, 4, 5, 6, 7])
    user_input["Amount_Deviation"] = st.slider("Amount Deviation", 0.0, 1.0, 0.12)

# Prediction button
if st.button("🚀 Predict Transaction", use_container_width=True):
    endpoint = f"{API_BASE}/predict" if model_option == "ML Model" else f"{API_BASE}/ai-prediction"

    with st.spinner("⏳ Contacting server..."):
        try:
            response = requests.post(endpoint, json=user_input)
            result = response.json()
        except Exception as e:
            st.error("❌ Could not parse server response.")
            st.code(str(e))
            raise e

    st.markdown("---")
    st.subheader("📢 Prediction Result")

    if response.status_code == 200:
        if model_option == "ML Model":
            prediction = result['label']
            probability = result['probability']
            result_class = "fraud-box" if prediction == "Fraud" else "legit-box"
            st.markdown(f"""
                <div class="result-box {result_class}">
                    <h2>🔍 Prediction: {prediction}</h2>
                    <p style="font-size:18px;">📊 <strong>Probability:</strong> {probability:.4f}</p>
                </div>
            """, unsafe_allow_html=True)
        else:
            prediction = result['prediction']
            result_class = "fraud-box" if prediction.lower() == "fraudulent" else "legit-box"
            explanation = result.get("explanation", "No explanation provided.")
            st.markdown(f"""
                <div class="result-box {result_class}">
                    <h2>🤖 AI Prediction: {prediction}</h2>
                    <p style="font-size:16px;"><strong>Explanation:</strong></p>
                    <div class="explanation-box">{explanation}</div>
                </div>
            """, unsafe_allow_html=True)
    else:
        st.error("❌ Prediction failed. Please check input or server.")
        st.code(result)
