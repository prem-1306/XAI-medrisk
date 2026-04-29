import json
import time
from app.core.celery_app import celery_app
from app.services.gemini import extract_symptoms_from_text, generate_human_explanation
from app.services.ml import predict_risk
from app.services.xai import generate_shap_values
from app.core.database import SessionLocal
from app.models.prediction import Task, HealthInput, Prediction

@celery_app.task(name="process_prediction")
def process_prediction(text_input: str, user_id: str, task_id: str):
    """
    Background task that orchestrates the AI pipeline and saves to DB.
    """
    db = SessionLocal()
    try:
        # Update task status to processing
        task = db.query(Task).filter(Task.id == task_id).first()
        if task:
            task.status = "processing"
            db.commit()

        # 1. NLP Extraction (Gemini)
        print(f"\n[AI BRAIN] Input received: '{text_input}'")
        extracted_json_str = extract_symptoms_from_text(text_input)
        print(f"[AI BRAIN] Raw Gemini Response: {extracted_json_str}")
        
        try:
            # Clean JSON more aggressively
            json_start = extracted_json_str.find('{')
            json_end = extracted_json_str.rfind('}') + 1
            if json_start != -1 and json_end != 0:
                extracted_json_str = extracted_json_str[json_start:json_end]
            
            structured_features = json.loads(extracted_json_str)
            print(f"[AI BRAIN] Successfully parsed features: {structured_features}")
        except Exception as e:
            print(f"[AI ERROR] JSON Parsing Error: {e}")
            # Fallback parsing
            structured_features = {"raw_text": text_input, "analysis_error": f"JSON parsing failed: {str(e)}"}

        # Update task with early results (e.g. body locations) for UI
        if task:
            task.result = {"structured_features": structured_features}
            db.commit()

        # Simulate processing time for UX (animations)
        time.sleep(3)

        # 2. ML Prediction
        risk_score, confidence_score = predict_risk(structured_features)
        risk_category = "High" if risk_score > 0.7 else "Medium" if risk_score > 0.3 else "Low"

        # 3. XAI Feature Importance
        shap_values_dict = generate_shap_values(structured_features, risk_score)

        # 4. Human-readable explanation (Gemini)
        explanation = generate_human_explanation(json.dumps(shap_values_dict))
        print(f"[AI BRAIN] Generated Clinical Explanation: {explanation[:100]}...")

        # 5. Save to Database
        health_input = HealthInput(
            user_id=user_id,
            raw_text_input=text_input,
            structured_features=structured_features
        )
        db.add(health_input)
        db.flush()

        prediction_record = Prediction(
            user_id=user_id,
            input_id=health_input.id,
            risk_score=risk_score,
            risk_category=risk_category,
            shap_values=shap_values_dict,
            human_explanation=explanation
        )
        db.add(prediction_record)

        result = {
            "risk_score": risk_score,
            "risk_category": risk_category,
            "confidence_score": confidence_score,
            "shap_values": shap_values_dict,
            "human_explanation": explanation,
            "structured_features": structured_features
        }

        # Update task with result
        if task:
            task.status = "completed"
            task.result = result
            db.commit()
            
        return result

    except Exception as e:
        db.rollback()
        task = db.query(Task).filter(Task.id == task_id).first()
        if task:
            task.status = "failed"
            task.result = {"error": str(e)}
            db.commit()
        return {"error": str(e)}
    finally:
        db.close()

def process_prediction_local(text_input: str, user_id: str, task_id: str):
    """
    Wrapper for local execution when Celery worker is not running.
    """
    # Create the task record first
    db = SessionLocal()
    task = Task(id=task_id, status="pending")
    db.add(task)
    db.commit()
    db.close()
    
    # Run the processing (normally this would be on a worker)
    return process_prediction(text_input, user_id, task_id)
