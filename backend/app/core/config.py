import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "PrepTrack"
    PROJECT_SUBTITLE: str = "Company-Specific DSA Placement Preparation Platform"
    CREATOR: str = "Maharshi"
    API_V1_STR: str = "/api"
    
    # Database Configuration (PostgreSQL primary, SQLite fallback supported)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/preptrack")
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

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
