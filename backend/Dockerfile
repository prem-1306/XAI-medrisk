FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for psycopg2 and building ML libs)
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose port for FastAPI
EXPOSE 8000

# Make the start script executable
RUN chmod +x start.sh

# Command to run both FastAPI and Celery
CMD ["./start.sh"]
