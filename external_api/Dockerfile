# syntax=docker.io/docker/dockerfile:1

# Production Dockerfile for FastAPI Will Builder API
# Multi-stage build for optimized image size and security

ARG PYTHON_VERSION=3.11

# ================================
# Stage 1: Builder - Install dependencies
# ================================
FROM python:${PYTHON_VERSION}-slim as builder

# Install system dependencies required for building Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv

# Activate virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies into virtual environment
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ================================
# Stage 2: Runtime - Lightweight final image
# ================================
FROM python:${PYTHON_VERSION}-slim

# Install curl for health checks
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user (matching Next.js pattern with UID 1001)
RUN groupadd --system --gid 1001 fastapi && \
    useradd --system --uid 1001 --gid fastapi --shell /bin/bash --create-home fastapi

# Set working directory
WORKDIR /app

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv

# Activate virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=fastapi:fastapi . .

# Set proper permissions
RUN chmod -R 755 /app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Switch to non-root user
USER fastapi

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

# Run uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
