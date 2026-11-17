"""
auth.py — Gesenu FastAPI Auth Dependency
=========================================

Provides a FastAPI dependency (`get_current_user`) that extracts and validates
a Supabase user session using:
1. `sb_access_token` HttpOnly cookie (preferred for web clients)
2. `Authorization: Bearer <token>` header (fallback for CLI, curl, automated tests)

Token verification:
- Primary (<1ms): Local cryptographic JWT decode using `SUPABASE_JWT_SECRET`.
- Fallback: Network call to `supabase_client.auth.get_user(token)` if the JWT secret
  is not configured in environment variables.
"""

from __future__ import annotations

import logging
import os
from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    import jwt

    HAS_PYJWT = True
except ImportError:
    HAS_PYJWT = False

log = logging.getLogger(__name__)

# auto_error=False ensures missing Bearer header doesn't fail immediately,
# allowing cookie extraction to be checked first.
bearer_scheme = HTTPBearer(auto_error=False)


def make_auth_dependency(supabase_client) -> Callable:
    """
    Factory that returns a FastAPI dependency bound to the given Supabase client.
    """
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "").strip()

    def get_current_user(
        request: Request,
        credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    ) -> dict:
        """
        Extract token from HttpOnly cookie or Authorization Bearer header,
        then verify locally or via Supabase.

        Returns:
            dict with keys: user_id (str), email (str | None)
        """
        # 1. Extract token: Cookie first, then Bearer header
        token: str | None = request.cookies.get("sb_access_token")

        if not token and credentials:
            token = credentials.credentials

        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ", 1)[1].strip()

        if not token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated. Missing authentication token or cookie.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 2. Local JWT Verification if secret is available (<1ms, no network call)
        secret = jwt_secret or os.getenv("SUPABASE_JWT_SECRET", "").strip()
        if HAS_PYJWT and secret:
            try:
                payload = jwt.decode(
                    token,
                    secret,
                    algorithms=["HS256"],
                    audience="authenticated",
                    options={"verify_aud": True},
                )
                user_id = payload.get("sub")
                if not user_id:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid token claims: missing user ID (sub).",
                    )
                return {
                    "user_id": str(user_id),
                    "email": payload.get("email"),
                }
            except jwt.ExpiredSignatureError as exc:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication token has expired.",
                    headers={"WWW-Authenticate": "Bearer"},
                ) from exc
            except jwt.InvalidTokenError as exc:
                log.warning("JWT verification failed: %s", exc)
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token.",
                    headers={"WWW-Authenticate": "Bearer"},
                ) from exc

        # 3. Fallback: Network call via Supabase client
        # (used if SUPABASE_JWT_SECRET not set)
        if supabase_client is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Auth service unavailable — Supabase client not initialised.",
            )

        try:
            response = supabase_client.auth.get_user(token)
        except Exception as exc:
            log.warning("Supabase token verification raised: %s", exc)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            ) from exc

        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "user_id": response.user.id,
            "email": response.user.email,
        }

    return get_current_user
