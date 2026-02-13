"""
JWT Authentication utilities for FastAPI
Provides token verification and authentication dependencies
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from utils.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Security scheme for HTTPBearer token extraction
security = HTTPBearer()


class TokenData(BaseModel):
    """Validated token data after JWT verification"""
    email: EmailStr
    exp: Optional[int] = None


def verify_token(token: str) -> str:
    """
    Verify and decode JWT token.

    Args:
        token: JWT token string to verify

    Returns:
        Email address extracted from the token

    Raises:
        HTTPException: If token is invalid, expired, or missing required claims
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode JWT token using secret key and algorithm from settings
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract email from token payload
        email: str = payload.get("app:UserEmailKey")
        if email is None:
            logger.warning("Token missing email claim")
            raise credentials_exception

        # Validate token data structure
        token_data = TokenData(email=email, exp=payload.get("exp"))
        logger.info(f"Token verified successfully for user: {email}")

        return token_data.email

    except JWTError as e:
        logger.error(f"JWT validation error: {str(e)}")

        # Provide specific error messages for common JWT errors
        error_str = str(e).lower()
        if "expired" in error_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif "signature" in error_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise credentials_exception

    except Exception as e:
        logger.error(f"Unexpected error during token verification: {str(e)}")
        raise credentials_exception


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    FastAPI dependency that requires JWT authentication.

    Extracts the Bearer token from the Authorization header,
    verifies it, and returns the authenticated user's email.

    Usage:
        @app.get("/protected")
        async def protected_route(email: str = Depends(require_auth)):
            return {"authenticated_user": email}

    Args:
        credentials: HTTPAuthorizationCredentials from HTTPBearer

    Returns:
        Email address of the authenticated user

    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    if not credentials:
        logger.warning("Authentication attempted without credentials")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify token and extract email
    email = verify_token(credentials.credentials)
    return email


async def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[str]:
    """
    Optional authentication dependency.

    Returns user email if valid token is provided, None otherwise.
    Useful for endpoints that have different behavior for authenticated vs anonymous users.

    Usage:
        @app.get("/public")
        async def public_route(email: Optional[str] = Depends(optional_auth)):
            if email:
                return {"message": f"Hello {email}"}
            return {"message": "Hello anonymous user"}

    Args:
        credentials: Optional HTTPAuthorizationCredentials

    Returns:
        Email address if authenticated, None otherwise
    """
    if credentials is None:
        return None

    try:
        email = verify_token(credentials.credentials)
        return email
    except HTTPException:
        # If token is invalid, return None instead of raising
        return None
