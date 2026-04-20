import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@localhost:5432/wealth_planning"
    )
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    API_TITLE: str = "Wealth Planning API"
    API_VERSION: str = "1.0.0"

settings = Settings()
