from pydantic import BaseModel

class PredictRequest(BaseModel):
    user_id: str
    text_input: str
    history: list[dict] | None = None


class PredictResponse(BaseModel):
    task_id: str
    status: str
    
class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: dict | None = None
