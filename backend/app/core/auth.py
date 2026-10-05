import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings


# ---------------------------------------------------------------------------
# Supabase JWT configuration
# ---------------------------------------------------------------------------

SUPABASE_ISSUER = f"{settings.SUPABASE_URL}/auth/v1"
SUPABASE_JWKS_URL = f"{SUPABASE_ISSUER}/.well-known/jwks.json"

security = HTTPBearer(auto_error=False)

jwks_client = jwt.PyJWKClient(SUPABASE_JWKS_URL)


# ---------------------------------------------------------------------------
# Get authenticated user from Supabase access token
# ---------------------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Validate the Supabase access token and return the authenticated user
    claims.

    The user ID is taken from the JWT 'sub' claim and must never be supplied
    by the frontend as a trusted value.
    """

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        # Retrieve the public signing key from Supabase JWKS.
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the JWT.
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=SUPABASE_ISSUER,
        )

        # Supabase JWT must contain a user ID.
        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token audience.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to validate authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# Get authenticated user ID
# ---------------------------------------------------------------------------

def get_current_user_id(
    current_user: dict = Depends(get_current_user),
) -> str:
    """
    Return the authenticated Supabase user's UUID from the JWT 'sub' claim.
    """

    user_id = current_user.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID missing from authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user_id