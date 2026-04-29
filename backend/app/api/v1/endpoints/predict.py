from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from app.schemas.predict import PredictRequest, PredictResponse
from app.worker import process_prediction_local
import uuid

router = APIRouter()

@router.post("/predict/async", response_model=PredictResponse, status_code=status.HTTP_202_ACCEPTED)
async def predict_async(request: PredictRequest, background_tasks: BackgroundTasks):
    """
    Accepts user input and dispatches a background task.
    """
    if not request.text_input.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty")

    task_id = str(uuid.uuid4())
    background_tasks.add_task(process_prediction_local, request.text_input, request.user_id, task_id)
    
    return PredictResponse(task_id=task_id, status="processing")
from app.services.gemini import evaluate_input_sufficiency

@router.post("/evaluate")
async def evaluate_input(request: PredictRequest):
    """
    Evaluates if the input is sufficient for prediction.
    """
    if not request.text_input.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty")
        
    evaluation = evaluate_input_sufficiency(request.text_input)
    return evaluation
