from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.dsa_service import DSAService
from app.schemas.stats import PlatformStats

router = APIRouter(prefix="", tags=["Stats & Overview"])

@router.get("/stats", response_model=PlatformStats)
def get_stats(db: Session = Depends(get_db)):
    """
    Get aggregated platform statistics including total companies, problems,
    difficulty distribution, popular companies, and top topics.
    """
    return DSAService.get_platform_stats(db)

@router.get("/health")
def health_check():
    """
    API Health check endpoint.
    """
    return {"status": "ok", "service": "OneXCode API", "version": "1.0.0", "author": "Maharshi"}
