from datetime import datetime, timedelta, timezone

try:
    from datetime import UTC
except ImportError:
    UTC = timezone.utc

from main import calculate_srs_transition


def test_srs_forgot():
    now_before = datetime.now(UTC)
    new_status, next_review = calculate_srs_transition("Mastered", "forgot")
    now_after = datetime.now(UTC)

    assert new_status == "new"
    assert now_before <= next_review <= now_after


def test_srs_hard():
    now = datetime.now(UTC)
    # hard from new promotes to learning (+12h)
    s1, r1 = calculate_srs_transition("new", "hard")
    assert s1 == "learning"
    assert (
        timedelta(hours=11, minutes=59) <= (r1 - now) <= timedelta(hours=12, minutes=1)
    )

    # hard from known keeps status at known (+12h)
    s2, r2 = calculate_srs_transition("known", "hard")
    assert s2 == "known"
    assert (
        timedelta(hours=11, minutes=59) <= (r2 - now) <= timedelta(hours=12, minutes=1)
    )


def test_srs_good():
    now = datetime.now(UTC)
    # new -> learning (+1d)
    s1, r1 = calculate_srs_transition("new", "good")
    assert s1 == "learning"
    assert (
        timedelta(hours=23, minutes=59) <= (r1 - now) <= timedelta(hours=24, minutes=1)
    )

    # learning -> known (+7d)
    s2, r2 = calculate_srs_transition("learning", "good")
    assert s2 == "known"
    assert timedelta(days=6, hours=23) <= (r2 - now) <= timedelta(days=7, hours=1)

    # known -> mastered (+30d)
    s3, r3 = calculate_srs_transition("known", "good")
    assert s3 == "mastered"
    assert timedelta(days=29, hours=23) <= (r3 - now) <= timedelta(days=30, hours=1)


def test_srs_easy():
    now = datetime.now(UTC)
    # new -> known (+10.5d)
    s1, r1 = calculate_srs_transition("new", "easy")
    assert s1 == "known"
    assert timedelta(days=10, hours=11) <= (r1 - now) <= timedelta(days=10, hours=13)

    # learning -> mastered (+45d)
    s2, r2 = calculate_srs_transition("learning", "easy")
    assert s2 == "mastered"
    assert timedelta(days=44, hours=23) <= (r2 - now) <= timedelta(days=45, hours=1)
