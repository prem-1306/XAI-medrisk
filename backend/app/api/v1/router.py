from fastapi import APIRouter
from app.api.v1.endpoints import predict, tasks, history, health

api_router = APIRouter()
api_router.include_router(predict.router, tags=["predict"])
api_router.include_router(tasks.router, tags=["tasks"])
api_router.include_router(history.router, tags=["history"])
api_router.include_router(health.router, tags=["health"])
