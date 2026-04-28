import json
from app.core.celery_app import celery_app
from app.services.gemini import extract_symptoms_from_text, generate_human_explanation
from app.services.ml import predict_risk
from app.services.xai import generate_shap_values

@celery_app.task(name="process_prediction")
def process_prediction(text_input: str, user_id: str):
    """
    Background task that orchestrates the AI pipeline.
    """
    try:
        # 1. NLP Extraction (Gemini)
        extracted_json_str = extract_symptoms_from_text(text_input)
        
        # Parse output safely (assuming Gemini returns raw JSON)
        try:
            structured_features = json.loads(extracted_json_str)
        except json.JSONDecodeError:
            # Fallback if Gemini fails to output valid JSON
            structured_features = {"raw_text": text_input, "error": "Failed to parse JSON"}

        # Simulate async delay for realistic UI loading state testing
        import time
        time.sleep(2)

        # 2. ML Prediction
        risk_score, confidence_score = predict_risk(structured_features)

        # 3. XAI Feature Importance
        shap_values_str = generate_shap_values(structured_features, risk_score)

        # 4. Human-readable explanation (Gemini)
        explanation = generate_human_explanation(shap_values_str)

        # In production, save to Database and Redis here
        
        return {
            "user_id": user_id,
            "risk_score": risk_score,
            "confidence_score": confidence_score,
            "structured_features": structured_features,
            "shap_values": json.loads(shap_values_str),
            "human_explanation": explanation
        }
    except Exception as e:
        return {"error": str(e)}
