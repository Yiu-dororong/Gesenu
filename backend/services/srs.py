"""
srs.py — Leitner Spaced Repetition System (SRS) Schedule & Transition Engine
"""

from datetime import datetime, timedelta, timezone

try:
    from datetime import UTC
except ImportError:
    UTC = timezone.utc


def calculate_srs_transition(
    current_status: str, feedback: str
) -> tuple[str, datetime]:
    """
    Calculate next FSM status and next_review_at timestamp using Leitner intervals.

    Feedback modes:
      - forgot: status -> new, interval -> immediate
      - hard:   status -> current or learning, interval -> +12h
      - good:   new -> learning (+1d), learning -> known (+7d), known -> mastered (+30d)
      - easy:   new -> known (+10.5d), learning/known -> mastered (+45d)
    """
    now = datetime.now(UTC)
    curr = (current_status or "new").lower()
    fb = (feedback or "good").lower()

    if fb == "forgot":
        return "new", now
    elif fb == "hard":
        new_status = curr if curr != "new" else "learning"
        return new_status, now + timedelta(hours=12)
    elif fb == "easy":
        if curr == "new":
            return "known", now + timedelta(days=10.5)
        else:
            return "mastered", now + timedelta(days=45)
    else:  # "good" (default)
        if curr == "new":
            return "learning", now + timedelta(days=1)
        elif curr == "learning":
            return "known", now + timedelta(days=7)
        else:
            return "mastered", now + timedelta(days=30)
