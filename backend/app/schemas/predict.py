from pydantic import BaseModel

class PredictRequest(BaseModel):
    user_id: str
    text_input: str

class PredictResponse(BaseModel):
    task_id: str
    status: str
    
class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: dict | None = None
