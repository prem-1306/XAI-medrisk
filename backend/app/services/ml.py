import random

def predict_risk(structured_features: dict) -> tuple[float, float]:
    """
    Dummy ML Model predicting risk score and confidence score based on features.
    In production, this loads an XGBoost .pkl model.
    """
    # For now, return a dummy probability based on age or random
    age = structured_features.get("age", 30)
    base_risk = min(age / 100.0, 0.95)
    risk_score = round(base_risk + random.uniform(-0.05, 0.05), 2)
    confidence_score = round(random.uniform(0.85, 0.98), 2)
    return risk_score, confidence_score
