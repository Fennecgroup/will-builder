"""
Configuration settings for the FastAPI application
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application settings
    APP_NAME: str = "Fennec Will Builder API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Security settings
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database settings (uncomment and configure as needed)
    # DATABASE_URL: str = "postgresql://user:password@localhost:5432/will_builder"
    # DATABASE_ECHO: bool = False
    # DATABASE_POOL_SIZE: int = 5
    # DATABASE_MAX_OVERFLOW: int = 10

    # MongoDB settings (alternative)
    # MONGODB_URL: str = "mongodb://localhost:27017"
    # MONGODB_DATABASE: str = "will_builder"

    # External API settings (if needed)
    # EXTERNAL_API_KEY: str = ""
    # EXTERNAL_API_URL: str = ""

    # Logging settings
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "app.log"

    # Email settings (for notifications)
    # SMTP_HOST: str = ""
    # SMTP_PORT: int = 587
    # SMTP_USER: str = ""
    # SMTP_PASSWORD: str = ""
    # SMTP_FROM_EMAIL: str = ""

    # File upload settings
    MAX_FILE_SIZE: int = 10485760  # 10MB in bytes
    ALLOWED_FILE_TYPES: List[str] = ["pdf", "jpg", "jpeg", "png"]

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # Feature flags
    ENABLE_SWAGGER: bool = True
    ENABLE_REDOC: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    This ensures settings are only loaded once and reused.
    """
    return Settings()


# Create a global settings instance
settings = get_settings()
