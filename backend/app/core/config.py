from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "XAI-MedRisk"
    DATABASE_URL: str
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
