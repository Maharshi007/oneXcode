from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.dsa_service import DSAService
from app.schemas.company import CompanyListResponse, CompanyDetail, CompanyDifficultyBreakdown
from app.schemas.problem import ProblemListResponse

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("", response_model=CompanyListResponse)
def list_companies(
    search: Optional[str] = Query(None, description="Search companies by name or slug"),
    sort: Optional[str] = Query("problems_desc", description="Sort by: problems_desc, problems_asc, name_asc, name_desc, hard_desc, easy_desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    List all companies with pagination, search, and sorting.
    """
    items, total = DSAService.get_companies(
        db=db,
        search=search,
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

@router.get("/{company_id_or_slug}", response_model=CompanyDetail)
def get_company(
    company_id_or_slug: str,
    db: Session = Depends(get_db)
):
    """
    Get company details, statistics and difficulty breakdown by ID or slug.
    """
    company = DSAService.get_company_by_id_or_slug(db, company_id_or_slug)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company '{company_id_or_slug}' not found.")
    
    breakdown = CompanyDifficultyBreakdown(
        easy=company.easy_count,
        medium=company.medium_count,
        hard=company.hard_count
    )
    
    return CompanyDetail(
        id=company.id,
        name=company.name,
        slug=company.slug,
        problem_count=company.problem_count,
        easy_count=company.easy_count,
        medium_count=company.medium_count,
        hard_count=company.hard_count,
        created_at=company.created_at,
        difficulty_breakdown=breakdown
    )

@router.get("/{company_id_or_slug}/problems", response_model=ProblemListResponse)
def get_company_problems(
    company_id_or_slug: str,
    search: Optional[str] = Query(None, description="Search problem name or topics"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: Easy, Medium, Hard, All"),
    topic: Optional[str] = Query(None, description="Filter by topic(s), comma-separated"),
    sort: Optional[str] = Query("name_asc", description="Sort by: name_asc, name_desc"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
):
    """
    Get all problems asked by a specific company with multi-filter and search.
    """
    company = DSAService.get_company_by_id_or_slug(db, company_id_or_slug)
    if not company:
        raise HTTPException(status_code=404, detail=f"Company '{company_id_or_slug}' not found.")

    items, total = DSAService.get_company_problems(
        db=db,
        company_id=company.id,
        search=search,
        difficulty=difficulty,
        topic=topic,
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
