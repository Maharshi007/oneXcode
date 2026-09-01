from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.company import CompanyBase

class ProblemCompanyBrief(BaseModel):
    id: int
    name: str
    slug: str
    
    model_config = ConfigDict(from_attributes=True)

class ProblemBase(BaseModel):
    id: int
    name: str
    slug: str
    difficulty: str
    topics: List[str]
    leetcode_url: Optional[str] = None
    leetcode_problem_number: Optional[int] = None
    company_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class ProblemWithCompanies(ProblemBase):
    companies: List[ProblemCompanyBrief] = []

class ProblemDetail(ProblemBase):
    companies: List[ProblemCompanyBrief] = []
    related_problems: List[ProblemBase] = []

class ProblemListResponse(BaseModel):
    items: List[ProblemWithCompanies]
    page: int
    limit: int
    total: int
    total_pages: int

class PrepSetResponse(BaseModel):
    company: ProblemCompanyBrief
    title: str
    total_selected: int
    difficulty_filter: Optional[str] = None
    problems: List[ProblemWithCompanies]
