from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.dsa_service import DSAService
from app.schemas.stats import TopicStat

router = APIRouter(prefix="/topics", tags=["Topics"])

@router.get("", response_model=List[TopicStat])
def list_topics(db: Session = Depends(get_db)):
    """
    Get all unique DSA topics with their problem counts.
    """
    return DSAService.get_all_topics_with_counts(db)
