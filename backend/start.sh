#!/bin/bash

# Start the Celery worker in the background
echo "Starting Celery worker..."
celery -A app.core.celery_app worker --loglevel=info &

# Start the FastAPI application
echo "Starting FastAPI server..."
# Note: $PORT is provided by Render
uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers
