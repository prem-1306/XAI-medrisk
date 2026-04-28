from fastapi import APIRouter, HTTPException
from celery.result import AsyncResult
from app.core.celery_app import celery_app
from app.schemas.predict import TaskStatusResponse

router = APIRouter()

@router.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    Checks the status of an asynchronous prediction task.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    if task_result.state == "PENDING":
        return TaskStatusResponse(task_id=task_id, status="pending")
    elif task_result.state == "SUCCESS":
        return TaskStatusResponse(task_id=task_id, status="completed", result=task_result.result)
    elif task_result.state == "FAILURE":
        return TaskStatusResponse(task_id=task_id, status="failed", result={"error": str(task_result.info)})
    else:
        return TaskStatusResponse(task_id=task_id, status=task_result.state.lower())
