import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Use a highly deterministic model for extraction
extraction_model = genai.GenerativeModel('gemini-1.5-flash', generation_config={"temperature": 0.1})
# Use a slightly more empathetic model for explanation
explanation_model = genai.GenerativeModel('gemini-1.5-pro', generation_config={"temperature": 0.4})

def extract_symptoms_from_text(text: str) -> str:
    """
    Extracts structured health data from raw text.
    """
    prompt = f"""
    Extract health features from the following text into strict JSON format.
    Return ONLY JSON. Do not include markdown formatting.
    Fields to extract (if present): age, gender, symptoms (list of strings).
    Text: {text}
    """
    response = extraction_model.generate_content(prompt)
    return response.text

def generate_human_explanation(shap_json: str) -> str:
    """
    Generates a human-readable explanation based on SHAP values.
    """
    prompt = f"""
    You are an empathetic, professional medical AI assistant.
    Translate the following SHAP feature importance values into a highly readable, patient-friendly, and non-alarmist explanation.
    Break it down into short bullet points if necessary.
    
    CRITICAL: You MUST end your response with this exact disclaimer:
    "Medical Disclaimer: This is not medical advice. Please consult a healthcare professional for clinical diagnoses."
    
    SHAP Data: {shap_json}
    """
    response = explanation_model.generate_content(prompt)
    return response.text
