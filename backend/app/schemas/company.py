from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

class CompanyDifficultyBreakdown(BaseModel):
    easy: int
    medium: int
    hard: int

class CompanyBase(BaseModel):
    id: int
    name: str
    slug: str
    problem_count: int
    easy_count: int
    medium_count: int
    hard_count: int
    
    model_config = ConfigDict(from_attributes=True)

class CompanyDetail(CompanyBase):
    created_at: datetime
    difficulty_breakdown: Optional[CompanyDifficultyBreakdown] = None

class CompanyListResponse(BaseModel):
    items: List[CompanyBase]
    page: int
    limit: int
    total: int
    total_pages: int
