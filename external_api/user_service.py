"""
User and Will management service with orchestration logic
"""

import json
import logging
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime

from db_models import User, Will, WillStatus
from clerk_service import clerk_service
from models import WillContent

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

    This function:
    1. Checks if user exists in DB by email
    2. If not found, creates Clerk user with email only
    3. Creates DB user record with Clerk ID
    4. Handles rollback: if DB fails, deletes Clerk user

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
    """
    try:
        # Step 1: Check if user exists in database
        logger.info(f"Checking if user exists: {email}")
        stmt = select(User).where(User.email == email)
        existing_user = db.execute(stmt).scalar_one_or_none()

        if existing_user:
            logger.info(f"User found in database: {existing_user.id}")
            return existing_user, None

        # Step 2: User doesn't exist - create in Clerk first
        logger.info(f"User not found, creating Clerk user: {email}")
        clerk_user, clerk_error = await clerk_service.create_user(email)

        if clerk_error or not clerk_user:
            error_msg = f"Failed to create Clerk user: {clerk_error}"
            logger.error(error_msg)
            return None, error_msg

        clerk_user_id = clerk_user.get("id")
        if not clerk_user_id:
            error_msg = "Clerk user created but no ID returned"
            logger.error(error_msg)
            return None, error_msg

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

            # Cleanup: Delete Clerk user since DB creation failed
            logger.info(f"Rolling back: deleting Clerk user {clerk_user_id}")
            await clerk_service.delete_user(clerk_user_id)

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
