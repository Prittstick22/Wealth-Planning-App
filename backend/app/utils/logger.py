import logging
import sys
from datetime import datetime

# Create logger
logger = logging.getLogger("wealth-planning-api")

# Set log level
logger.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# Log format
formatter = logging.Formatter(
    fmt='[%(asctime)s] %(levelname)s - %(name)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
console_handler.setFormatter(formatter)

# Add handler to logger
logger.addHandler(console_handler)

def log_error(error_code: str, message: str, details: str = ""):
    """Log an error with code, message, and optional details"""
    error_msg = f"[{error_code}] {message}"
    if details:
        error_msg += f" | Details: {details}"
    logger.error(error_msg)

def log_info(message: str):
    """Log info message"""
    logger.info(message)

def log_warning(message: str):
    """Log warning message"""
    logger.warning(message)
