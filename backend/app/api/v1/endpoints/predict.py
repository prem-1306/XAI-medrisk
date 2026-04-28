from fastapi import APIRouter, HTTPException, status
from app.schemas.predict import PredictRequest, PredictResponse
from app.worker import process_prediction

router = APIRouter()

@router.post("/predict/async", response_model=PredictResponse, status_code=status.HTTP_202_ACCEPTED)
async def predict_async(request: PredictRequest):
    """
    Accepts user input and dispatches a background task.
    """
    if not request.text_input.strip():
        raise HTTPException(status_code=400, detail="Text input cannot be empty")

    # Dispatch Celery Task
    task = process_prediction.delay(request.text_input, request.user_id)
    
    return PredictResponse(task_id=task.id, status="processing")
