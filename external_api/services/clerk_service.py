"""
Clerk Backend API integration service
"""

import httpx
import logging
from typing import Optional, Dict, Any
from utils.config import settings

logger = logging.getLogger(__name__)


class ClerkService:
    """Service for interacting with Clerk Backend API"""

    def __init__(self):
        self.api_base_url = settings.CLERK_API_BASE_URL
        self.secret_key = settings.CLERK_SECRET_KEY

        if not self.secret_key:
            logger.warning("CLERK_SECRET_KEY not configured - Clerk operations will fail")

    def _get_headers(self) -> Dict[str, str]:
        """Get HTTP headers for Clerk API requests"""
        return {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json",
        }

    async def create_user(self, email: str) -> tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Create a new user in Clerk with email only.

        Args:
            email: User's email address

        Returns:
            Tuple of (user_data, error_message)
            - user_data: Dict containing Clerk user data with 'id' field
            - error_message: Error description if creation failed

        Note:
            Creates Clerk user with email only, no first/last name.
            User and testator are different entities.
        """
        url = f"{self.api_base_url}/users"
        payload = {
            "email_address": [email],
            "skip_password_checks": True,
            "skip_password_requirement": True,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload, headers=self._get_headers())

                if response.status_code == 200:
                    user_data = response.json()
                    logger.info(f"Clerk user created successfully: {user_data.get('id')}")
                    return user_data, None

                elif response.status_code == 422:
                    # User already exists
                    error_data = response.json()
                    logger.info(f"Clerk user already exists: {email}")
                    return None, f"User with email {email} already exists in Clerk"

                else:
                    error_msg = f"Clerk API error: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    return None, error_msg

        except httpx.TimeoutException:
            error_msg = "Clerk API request timed out"
            logger.error(error_msg)
            return None, error_msg
        except Exception as e:
            error_msg = f"Error creating Clerk user: {str(e)}"
            logger.error(error_msg)
            return None, error_msg

    async def get_user_by_email(self, email: str) -> tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Get Clerk user by email address.

        Args:
            email: User's email address

        Returns:
            Tuple of (user_data, error_message)
            - user_data: Dict containing Clerk user data
            - error_message: Error description if lookup failed
        """
        url = f"{self.api_base_url}/users"
        params = {"email_address": [email]}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, params=params, headers=self._get_headers())

                if response.status_code == 200:
                    users = response.json()
                    if users and len(users) > 0:
                        logger.info(f"Found Clerk user: {users[0].get('id')}")
                        return users[0], None
                    else:
                        return None, "User not found in Clerk"

                else:
                    error_msg = f"Clerk API error: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    return None, error_msg

        except Exception as e:
            error_msg = f"Error fetching Clerk user: {str(e)}"
            logger.error(error_msg)
            return None, error_msg

    async def delete_user(self, user_id: str) -> tuple[bool, Optional[str]]:
        """
        Delete a user from Clerk (used for cleanup on errors).

        Args:
            user_id: Clerk user ID

        Returns:
            Tuple of (success, error_message)
            - success: True if deletion successful
            - error_message: Error description if deletion failed
        """
        url = f"{self.api_base_url}/users/{user_id}"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.delete(url, headers=self._get_headers())

                if response.status_code == 200:
                    logger.info(f"Clerk user deleted successfully: {user_id}")
                    return True, None
                else:
                    error_msg = f"Failed to delete Clerk user: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    return False, error_msg

        except Exception as e:
            error_msg = f"Error deleting Clerk user: {str(e)}"
            logger.error(error_msg)
            return False, error_msg


# Global ClerkService instance
clerk_service = ClerkService()
