"""
Database configuration and session management for FastAPI application
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import logging

from utils.config import settings

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=5,  # Number of connections to maintain
    max_overflow=10,  # Max additional connections when pool is full
    echo=False,  # Set to True for SQL query logging
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for declarative models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.

    Yields:
        Session: SQLAlchemy database session

    Usage:
        @app.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            # Use db session here
            pass
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


async def test_db_connection() -> bool:
    """
    Test database connection health.

    Returns:
        bool: True if connection successful, False otherwise
    """
    try:
        db = SessionLocal()
        try:
            # Execute simple query to test connection
            db.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
            return True
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")
        return False
