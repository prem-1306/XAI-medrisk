import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.get_pretrained_model("models/gemini-2.0-flash-exp")

async def analyze_symptoms_text(text: str):
    """Analyzes user text to extract a severity score for the ML model."""
    prompt = f"""
    Analyze the following patient's health description and provide a 'Severity Score' between 0.0 (very mild) and 1.0 (extremely critical).
    Text: "{text}"
    Respond ONLY with a single float number.
    """
    try:
        response = model.generate_content(prompt)
        score = float(response.text.strip())
        return max(0.0, min(1.0, score))
    except:
        return 0.5 # Default neutral

async def get_clinical_master_report(data: dict):
    """Generates a comprehensive clinical-style master report."""
    
    risk_score = data.get('risk_score', 0)
    symptoms = data.get('symptoms', [])
    user_text = data.get('text_description', 'No additional details provided.')
    shap_factors = data.get('shap_values', {})
    
    prompt = f"""
    You are a Senior Clinical Diagnostic AI. Generate a professional 'XAI-MedRisk Assessment Report' based on the following data:
    
    Patient Risk Score: {risk_score * 100}%
    Reported Symptoms: {", ".join(symptoms)}
    User Context: "{user_text}"
    Key Risk Factors (SHAP): {shap_factors}
    
    The report should be in professional Markdown format with these sections:
    1. **Executive Summary**: A high-level overview of the health state.
    2. **Risk Analysis**: Explain why the risk score is {risk_score * 100}% and interpret the key SHAP factors.
    3. **Clinical Context**: Analyze the textual description for any red flags.
    4. **Actionable Roadmap**: Specific medical, lifestyle, and diagnostic steps to take.
    5. **Emergency Disclaimer**: Standard medical disclaimer.
    
    Use a professional, clinical but empathetic tone. Keep it concise but detailed.
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error generating master report: {str(e)}"
