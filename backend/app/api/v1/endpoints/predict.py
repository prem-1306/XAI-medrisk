from fastapi import APIRouter, Depends, HTTPException
from app.schemas.predict import PredictionRequest, PredictionResponse
from app.services.ml import predict_multimodal_risk
from app.services.xai import generate_shap_values
from app.services.gemini import analyze_symptoms_text, get_clinical_master_report
import asyncio

router = APIRouter()

@router.post("/", response_model=PredictionResponse)
async def create_prediction(request: PredictionRequest):
    """
    Main prediction endpoint that integrates ML, NLP, and XAI.
    """
    try:
        # 1. NLP Analysis of user text (Unstructured Data)
        nlp_severity = 0.5
        if request.text_description:
            nlp_severity = await analyze_symptoms_text(request.text_description)
        
        # 2. Multimodal Prediction (Structured + NLP)
        risk_score, confidence_score = predict_multimodal_risk(
            request.dict(), 
            nlp_sentiment_score=nlp_severity
        )
        
        # 3. XAI Generation
        shap_values = generate_shap_values(request.dict(), risk_score, nlp_severity)
        
        # 4. Master AI Report (Gemini)
        # We prepare the context for Gemini
        report_context = {
            "risk_score": risk_score,
            "symptoms": request.symptoms,
            "text_description": request.text_description,
            "shap_values": shap_values
        }
        
        master_report = await get_clinical_master_report(report_context)
        
        return {
            "risk_score": risk_score,
            "confidence_score": confidence_score,
            "shap_values": shap_values,
            "explanation": master_report, # This is now the full Master Report
            "metadata": {
                "nlp_severity": nlp_severity,
                "model_version": "v2.0-multimodal"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
