import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

class GeminiPredictor:
    def __init__(self):
        api_key = os.environ.get("GOOGLE_GEMINI_API_KEY4")
        if not api_key:
            raise ValueError("Google Gemini API Key not found.")
        self.client = genai.Client(api_key=api_key)
        self.model = "gemini-2.0-flash"

    def analyze_transaction(self, transaction_data: dict) -> dict:
        input_text = (
            "You are an AI fraud detection assistant. Based on the following transaction data, "
            "predict whether it is Fraudulent or Legitimate. Also provide a short explanation for your prediction.\n\n"
            f"Transaction Data:\n{transaction_data}\n\n"
            "Respond in the format:\nPrediction: <Fraud or Legitimate>\nExplanation: <your reasoning>"
        )

        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=input_text)],
            ),
        ]

        config = types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_budget=0),
            response_mime_type="text/plain",
        )

        response_text = ""
        try:
            for chunk in self.client.models.generate_content_stream(
                model=self.model,
                contents=contents,
                config=config,
            ):
                response_text += chunk.text
        except Exception as e:
            return {
                "status": "error",
                "error": f"Error from Gemini: {str(e)}"
            }

        # Parse the output
        prediction = "Unknown"
        explanation = "No explanation provided."

        if "Prediction:" in response_text:
            parts = response_text.split("Prediction:")[1].split("Explanation:")
            prediction = parts[0].strip() if len(parts) > 0 else "Unknown"
            explanation = parts[1].strip() if len(parts) > 1 else "No explanation provided."
        else:
            explanation = response_text.strip()

        return {
            "prediction": prediction,
            "explanation": explanation,
            "status": "success"
        }
