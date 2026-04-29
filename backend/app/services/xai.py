import random

def generate_shap_values(structured_features: dict, risk_score: float) -> dict:
    """
    Simulated XAI feature importance generator.
    Maps risk factors to their contribution to the final risk score.
    """
    importance = {}
    
    # 1. Age contribution
    age = structured_features.get("age", 30)
    if isinstance(age, str):
        try: age = int(age)
        except: age = 30
    
    if age > 60:
        importance["Age (Demographics)"] = round(0.15 + (age - 60) * 0.01, 3)
    elif age < 25:
         importance["Age (Demographics)"] = round(0.05 + (25 - age) * 0.005, 3)
    else:
        importance["Age (Demographics)"] = round(0.02 + random.uniform(0, 0.03), 3)
        
    # 2. Symptoms contribution
    symptoms = structured_features.get("symptoms", [])
    if isinstance(symptoms, list):
        critical_symptoms = ["chest pain", "shortness of breath", "severe dizziness", "numbness"]
        for sym in symptoms:
            label = sym.capitalize()
            if any(crit in sym.lower() for crit in critical_symptoms):
                importance[label] = round(0.25 + random.uniform(0, 0.1), 3)
            else:
                importance[label] = round(0.12 + random.uniform(0, 0.08), 3)
            
    # 3. Lifestyle contribution
    feat_str = str(structured_features).lower()
    if "smoking" in feat_str or "smoker" in feat_str:
        importance["Tobacco History"] = round(0.20 + random.uniform(0, 0.05), 3)
    if "diabetes" in feat_str or "high blood sugar" in feat_str:
        importance["Metabolic Profile"] = round(0.22 + random.uniform(0, 0.05), 3)
    if "hypertension" in feat_str or "high blood pressure" in feat_str:
        importance["Blood Pressure"] = round(0.18 + random.uniform(0, 0.05), 3)
    if "alcohol" in feat_str:
        importance["Alcohol Intake"] = round(0.08 + random.uniform(0, 0.04), 3)
        
    # Add an environmental/genetic baseline for variety if factors are low
    if len(importance) < 3:
        importance["Genetic Predisposition"] = round(0.05 + random.uniform(0, 0.05), 3)
    
    # Sort and take top 5
    sorted_importance = dict(sorted(importance.items(), key=lambda item: item[1], reverse=True)[:5])
    
    # Normalize to ensure they look like percentages relative to risk if needed, 
    # but here we return absolute impact values.
    return sorted_importance
