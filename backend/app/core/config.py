import os
from pathlib import Path
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


# Resolve base directories to reliably locate .env from any working directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(
            str(PROJECT_ROOT / ".env"),
            str(BACKEND_DIR / ".env"),
            ".env",
            "../.env",
        ),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=True,
    )

    # -------------------------------------------------------------------------
    # Application
    # -------------------------------------------------------------------------
    PROJECT_NAME: str = "OneXCode"
    PROJECT_SUBTITLE: str = (
        "Code. Practice. Conquer. — DSA Placement Preparation Platform"
    )
    CREATOR: str = "Maharshi"
    API_V1_STR: str = "/api"

    # -------------------------------------------------------------------------
    # Supabase Authentication
    # -------------------------------------------------------------------------
    SUPABASE_URL: str = ""
    SUPABASE_PUBLISHABLE_KEY: str = ""

    # -------------------------------------------------------------------------
    # Database Configuration
    # PostgreSQL is the primary production database.
    # SQLite is retained as a local fallback for now.
    # -------------------------------------------------------------------------
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/preptrack",
    )

    FALLBACK_SQLITE_URL: str = "sqlite:///./preptrack.db"

    # -------------------------------------------------------------------------
    # CORS Origins
    # -------------------------------------------------------------------------
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]

        elif isinstance(v, (list, str)):
            return v

        return ["*"]


settings = Settings()