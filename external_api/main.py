"""
FastAPI application for Fennec Will Builder - External Testator Information API
"""

from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text

from models.models import (
    WillContent,
    WillContentResponse,
    HealthCheckResponse,
)
from utils.config import settings
from utils.database import get_db, test_db_connection
from utils.auth import require_auth, optional_auth
from services.user_service import get_or_create_user, create_will_for_user

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
    allow_origins= ["*"], #settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Verify database connection on startup"""
    logger.info("Starting up - checking database connection...")
    # db_ok = await test_db_connection()
    # if not db_ok:
    #     logger.error("Database connection failed on startup")
    # else:
    #     logger.info("Database connection successful")


@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint - API information"""
    return {
        "message": "Fennec Will Builder API External",
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs",
    }


@app.get("/health", response_model=HealthCheckResponse)
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint with database connection test"""
    db_status = "disconnected"
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        logger.error(f"Health check database test failed: {str(e)}")

    return HealthCheckResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        service="will-builder-api",
        db=db_status,
    )


@app.get("/api/v1/profile", response_model=Dict[str, str])
async def get_profile(email: str = Depends(require_auth)):
    """
    Get authenticated user profile.

    Protected endpoint that requires JWT authentication.
    Returns the authenticated user's email extracted from the token.

    Args:
        email: User email from JWT token (injected by require_auth dependency)

    Returns:
        Dictionary with authenticated user information

    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    logger.info(f"Profile accessed by user: {email}")
    return {
        "authenticated_user": email,
        "message": "Successfully authenticated",
        "timestamp": datetime.utcnow().isoformat(),
    }


@app.post(
    "/api/v1/testator",
    response_model=WillContentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_will(
    will_content: WillContent,
    user_email: str = Depends(require_auth),
    db: Session = Depends(get_db)):
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
        db: Database session dependency

    Returns:
        WillContentResponse with confirmation and generated will ID

    Raises:
        HTTPException: If validation fails or processing error occurs
    """
    try:
        testator_name = f"{will_content.testator.firstName or ''} {will_content.testator.lastName or ''}".strip() or "Unknown"
        logger.info(f"Received will content for testator: {testator_name}")

        # Extract user email (always provided)
        #user_email = will_content.user_email
        logger.info(f"Processing will for user email: {user_email}")

        # Step 1: Get or create user (creates in Clerk and DB if needed)
        user, user_error = await get_or_create_user(db, user_email)

        if user_error or not user:
            logger.error(f"Failed to get or create user: {user_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process user account",
            )

        logger.info(f"User processed successfully: {user.id}")

        # Step 2: Create will for user
        will, will_error = create_will_for_user(db, user, will_content)

        if will_error or not will:
            logger.error(f"Failed to create will: {will_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create will record",
            )

        logger.info(f"Will created successfully: {will.id}")

        return WillContentResponse(
            success=True,
            will_id=will.id,
            message="Will content received and validated successfully",
            timestamp=datetime.utcnow(),
        )

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Validation error: {str(e)}",
        )
    except Exception as e:
        logger.error(f"Error processing testator information: {str(e)}", exc_info=True)
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
