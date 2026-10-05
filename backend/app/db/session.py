import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


logger = logging.getLogger("preptrack.db")

Base = declarative_base()


def get_engine(db_url: str):
    connect_args = {}

    if db_url.startswith("sqlite"):
        connect_args = {
            "check_same_thread": False
        }

    return create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,
    )


# Connect to the configured database.
#
# IMPORTANT:
# We intentionally do NOT fall back to SQLite.
# In production, silently switching databases could make
# the application appear healthy while writing data to the
# wrong database.
try:
    engine = get_engine(settings.DATABASE_URL)

    with engine.connect():
        pass

    logger.info(
        "Connected successfully to primary database: %s",
        (
            settings.DATABASE_URL.split("@")[-1]
            if "@" in settings.DATABASE_URL
            else settings.DATABASE_URL
        ),
    )

except Exception:
    logger.exception(
        "Failed to connect to the configured database."
    )
    raise


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()