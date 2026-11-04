from flask import Blueprint, request, jsonify, redirect
from app.utils.model_utils import FraudDetectionModel
from config import Config
from app.models.gemini_predictor import GeminiPredictor
import time

bp = Blueprint('api', __name__)
model = FraudDetectionModel(Config.MODEL_PATH)

@bp.route('/streamlit', methods=['GET'])
def launch_streamlit():
    return redirect("/")

@bp.route('/predict', methods=['POST'])
def predict():
    if not request.is_json:
        return jsonify({
            'error': 'Request must be JSON',
            'status': 'error'
        }), 400

    data = request.get_json()
    
    # Validate required fields
    required_fields = [
        'Transaction_Amount', 'Account_Balance', 'IP_Address_Flag',
        'Daily_Transaction_Count', 'Avg_Transaction_Amount_7d',
        'Failed_Transaction_Count_7d', 'Transaction_Distance',
        'Risk_Score', 'Amount_to_Balance_Ratio', 'Amount_Deviation'
    ]
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({
            'error': f'Missing required fields: {", ".join(missing_fields)}',
            'status': 'error'
        }), 400

    # Set default values for optional fields if not provided
    optional_fields = {
        'Previous_Fraudulent_Activity': 0,
        'Is_Weekend': 0,
        'Hour': 12,
        'DayOfWeek': 3,
        'Is_Night': 0,
        'High_Risk_Category': 0
    }
    
    for field, default_value in optional_fields.items():
        if field not in data:
            data[field] = default_value

    # Make prediction
    result = model.predict(data)
    
    if result['status'] == 'error':
        return jsonify(result), 500
    
    return jsonify({
        'prediction': result['prediction'],
        'probability': result['probability'],
        'label': 'Fraud' if result['prediction'] == 1 else 'Legitimate',
        'status': 'success'
    })

@bp.route('/ai-prediction', methods=['POST'])
def ai_prediction():
    if not request.is_json:
        return jsonify({
            'error': 'Request must be JSON',
            'status': 'error'
        }), 400

    data = request.get_json()

    # Required fields validation
    required_fields = [
        'Transaction_Amount', 'Account_Balance', 'IP_Address_Flag',
        'Daily_Transaction_Count', 'Avg_Transaction_Amount_7d',
        'Failed_Transaction_Count_7d', 'Transaction_Distance',
        'Risk_Score', 'Amount_to_Balance_Ratio', 'Amount_Deviation'
    ]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return jsonify({
            'error': f'Missing required fields: {", ".join(missing_fields)}',
            'status': 'error'
        }), 400

    # Optional defaults
    optional_fields = {
        'Previous_Fraudulent_Activity': 0,
        'Is_Weekend': 0,
        'Hour': 12,
        'DayOfWeek': 3,
        'Is_Night': 0,
        'High_Risk_Category': 0
    }
    for field, default in optional_fields.items():
        data.setdefault(field, default)

    try:
        gemini = GeminiPredictor()
    except ValueError as error:
        return jsonify({
            'error': str(error),
            'status': 'error'
        }), 503

    result = gemini.analyze_transaction(data)

    if result['status'] == 'error':
        return jsonify(result), 500

    return jsonify({
        'prediction': result['prediction'],
        'explanation': result['explanation'],
        'status': 'success'
    })

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@bp.route('/keep-alive', methods=['GET'])
def keep_alive():
    current_time = time.strftime('%Y-%m-%d %H:%M:%S')
    return jsonify({
        'status': 'alive',
        'message': 'Server is awake',
        'timestamp': current_time
    }), 200