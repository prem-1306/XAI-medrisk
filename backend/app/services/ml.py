import random

def predict_risk(structured_features: dict) -> tuple[float, float]:
    """
    Simulated ML Model predicting risk score and confidence score.
    Calculates risk based on age, symptoms, and lifestyle factors.
    """
    risk_points = 0.0
    
    # 1. Demographic Factors
    age = structured_features.get("age", 30)
    if isinstance(age, str):
        try: age = int(age)
        except: age = 30
    
    if age > 75: risk_points += 0.45
    elif age > 60: risk_points += 0.30
    elif age > 45: risk_points += 0.15
    elif age < 18: risk_points += 0.05
    
    # 2. Symptomatic Factors (Weighted)
    symptoms = structured_features.get("symptoms", [])
    if isinstance(symptoms, list):
        critical_symptoms = ["chest pain", "shortness of breath", "severe dizziness", "numbness"]
        moderate_symptoms = ["fever", "persistent cough", "fatigue", "joint pain"]
        
        for s in symptoms:
            s_lower = s.lower()
            if any(crit in s_lower for crit in critical_symptoms):
                risk_points += 0.35
            elif any(mod in s_lower for mod in moderate_symptoms):
                risk_points += 0.15
            else:
                risk_points += 0.08
    
    # 3. Lifestyle & History Factors
    lifestyle_text = str(structured_features).lower()
    if "smoking" in lifestyle_text or "smoker" in lifestyle_text:
        risk_points += 0.22
    if "diabetes" in lifestyle_text or "high blood sugar" in lifestyle_text:
        risk_points += 0.25
    if "hypertension" in lifestyle_text or "high blood pressure" in lifestyle_text:
        risk_points += 0.20
    if "alcohol" in lifestyle_text and ("daily" in lifestyle_text or "frequent" in lifestyle_text):
        risk_points += 0.12
    
    # Base risk normalization (cap at 0.98)
    base_risk = min(risk_points, 0.98)
    
    # Add a small amount of model uncertainty (stochastic element)
    risk_score = round(base_risk + random.uniform(-0.03, 0.03), 3)
    risk_score = max(0.02, min(risk_score, 0.99))
    
    # Confidence score based on data completeness
    confidence = 0.95
    if len(symptoms) < 2: confidence -= 0.1
    if not structured_features.get("age"): confidence -= 0.05
    confidence_score = round(confidence + random.uniform(-0.02, 0.02), 2)
    
    return risk_score, confidence_score
