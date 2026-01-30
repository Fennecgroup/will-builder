"""
FastAPI application for Fennec Will Builder - External Testator Information API
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict
import logging
from datetime import datetime

from models import (
    WillContent,
    WillContentResponse,
    HealthCheckResponse,
)
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Fennec Will Builder API",
    description="API for accepting and processing external testator information",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Fennec Will Builder API",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        service="will-builder-api",
    )


@app.post(
    "/api/v1/testator",
    response_model=WillContentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_will(will_content: WillContent):
    """
    Accept complete will content for will creation.

    This endpoint receives comprehensive will information including:
    - Testator personal information
    - Marital status and spouse details
    - Children information
    - Assets and liabilities
    - Beneficiaries with allocations
    - Executors, guardians, trustees, and witnesses
    - Funeral wishes and digital assets
    - Special instructions and legal clauses

    Args:
        will_content: WillContent object containing all will details

    Returns:
        WillContentResponse with confirmation and generated will ID

    Raises:
        HTTPException: If validation fails or processing error occurs
    """
    try:
        logger.info(f"Received will content for: {will_content.testator.fullName}")

        # TODO: check if the user_id exsists in the database. If not create a new clerk user and a normal user
        # TODO: Implement database storage
        # TODO: Integrate with will generation service

        # For now, return a mock response
        will_id = f"WILL-{datetime.utcnow().timestamp()}"

        return WillContentResponse(
            success=True,
            will_id=will_id,
            message="Will content received and validated successfully",
            timestamp=datetime.utcnow(),
        )

    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error processing testator information: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error processing testator information",
        )


@app.get("/api/v1/testator/{testator_id}", response_model=Dict[str, str])
async def get_testator(testator_id: str):
    """
    Retrieve testator information by ID.

    Args:
        testator_id: Unique testator identifier

    Returns:
        Testator information

    Raises:
        HTTPException: If testator not found
    """
    # TODO: Implement database retrieval
    logger.info(f"Retrieving testator: {testator_id}")

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Endpoint not yet implemented",
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
