import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "QUBIX-AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "bhumi-super-secret-key-tamilnadu-hexatitans-2026-verify-before-approve"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./bhumi.db"
    
    # Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    SAMPLE_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "sample_data")
    
    # AI / LLM Configuration
    AI_PROVIDER: str = "local"  # local or openai
    OPENAI_API_KEY: Optional[str] = None
    
    # OCR Settings
    TESSERACT_CMD: Optional[str] = None
    TESSERACT_LANG: str = "eng+tam"

    model_config = {"case_sensitive": True, "env_file": ".env"}

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_DIR, exist_ok=True)
