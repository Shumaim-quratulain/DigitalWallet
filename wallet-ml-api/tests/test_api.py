import pytest
from app import create_app
from config import Config
import json

@pytest.fixture
def client():
    app = create_app(Config)
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert b'healthy' in response.data

def test_predict_endpoint(client):
    test_data = {
        "Transaction_Amount": 1500,
        "Account_Balance": 5000,
        "IP_Address_Flag": 1,
        "Daily_Transaction_Count": 10,
        "Avg_Transaction_Amount_7d": 200,
        "Failed_Transaction_Count_7d": 3,
        "Transaction_Distance": 1500,
        "Risk_Score": 0.9,
        "Amount_to_Balance_Ratio": 0.3,
        "Amount_Deviation": 1300,
        "Previous_Fraudulent_Activity": 0,
        "Is_Weekend": 0,
        "Hour": 12,
        "DayOfWeek": 3,
        "Is_Night": 0,
        "High_Risk_Category": 0
    }

    response = client.post(
        '/api/predict',
        data=json.dumps(test_data),
        content_type='application/json'
    )

    assert response.status_code == 200
    data = response.get_json()
    assert 'prediction' in data
    assert 'probability' in data
    assert 'label' in data

    invalid_data = test_data.copy()
    del invalid_data['Transaction_Amount']

    response = client.post(
        '/api/predict',
        data=json.dumps(invalid_data),
        content_type='application/json'
    )

    assert response.status_code == 400
    assert b'Missing required fields' in response.data or b'"error"' in response.data

    response = client.post(
        '/api/predict',
        data='not json',
        content_type='application/json'
    )

    assert response.status_code == 400
    # NOTE: Flask's default error for malformed JSON doesn't return our custom error unless handled separately
    assert b'Request must be JSON' in response.data or b'Bad Request' in response.data

def test_ai_prediction_without_api_key_returns_json_error(client, monkeypatch):
    monkeypatch.delenv('GOOGLE_GEMINI_API_KEY4', raising=False)
    test_data = {
        "Transaction_Amount": 1500,
        "Account_Balance": 5000,
        "IP_Address_Flag": 1,
        "Daily_Transaction_Count": 10,
        "Avg_Transaction_Amount_7d": 200,
        "Failed_Transaction_Count_7d": 3,
        "Transaction_Distance": 1500,
        "Risk_Score": 0.9,
        "Amount_to_Balance_Ratio": 0.3,
        "Amount_Deviation": 1300
    }

    response = client.post('/api/ai-prediction', json=test_data)

    assert response.status_code == 503
    assert response.get_json() == {
        'error': 'Google Gemini API Key not found.',
        'status': 'error'
    }