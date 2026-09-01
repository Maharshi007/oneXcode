from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    problem_count = Column(Integer, default=0, nullable=False, index=True)
    easy_count = Column(Integer, default=0, nullable=False)
    medium_count = Column(Integer, default=0, nullable=False)
    hard_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    company_problems = relationship("CompanyProblem", back_populates="company", cascade="all, delete-orphan")
    problems = relationship("Problem", secondary="company_problems", back_populates="companies", viewonly=True)

    def __repr__(self):
        return f"<Company {self.name} ({self.problem_count} problems)>"
