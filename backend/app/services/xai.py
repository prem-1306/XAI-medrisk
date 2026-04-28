import json
import random

def generate_shap_values(structured_features: dict, risk_score: float) -> str:
    """
    Dummy XAI feature importance generator.
    In production, uses SHAP TreeExplainer.
    """
    importance = {}
    for key, value in structured_features.items():
        if key == "symptoms":
            importance[key] = round(random.uniform(0.1, 0.4), 2)
        else:
            importance[key] = round(random.uniform(0.01, 0.2), 2)
            
    return json.dumps(importance)
