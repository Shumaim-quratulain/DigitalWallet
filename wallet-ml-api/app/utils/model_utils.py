import joblib
import pandas as pd
import numpy as np

class FraudDetectionModel:
    def __init__(self, model_path):
        self.model_data = joblib.load(model_path)
        self.model = self.model_data['model']
        self.feature_names = self.model_data['feature_names']
        self.scaler = self.model_data['scaler']
        self.params = self.model_data['model_params']

    def preprocess_input(self, input_data):
        """Prepare input data for prediction"""
        if isinstance(input_data, dict):
            input_df = pd.DataFrame([input_data])
        else:
            input_df = input_data.copy()
            
        # Ensure all expected features are present
        for feature in self.feature_names:
            if feature not in input_df.columns:
                input_df[feature] = 0
                
        input_df = input_df[self.feature_names]
        
        if self.scaler:
            input_scaled = self.scaler.transform(input_df)
            return pd.DataFrame(input_scaled, columns=self.feature_names)
        return input_df

    def predict(self, input_data):
        """Make prediction on input data"""
        try:
            prepared_data = self.preprocess_input(input_data)
            prediction = self.model.predict(prepared_data)[0]
            probability = self.model.predict_proba(prepared_data)[0, 1]
            return {
                'prediction': int(prediction),
                'probability': float(probability),
                'status': 'success'
            }
        except Exception as e:
            return {
                'prediction': None,
                'probability': None,
                'status': 'error',
                'message': str(e)
            }