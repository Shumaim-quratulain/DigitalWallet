import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ML-Model-For-Fraud-Detection-and-Risk-Analysis'
    MODEL_PATH = os.path.join(basedir, 'app/models/assets/fraud_detection_model.pkl')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max upload size