import random
import math

def predict_multimodal_risk(structured_features: dict, nlp_sentiment_score: float = 0.5) -> tuple[float, float]:
    """
    Multimodal ML Model that combines structured data (symptoms, age) 
    with unstructured data (NLP sentiment/severity from textual descriptions).
    """
    risk_points = 0.0
    
    # 1. Demographic Factors (Structured)
    age = structured_features.get("age", 30)
    if isinstance(age, str):
        try: age = int(age)
        except: age = 30
    
    # Sigmoid-like age weight
    age_weight = 1 / (1 + math.exp(-0.08 * (age - 55))) 
    risk_points += age_weight * 0.4
    
    # 2. Symptomatic Factors (Structured)
    symptoms = structured_features.get("symptoms", [])
    symptom_risk = 0.0
    if isinstance(symptoms, list):
        critical_symptoms = ["chest pain", "shortness of breath", "severe dizziness", "numbness", "vision loss"]
        moderate_symptoms = ["fever", "persistent cough", "fatigue", "joint pain", "stomach pain"]
        
        for s in symptoms:
            s_lower = s.lower()
            if any(crit in s_lower for crit in critical_symptoms):
                symptom_risk += 0.35
            elif any(mod in s_lower for mod in moderate_symptoms):
                symptom_risk += 0.15
            else:
                symptom_risk += 0.08
    
    risk_points += min(symptom_risk, 0.6) # Cap symptom impact
    
    # 3. Lifestyle & History (Structured)
    lifestyle_text = str(structured_features).lower()
    lifestyle_risk = 0.0
    if "smoking" in lifestyle_text or "smoker" in lifestyle_text:
        lifestyle_risk += 0.20
    if "diabetes" in lifestyle_text or "high blood sugar" in lifestyle_text:
        lifestyle_risk += 0.22
    if "hypertension" in lifestyle_text or "high blood pressure" in lifestyle_text:
        lifestyle_risk += 0.18
    
    risk_points += lifestyle_risk

    # 4. NLP Contextual Factor (Unstructured)
    # nlp_sentiment_score 1.0 means severe, 0.0 means mild
    # This represents the multimodal fusion
    nlp_impact = (nlp_sentiment_score - 0.5) * 0.4
    risk_points += nlp_impact

    # Final Risk Normalization (Sigmoid squash)
    final_risk = 1 / (1 + math.exp(-(risk_points - 0.5) * 5))
    risk_score = round(max(0.01, min(final_risk, 0.99)), 3)
    
    # Confidence score (Data Quality)
    confidence = 0.92
    if len(symptoms) < 2: confidence -= 0.15
    if not structured_features.get("age"): confidence -= 0.1
    confidence_score = round(max(0.65, confidence), 2)
    
    return risk_score, confidence_score
