# Use Python 3.11 as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml uv.lock ./
COPY main.py ./
COPY zem.json ./

# Install uv (fast Python package installer)
RUN pip install uv

# Install Python dependencies
RUN uv sync --frozen

# Expose ports
EXPOSE 8000 7860

# Start script
CMD ["sh", "-c", "uv run langflow run --host 0.0.0.0 --port 7860 & uv run uvicorn main:app --host 0.0.0.0 --port 8000"]
