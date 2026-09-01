from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base

class Problem(Base):
    __tablename__ = "problems"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), nullable=False, index=True)
    difficulty = Column(String(50), nullable=False, index=True) # Easy, Medium, Hard
    topics = Column(String(500), nullable=False, index=True) # Comma-separated: "Array, Two Pointers"
    
    # Future extensibility fields
    leetcode_url = Column(String(500), nullable=True)
    leetcode_problem_number = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    company_problems = relationship("CompanyProblem", back_populates="problem", cascade="all, delete-orphan")
    companies = relationship("Company", secondary="company_problems", back_populates="problems", viewonly=True)

    def __repr__(self):
        return f"<Problem {self.name} [{self.difficulty}]>"


class CompanyProblem(Base):
    __tablename__ = "company_problems"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    problem_id = Column(Integer, ForeignKey("problems.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Extensibility for future features like frequency rank, round info, solved status
    frequency_rank = Column(Integer, nullable=True)
    interview_round = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    company = relationship("Company", back_populates="company_problems")
    problem = relationship("Problem", back_populates="company_problems")

    __table_args__ = (
        UniqueConstraint("company_id", "problem_id", name="uq_company_problem"),
    )

    def __repr__(self):
        return f"<CompanyProblem company_id={self.company_id} problem_id={self.problem_id}>"
