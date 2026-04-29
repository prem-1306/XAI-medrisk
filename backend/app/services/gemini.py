import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Use gemini-2.5-flash-lite for the highest free tier limit (1,000 requests/day)
extraction_model = genai.GenerativeModel('gemini-2.5-flash-lite', generation_config={"temperature": 0.1})
# Use the same model for explanation
explanation_model = genai.GenerativeModel('gemini-2.5-flash-lite', generation_config={"temperature": 0.4})

import time
import google.api_core.exceptions

def call_gemini_with_retry(model, prompt, max_retries=3):
    """ Helper to call Gemini with exponential backoff for 429 errors. """
    for i in range(max_retries):
        try:
            return model.generate_content(prompt)
        except google.api_core.exceptions.ResourceExhausted as e:
            if i == max_retries - 1:
                raise e
            wait_time = (2 ** i) + 1
            print(f"[AI RETRY] Quota hit. Waiting {wait_time}s before retry {i+1}/{max_retries}...")
            time.sleep(wait_time)
        except Exception as e:
            raise e

def extract_symptoms_from_text(text: str) -> str:
    """
    Extracts structured health data from raw text, including mapping symptoms to body parts.
    """
    prompt = f"""
    You are a medical data extractor. Extract health features from the following text into strict JSON format.
    Return ONLY JSON. Do not include markdown formatting.
    
    Fields to extract:
    1. name: string
    2. age: integer
    3. gender: string
    4. symptoms: list of strings
    5. systolic: integer (if provided)
    6. diastolic: integer (if provided)
    7. pulse_pressure: integer (if provided)
    8. bmi: float (if provided)
    9. body_locations: list of strings. Map each symptom to one of these body parts: 
       ['head', 'neck', 'chest', 'abdomen', 'pelvis', 'arms', 'legs', 'back'].
    
    Text: {text}
    """
    response = call_gemini_with_retry(extraction_model, prompt)
    return response.text

def generate_human_explanation(shap_json: str) -> str:
    """
    Generates a human-readable explanation based on SHAP values.
    """
    prompt = f"""
    You are an empathetic, professional medical AI assistant.
    Translate the following SHAP feature importance values into a highly readable, patient-friendly, and non-alarmist explanation.
    
    Additionally, provide a section called "Immediate Care & Relief" with 2-3 safe, non-prescription suggestions for temporary relief until they can see a doctor (e.g., rest, hydration, positioning, or common home care).
    
    CRITICAL: You MUST end your response with this exact disclaimer:
    "Medical Disclaimer: This is not medical advice. Please consult a healthcare professional for clinical diagnoses."
    
    SHAP Data: {shap_json}
    """
    response = call_gemini_with_retry(explanation_model, prompt)
    return response.text

def evaluate_input_sufficiency(text: str) -> dict:
    """
    Evaluates if the provided text is sufficient for a medical risk assessment.
    Returns a status and professional clinical follow-up questions if needed.
    """
    prompt = f"""
    You are a world-class Senior Clinical Consultant. Analyze this patient's description:
    "{text}"
    
    A real doctor needs to know specific details before making a risk assessment. 
    If the input is missing critical clinical context, generate a professional, empathetic follow-up.
    
    Focus on these 4 pillars if missing:
    1. Chronicity: How long has this been happening?
    2. Intensity/Quality: Is it sharp, dull, constant, or intermittent?
    3. Medications: Are you currently taking any medications or have existing conditions?
    4. Triggers: Does anything make it better or worse?
    
    Return ONLY a JSON object:
    {{
      "is_sufficient": boolean,
      "follow_up_questions": [
        "First specific professional question (e.g., 'How long have you been experiencing this pain?')",
        "Second specific professional question (e.g., 'Are you currently taking any medications for it?')"
      ],
      "reason": "clinical gap identified"
    }}
    """
    try:
        response = call_gemini_with_retry(extraction_model, prompt)
        import json
        # Clean JSON if needed
        res_text = response.text
        json_start = res_text.find('{')
        json_end = res_text.rfind('}') + 1
        return json.loads(res_text[json_start:json_end])
    except Exception as e:
        print(f"[AI ERROR] Evaluation failed: {e}")
        return {"is_sufficient": True, "follow_up_questions": [], "reason": f"API or Parsing failed: {str(e)}"}
