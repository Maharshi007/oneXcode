import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

# Resolve base directories to reliably locate .env from any working directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent  # .../backend
PROJECT_ROOT = BACKEND_DIR.parent                           # .../root

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            str(PROJECT_ROOT / ".env"),
            str(BACKEND_DIR / ".env"),
            ".env",
            "../.env"
        ),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    PROJECT_NAME: str = "OneXCode"
    PROJECT_SUBTITLE: str = "Code. Practice. Conquer. — DSA Placement Preparation Platform"
    CREATOR: str = "Maharshi"
    API_V1_STR: str = "/api"
    
    # Database Configuration (PostgreSQL primary, SQLite fallback supported)
    DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/preptrack"
)
    FALLBACK_SQLITE_URL: str = "sqlite:///./preptrack.db"
    
    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]
    
    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        return ["*"]

settings = Settings()
