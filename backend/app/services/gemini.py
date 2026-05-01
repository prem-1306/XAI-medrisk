import google.generativeai as genai
from app.core.config import settings

import time
import google.api_core.exceptions

# API Key Rotation Logic
API_KEYS = [k.strip() for k in settings.GEMINI_API_KEY.split(",") if k.strip()]
current_key_index = 0

def get_current_model(model_name, temperature=0.1):
    """ Configures and returns a model with the current active API key. """
    global current_key_index
    genai.configure(api_key=API_KEYS[current_key_index])
    return genai.GenerativeModel(model_name, generation_config={"temperature": temperature})

def rotate_api_key():
    """ Switches to the next available API key in the list. """
    global current_key_index
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    print(f"[AI ROTATION] Switched to API Key {current_key_index + 1}/{len(API_KEYS)}")
    genai.configure(api_key=API_KEYS[current_key_index])

def call_gemini_with_retry(model_name, prompt, temperature=0.1, max_retries=None):
    """ Calls Gemini and automatically rotates keys if quota is hit. """
    if max_retries is None:
        max_retries = len(API_KEYS) * 2  # Try each key twice if needed

    for i in range(max_retries):
        try:
            # Re-initialize model with current key
            model = get_current_model(model_name, temperature)
            return model.generate_content(prompt)
        except google.api_core.exceptions.ResourceExhausted as e:
            print(f"[AI QUOTA] Key {current_key_index + 1} exhausted.")
            if len(API_KEYS) > 1:
                rotate_api_key()
                time.sleep(1) # Small pause before retry
            else:
                raise e
        except Exception as e:
            # For other errors, wait a bit and retry
            if i < max_retries - 1:
                time.sleep(1)
                continue
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
    response = call_gemini_with_retry('gemini-2.5-flash-lite', prompt, temperature=0.1)
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
    response = call_gemini_with_retry('gemini-2.5-flash-lite', prompt, temperature=0.4)
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
        response = call_gemini_with_retry('gemini-2.5-flash-lite', prompt, temperature=0.1)
        import json
        # Clean JSON if needed
        res_text = response.text
        json_start = res_text.find('{')
        json_end = res_text.rfind('}') + 1
        return json.loads(res_text[json_start:json_end])
    except Exception as e:
        print(f"[AI ERROR] Evaluation failed: {e}")
        return {"is_sufficient": True, "follow_up_questions": [], "reason": f"API or Parsing failed: {str(e)}"}
