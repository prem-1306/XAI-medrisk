# 🚀 XAI-MedRisk: Explainable Multimodal Health Risk Prediction System

## Overview
**XAI-MedRisk** is a production-grade, asynchronous health risk prediction application. It bridges the gap between complex Machine Learning models and patient comprehension by using **Google Gemini** for intelligent symptom extraction and **Explainable AI (SHAP)** to mathematically prove *why* the AI made a specific prediction.

It is built with a strictly decoupled architecture, utilizing the **Model Context Protocol (MCP)** to expose deterministic ML models as tools to Generative AI orchestrators.

---

## 🏗️ Architecture Overview
- **FastAPI:** High-performance, asynchronous Python backend serving as the API gateway.
- **Celery + Redis:** Asynchronous task queue handling heavy AI processing without blocking user requests.
- **MCP (Model Context Protocol):** Secure tool registry that wraps ML and XAI libraries, allowing Generative AI to safely call them.
- **Gemini API:** Cognitive engine responsible for two strict tasks: NLP symptom extraction from raw user text, and synthesizing complex XAI math into empathetic, human-readable advice.
- **ML + SHAP:** Deterministic layer (e.g., XGBoost) for computing exact health risk probabilities, paired with SHAP (SHapley Additive exPlanations) for absolute transparency.

---

## ✨ Features
- **🧠 AI Risk Prediction:** Fuses unstructured NLP symptoms with structured patient data to predict health risks.
- **🔍 Explainable AI (XAI):** Generates SHAP feature importance charts so users know exactly which symptoms drove their score.
- **⚡ Async Processing:** Seamless user experience powered by WebSockets/Polling and Celery background workers.
- **📊 Dashboard & History:** Secure, minimal-retention PostgreSQL database to track historical health trends over time.

---

## 🛠️ Tech Stack
- **Backend:** Python 3.11, FastAPI, Pydantic, SQLAlchemy
- **Async/Queue:** Celery, Redis
- **AI / ML:** Google Gemini API, MCP SDK, Scikit-Learn / XGBoost, SHAP
- **Database:** PostgreSQL
- **DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD)
- **Frontend (Stitch):** Clean healthcare mobile UI (Blue/Green/White)

---

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/xai-medrisk.git
cd xai-medrisk
```

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PROJECT_NAME="XAI-MedRisk"
DATABASE_URL="postgresql://postgres:password@db:5432/xaimedrisk"
CELERY_BROKER_URL="redis://redis:6379/0"
CELERY_RESULT_BACKEND="redis://redis:6379/0"
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

### 3. Run via Docker Compose
Deploy the entire stack (FastAPI, Celery, Redis, Postgres) with one command:
```bash
cd backend
docker-compose up --build -d
```
The API will be automatically available at `http://localhost:8000`.

---

## 🔌 API Endpoints

- `POST /api/v1/predict/async` - Submits a health text payload and returns a Celery task ID (HTTP 202).
- `GET /api/v1/tasks/{id}` - Polls the status of the AI pipeline (Pending, Processing, Completed).
- `GET /api/v1/history/{user_id}` - Retrieves past risk predictions and SHAP data.
- `GET /api/v1/health` - DevOps endpoint for load balancers to verify DB and API uptime.

---

## 📸 Screenshots
*(Placeholder for UI screenshots: Input Screen, Results Dashboard, XAI Breakdown)*
> ![Dashboard Screenshot](https://via.placeholder.com/250x500?text=Dashboard+Screen) | ![XAI Screenshot](https://via.placeholder.com/250x500?text=XAI+Screen)

---

## 🔮 Future Improvements
- **MLflow Integration:** Add robust model versioning, tracking, and shadow deployment capabilities.
- **Wearables Integration:** Ingest continuous time-series data from Apple HealthKit / Google Fit.
- **Doctor Portal:** Create a dedicated clinician view showing advanced LIME matrices instead of simplified patient summaries.

---

## ⚠️ Medical Disclaimer
> **Medical Disclaimer:** This application is a technical demonstration. It is not medical advice. Please consult a qualified healthcare professional for clinical diagnoses and treatment.
