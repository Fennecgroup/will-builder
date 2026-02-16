"""
User and Will management service with orchestration logic
"""

import json
import logging
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from models.db_models import User, Will, WillStatus
from services.clerk_service import clerk_service
from models.models import WillContent

logger = logging.getLogger(__name__)


def generate_cuid() -> str:
    """
    Generate a CUID-like identifier for database records.

    Uses timestamp-based ID generation similar to CUID format.
    Format: c[timestamp][random_component]

    Returns:
        str: Generated CUID
    """
    import secrets
    import time

    timestamp = int(time.time() * 1000)  # Milliseconds since epoch
    random_part = secrets.token_hex(8)  # 16 character random hex
    return f"c{timestamp}{random_part}"


async def get_or_create_user(
    db: Session,
    email: str
) -> Tuple[Optional[User], Optional[str]]:
    """
    Get existing user or create new user in both Clerk and database.

    This function implements the correct flow where Clerk is the source of truth:
    1. Checks if user exists in Clerk by email, creates if not found
    2. Extracts Clerk user ID from response
    3. Checks if user exists in database by Clerk ID
    4. Creates DB user record if not found (no rollback to Clerk on failure)

    Args:
        db: Database session
        email: User's email address

    Returns:
        Tuple of (User, error_message)
        - User: Database user object if successful
        - error_message: Error description if operation failed

    Note:
        Creates users with email only - no first/last name.
        User and testator are separate entities.
        Clerk is the authentication authority; DB is synchronized to Clerk.
    """
    try:
        # Step 1: Get or create user in Clerk (Clerk is source of truth)
        logger.info(f"Checking if user exists in Clerk: {email}")
        clerk_user, clerk_error = await clerk_service.get_user_by_email(email)

        if clerk_error and "not found" in clerk_error.lower():
            # User doesn't exist in Clerk, create them
            logger.info(f"User not found in Clerk, creating: {email}")
            clerk_user, clerk_error = await clerk_service.create_user(email)

        if clerk_error or not clerk_user:
            error_msg = f"Failed to get/create Clerk user: {clerk_error}"
            logger.error(error_msg)
            return None, error_msg

        clerk_user_id = clerk_user.get("id")
        if not clerk_user_id:
            error_msg = "Clerk user exists but no ID returned"
            logger.error(error_msg)
            return None, error_msg

        logger.info(f"Clerk user found/created: {clerk_user_id}")

        # Step 2: Check if user exists in database by Clerk ID
        logger.info(f"Checking database for Clerk ID: {clerk_user_id}")
        stmt = select(User).where(User.clerkId == clerk_user_id)
        existing_user = db.execute(stmt).scalar_one_or_none()

        if existing_user:
            logger.info(f"User found in database: {existing_user.id}")
            return existing_user, None

        # Step 3: Create database user record
        logger.info(f"Creating database user with Clerk ID: {clerk_user_id}")
        now = datetime.utcnow()
        new_user = User(
            id=generate_cuid(),
            clerkId=clerk_user_id,
            email=email,
            firstName=None,
            lastName=None,
            createdAt=now,
            updatedAt=now,
        )

        try:
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            logger.info(f"Database user created successfully: {new_user.id}")
            return new_user, None

        except Exception as db_error:
            # Rollback database transaction
            db.rollback()
            logger.error(f"Database user creation failed: {str(db_error)}")

            # Note: Do NOT delete Clerk user - they are valid in Clerk
            # The database should eventually be synchronized with Clerk
            error_msg = f"Database user creation failed: {str(db_error)}"
            return None, error_msg

    except Exception as e:
        logger.error(f"Error in get_or_create_user: {str(e)}")
        return None, f"Unexpected error: {str(e)}"


def create_will_for_user(
    db: Session,
    user: User,
    will_content: WillContent
) -> Tuple[Optional[Will], Optional[str]]:
    """
    Create a Will record for a user.

    Args:
        db: Database session
        user: User object who owns the will
        will_content: Complete will content from API request

    Returns:
        Tuple of (Will, error_message)
        - Will: Database will object if successful
        - error_message: Error description if operation failed
    """
    try:
        # Generate title from testator name
        testator_name = f"{will_content.testator.firstName or ''} {will_content.testator.lastName or ''}".strip() or "Unknown"
        title = f"Will of {testator_name}"

        # Serialize will_content to JSON
        content_json = will_content.model_dump_json()

        logger.info(f"Creating will for user {user.id}: {title}")

        now = datetime.utcnow()
        new_will = Will(
            id=generate_cuid(),
            userId=user.id,
            title=title,
            content=content_json,
            editorContent=None,  # Will be populated later by editor
            status=WillStatus.DRAFT,
            createdAt=now,
            updatedAt=now,
        )

        db.add(new_will)
        db.commit()
        db.refresh(new_will)

        logger.info(f"Will created successfully: {new_will.id}")
        return new_will, None

    except Exception as e:
        db.rollback()
        error_msg = f"Failed to create will: {str(e)}"
        logger.error(error_msg)
        return None, error_msg
