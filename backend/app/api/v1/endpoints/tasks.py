from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.predict import TaskStatusResponse
from app.core.database import get_db
from app.models.prediction import Task

router = APIRouter()

@router.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str, db: Session = Depends(get_db)):
    """
    Checks the status of an asynchronous prediction task from DB.
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return TaskStatusResponse(
        task_id=task_id, 
        status=task.status, 
        result=task.result
    )
