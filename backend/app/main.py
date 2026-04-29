from fastapi import FastAPI
from app.core.config import settings
from app.core.database import engine, Base

from app.api.v1.router import api_router
from app.core.logger import setup_logging

# Apply production logging config (reloaded)
setup_logging()

# Create database tables (In production, use Alembic for migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API"}
 
