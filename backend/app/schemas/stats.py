from typing import List
from pydantic import BaseModel
from app.schemas.company import CompanyBase

class TopicStat(BaseModel):
    name: str
    count: int

class PlatformStats(BaseModel):
    total_companies: int
    total_problems: int
    total_company_problems: int
    easy_count: int
    medium_count: int
    hard_count: int
    popular_companies: List[CompanyBase]
    top_topics: List[TopicStat]
    creator: str = "Maharshi"
