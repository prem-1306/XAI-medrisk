from fastapi import APIRouter
from app.core.database import engine
from sqlalchemy import text
import logging

logger = logging.getLogger("xaimedrisk.health")
router = APIRouter()

@router.get("/health", status_code=200)
async def health_check():
    """
    Production health check endpoint.
    Used by load balancers and container orchestration (Docker/K8s).
    """
    db_status = "healthy"
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "unhealthy"

    return {
        "status": "ok",
        "database": db_status,
        "service": "XAI-MedRisk API"
    }
