from fastapi import APIRouter

router = APIRouter()

@router.get("/history/{user_id}")
async def get_history(user_id: str):
    """
    Retrieves prediction history for a specific user.
    """
    # In production, fetch from PostgreSQL using SQLAlchemy session
    return {
        "user_id": user_id,
        "history": [
            {
                "id": "mock_id_1",
                "risk_score": 0.75,
                "created_at": "2023-10-27T10:00:00Z"
            }
        ]
    }
