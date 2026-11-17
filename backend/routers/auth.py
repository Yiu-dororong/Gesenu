"""
routers/auth.py — Authentication & HttpOnly Session Cookie Endpoints
"""

import os

from fastapi import APIRouter, Response

from config import AUTH_COOKIE_MAX_AGE, REFRESH_COOKIE_MAX_AGE
from models import SessionPayload

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/session")
def set_session_cookie(payload: SessionPayload, response: Response) -> dict:
    """Set secure HttpOnly cookies for access and refresh tokens."""
    is_production = bool(
        os.getenv("VERCEL") or os.getenv("ENVIRONMENT") == "production"
    )

    response.set_cookie(
        key="sb_access_token",
        value=payload.access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        path="/api",
        max_age=AUTH_COOKIE_MAX_AGE,
    )
    if payload.refresh_token:
        response.set_cookie(
            key="sb_refresh_token",
            value=payload.refresh_token,
            httponly=True,
            secure=is_production,
            samesite="lax",
            path="/api/auth",
            max_age=REFRESH_COOKIE_MAX_AGE,
        )
    return {"status": "ok", "message": "Session cookies established"}


@router.post("/logout")
def logout_session(response: Response) -> dict:
    """Clear HttpOnly session cookies upon logout."""
    is_production = bool(
        os.getenv("VERCEL") or os.getenv("ENVIRONMENT") == "production"
    )
    response.delete_cookie(
        key="sb_access_token",
        path="/api",
        httponly=True,
        secure=is_production,
        samesite="lax",
    )
    response.delete_cookie(
        key="sb_refresh_token",
        path="/api/auth",
        httponly=True,
        secure=is_production,
        samesite="lax",
    )
    return {"status": "ok", "message": "Session cookies cleared"}
