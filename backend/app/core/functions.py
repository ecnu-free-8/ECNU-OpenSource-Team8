import datetime
import json

def get_current_datetime() -> str:
    """Get the current date and time in ISO format."""
    return datetime.datetime.now().isoformat()

def add(a: int, b: int) -> int:
    """Add a and b."""
    return a + b