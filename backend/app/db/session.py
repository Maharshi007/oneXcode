import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("preptrack.db")

Base = declarative_base()

def get_engine(db_url: str):
    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True
    )

# Try connecting to primary database (PostgreSQL), fallback to SQLite if unreachable
engine = None
try:
    temp_engine = get_engine(settings.DATABASE_URL)
    with temp_engine.connect() as conn:
        pass
    engine = temp_engine
    logger.info(f"Connected successfully to primary database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else settings.DATABASE_URL}")
except Exception as e:
    logger.warning(f"Could not connect to primary DATABASE_URL ({e}). Falling back to local SQLite: {settings.FALLBACK_SQLITE_URL}")
    engine = get_engine(settings.FALLBACK_SQLITE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
