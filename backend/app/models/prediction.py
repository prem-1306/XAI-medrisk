from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True)
    status = Column(String, default="pending") # pending, processing, completed, failed
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)

class HealthInput(Base):
    __tablename__ = "health_inputs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    raw_text_input = Column(Text, nullable=True)
    structured_features = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    prediction = relationship("Prediction", back_populates="health_input", uselist=False)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    input_id = Column(String, ForeignKey("health_inputs.id"), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_category = Column(String, nullable=False)
    shap_values = Column(JSON, nullable=False)
    human_explanation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    health_input = relationship("HealthInput", back_populates="prediction")
