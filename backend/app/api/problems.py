from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.dsa_service import DSAService
from app.schemas.problem import ProblemListResponse, ProblemDetail, PrepSetResponse

router = APIRouter(prefix="/problems", tags=["Problems"])

@router.get("", response_model=ProblemListResponse)
def list_problems(
    search: Optional[str] = Query(None, description="Search problem name or topic"),
    difficulty: Optional[str] = Query(None, description="Filter difficulty: Easy, Medium, Hard"),
    topic: Optional[str] = Query(None, description="Filter topic(s), comma-separated"),
    company: Optional[str] = Query(None, description="Filter by company slug or name"),
    sort: Optional[str] = Query("name_asc", description="Sort by: name_asc, name_desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    List all unique problems across all companies with multi-filter and company tags.
    """
    items, total = DSAService.get_all_problems(
        db=db,
        search=search,
        difficulty=difficulty,
        topic=topic,
        company_slug_or_id=company,
        sort_by=sort,
        page=page,
        limit=limit
    )
    total_pages = (total + limit - 1) // limit if limit > 0 else 0
    return {
        "items": items,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": total_pages
    }

@router.get("/preparation-set", response_model=PrepSetResponse)
def get_preparation_set(
    company: str = Query(..., description="Company slug or name"),
    difficulty: Optional[str] = Query(None, description="Comma-separated difficulties: Easy,Medium,Hard"),
    count: int = Query(25, ge=1, le=200, description="Target number of problems: 10, 25, 50, 100"),
    db: Session = Depends(get_db)
):
    """
    Generate a focused preparation problem set for a specific company and difficulty targets.
    """
    diff_list = [d.strip() for d in difficulty.split(",") if d.strip()] if difficulty else None
    result = DSAService.generate_preparation_set(
        db=db,
        company_id_or_slug=company,
        difficulties=diff_list,
        count=count
    )
    if not result:
        raise HTTPException(status_code=404, detail=f"Company '{company}' not found.")
    return result

@router.get("/{problem_id_or_slug}", response_model=ProblemDetail)
def get_problem(
    problem_id_or_slug: str,
    db: Session = Depends(get_db)
):
    """
    Get full problem details, all asking companies, and related topic problems.
    """
    problem = DSAService.get_problem_by_id_or_slug(db, problem_id_or_slug)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id_or_slug}' not found.")
    return problem
