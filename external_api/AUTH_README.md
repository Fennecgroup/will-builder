# JWT Authentication Implementation

This document describes the JWT authentication system implemented for the Fennec Will Builder API.

## Overview

The API now supports JWT (JSON Web Token) authentication using FastAPI's dependency injection system. This provides secure, stateless authentication for protected endpoints.

## Architecture

### Components

1. **`utils/auth.py`** - Core authentication utilities
   - `verify_token()` - Decodes and validates JWT tokens
   - `require_auth()` - FastAPI dependency for required authentication
   - `optional_auth()` - FastAPI dependency for optional authentication
   - `TokenData` - Pydantic model for validated token data

2. **`utils/config.py`** - JWT configuration
   - `SECRET_KEY` - Key for signing/verifying tokens (change in production!)
   - `ALGORITHM` - HS256 algorithm for JWT
   - `ACCESS_TOKEN_EXPIRE_MINUTES` - Token expiration time (30 minutes)

3. **`main.py`** - Example protected endpoints
   - `/api/v1/profile` - Returns authenticated user's email

## How It Works

### Token Verification Flow

```
1. Client sends request with Authorization header: "Bearer <token>"
2. HTTPBearer extracts token from header
3. verify_token() decodes JWT using SECRET_KEY
4. Email is extracted from token payload
5. Email is returned to route handler
6. Route handler processes authenticated request
```

### Error Handling

The authentication system provides specific error messages:

- **401 Unauthorized** - Missing, invalid, or expired token
- **Token has expired** - Token's expiration time has passed
- **Invalid token signature** - Token was tampered with or wrong secret key
- **Could not validate credentials** - Generic validation error

## Usage

### Protecting Endpoints

#### Required Authentication

```python
from fastapi import Depends
from utils.auth import require_auth

@app.get("/api/v1/protected")
async def protected_route(email: str = Depends(require_auth)):
    """This endpoint requires authentication"""
    return {"user": email, "message": "Access granted"}
```

#### Optional Authentication

```python
from typing import Optional
from utils.auth import optional_auth

@app.get("/api/v1/public")
async def public_route(email: Optional[str] = Depends(optional_auth)):
    """This endpoint works with or without authentication"""
    if email:
        return {"message": f"Hello {email}"}
    return {"message": "Hello anonymous user"}
```

#### With Database Access

```python
from sqlalchemy.orm import Session
from utils.database import get_db
from models.db_models import User

@app.get("/api/v1/my-data")
async def get_my_data(
    email: str = Depends(require_auth),
    db: Session = Depends(get_db)
):
    """Get data for authenticated user"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user.id, "email": user.email}
```

## Testing

### 1. Start the Server

```bash
cd external_api
uvicorn main:app --reload
```

The server will run on http://localhost:8000

### 2. Generate Test Tokens

Use the provided test script to generate JWT tokens:

```bash
# Generate token with default email (test@example.com)
python test_generate_token.py

# Generate token with custom email
python test_generate_token.py --email user@example.com

# Generate token with custom expiration (60 minutes)
python test_generate_token.py --email user@example.com --expires 60

# Generate expired token for testing error handling
python test_generate_token.py --expired
```

### 3. Test Endpoints

#### Test without authentication (should fail)

```bash
curl http://localhost:8000/api/v1/profile
```

Expected response:
```json
{
  "detail": "Not authenticated"
}
```

#### Test with valid token

First, generate a token:
```bash
python test_generate_token.py --email test@example.com
```

Then use the token in the request:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "authenticated_user": "test@example.com",
  "message": "Successfully authenticated",
  "timestamp": "2024-01-15T10:30:00.123456"
}
```

#### Test with expired token

```bash
python test_generate_token.py --expired
TOKEN="<expired_token>"

curl http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "detail": "Token has expired"
}
```

#### Test with invalid token

```bash
curl http://localhost:8000/api/v1/profile \
  -H "Authorization: Bearer invalid_token_here"
```

Expected response:
```json
{
  "detail": "Could not validate credentials"
}
```

### 4. Test with Swagger UI

1. Visit http://localhost:8000/docs
2. Click the **"Authorize"** button (top right, lock icon)
3. Generate a token using `test_generate_token.py`
4. Paste the token in the "Value" field
5. Click **"Authorize"** then **"Close"**
6. Try the `/api/v1/profile` endpoint
7. You should see the lock icon is now closed (authenticated)
8. Click "Try it out" → "Execute" to test the endpoint

## Security Considerations

### ⚠️ CRITICAL: Change Secret Key in Production

The current `SECRET_KEY` in `utils/config.py` is a placeholder:

```python
SECRET_KEY: str = "your-secret-key-here-change-in-production"
```

**Before deploying to production:**

1. Generate a strong random key:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. Store it in environment variables:
   ```bash
   # .env file
   SECRET_KEY=<your-generated-key>
   ```

3. Never commit the production secret key to version control

### Best Practices

- ✅ Use HTTPS in production (tokens should never be sent over HTTP)
- ✅ Set appropriate token expiration times
- ✅ Rotate secret keys periodically
- ✅ Store secrets in environment variables, not in code
- ✅ Use strong, randomly generated secret keys
- ✅ Validate all claims in the JWT payload
- ✅ Log authentication failures for security monitoring

### Token Structure

Tokens should include these claims:

```json
{
  "email": "user@example.com",  // Required - user identifier
  "exp": 1234567890,            // Required - expiration timestamp
  "iat": 1234567890             // Optional - issued at timestamp
}
```

## Integration with Clerk

If you're using Clerk for authentication, you'll need to:

1. Configure Clerk to issue JWT tokens with the `email` claim
2. Use Clerk's secret key in `SECRET_KEY` configuration
3. Or implement a separate Clerk verification function that validates Clerk tokens

Example Clerk integration:
```python
# utils/clerk_auth.py
from clerk import verify_clerk_token

async def verify_clerk_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Clerk-issued JWT tokens"""
    token = credentials.credentials
    # Use Clerk SDK to verify token
    user_data = verify_clerk_token(token)
    return user_data['email']
```

## Troubleshooting

### Common Issues

1. **"Not authenticated" error**
   - Check that you're including the `Authorization: Bearer <token>` header
   - Verify the header format is correct (note the space after "Bearer")

2. **"Token has expired" error**
   - Generate a new token with `test_generate_token.py`
   - Consider increasing `ACCESS_TOKEN_EXPIRE_MINUTES` in config

3. **"Could not validate credentials" error**
   - Verify the `SECRET_KEY` matches the one used to create the token
   - Check that the token wasn't modified or corrupted
   - Ensure the token includes the required `email` claim

4. **"Invalid token signature" error**
   - The `SECRET_KEY` doesn't match the one used to sign the token
   - Verify you're using the correct algorithm (HS256)

### Logging

Authentication events are logged with the following levels:

- `INFO` - Successful token verification
- `WARNING` - Missing claims or credentials
- `ERROR` - Token validation failures

Check logs for debugging:
```bash
# If running with uvicorn
uvicorn main:app --reload --log-level info
```

## Next Steps

1. **Protect sensitive endpoints** - Add `Depends(require_auth)` to endpoints that need authentication
2. **Implement token refresh** - Add refresh token functionality for long-lived sessions
3. **Add role-based access control** - Extend tokens to include user roles/permissions
4. **Integrate with Clerk** - Connect with Clerk authentication if not already done
5. **Add rate limiting** - Prevent brute force attacks on authentication
6. **Implement token revocation** - Add ability to invalidate tokens before expiration

## API Documentation

Once the server is running, view the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

Protected endpoints will show a lock icon and require authentication in the Swagger UI.
