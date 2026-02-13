"""
Test script to generate JWT tokens for testing authentication.

Usage:
    python test_generate_token.py
    python test_generate_token.py --email user@example.com
    python test_generate_token.py --email user@example.com --expires 60
"""

import argparse
from jose import jwt
from datetime import datetime, timedelta
from utils.config import settings


def generate_test_token(email: str, expire_minutes: int = 30) -> str:
    """
    Generate a test JWT token.

    Args:
        email: Email address to include in the token
        expire_minutes: Token expiration time in minutes

    Returns:
        Encoded JWT token string
    """
    # Create token payload
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=expire_minutes),
        "iat": datetime.utcnow(),
    }

    # Encode token
    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return token


def generate_expired_token(email: str) -> str:
    """
    Generate an expired JWT token for testing error handling.

    Args:
        email: Email address to include in the token

    Returns:
        Expired JWT token string
    """
    payload = {
        "email": email,
        "exp": datetime.utcnow() - timedelta(minutes=5),  # Expired 5 minutes ago
        "iat": datetime.utcnow() - timedelta(minutes=35),
    }

    token = jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return token


def main():
    parser = argparse.ArgumentParser(
        description="Generate JWT tokens for testing authentication"
    )
    parser.add_argument(
        "--email",
        type=str,
        default="test@example.com",
        help="Email address to include in the token (default: test@example.com)"
    )
    parser.add_argument(
        "--expires",
        type=int,
        default=30,
        help="Token expiration time in minutes (default: 30)"
    )
    parser.add_argument(
        "--expired",
        action="store_true",
        help="Generate an expired token for testing error handling"
    )

    args = parser.parse_args()

    print("=" * 80)
    print("JWT Token Generator for Fennec Will Builder API")
    print("=" * 80)
    print(f"\nConfiguration:")
    print(f"  Algorithm: {settings.ALGORITHM}")
    print(f"  Secret Key: {settings.SECRET_KEY[:20]}... (truncated)")
    print()

    if args.expired:
        print("Generating EXPIRED token...")
        token = generate_expired_token(args.email)
        print(f"  Email: {args.email}")
        print(f"  Status: Expired 5 minutes ago")
    else:
        print("Generating valid token...")
        token = generate_test_token(args.email, args.expires)
        print(f"  Email: {args.email}")
        print(f"  Expires in: {args.expires} minutes")

    print()
    print("=" * 80)
    print("TOKEN:")
    print("=" * 80)
    print(token)
    print("=" * 80)
    print()
    print("Usage examples:")
    print()
    print("1. Using curl:")
    print(f'   curl http://localhost:8000/api/v1/profile \\')
    print(f'     -H "Authorization: Bearer {token}"')
    print()
    print("2. Using httpie:")
    print(f'   http GET http://localhost:8000/api/v1/profile \\')
    print(f'     "Authorization: Bearer {token}"')
    print()
    print("3. Using Python requests:")
    print(f'   import requests')
    print(f'   headers = {{"Authorization": "Bearer {token}"}}')
    print(f'   response = requests.get("http://localhost:8000/api/v1/profile", headers=headers)')
    print()
    print("4. In Swagger UI:")
    print("   - Visit http://localhost:8000/docs")
    print("   - Click the 'Authorize' button")
    print(f"   - Paste the token: {token}")
    print("   - Click 'Authorize' and close the dialog")
    print("   - Try the /api/v1/profile endpoint")
    print()


if __name__ == "__main__":
    main()
