# Vercel serverless entry point — re-exports the FastAPI app
import sys
from pathlib import Path

# Make sure backend root is importable
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import app  # noqa: F401 — Vercel picks up `app` from this module
