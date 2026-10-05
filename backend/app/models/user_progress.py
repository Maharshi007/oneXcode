from datetime import datetime
from uuid import UUID

from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID

from app.db.session import Base


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        PostgreSQLUUID(as_uuid=True),
        nullable=False,
        index=True,
    )

    problem_id = Column(
        Integer,
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    solved_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "problem_id",
            name="user_progress_user_problem_unique",
        ),
    )

    def __repr__(self):
        return (
            f"<UserProgress "
            f"user_id={self.user_id} "
            f"problem_id={self.problem_id}>"
        )