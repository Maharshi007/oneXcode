from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.auth import get_current_user_id
from app.db.session import get_db
from app.models.problem import Problem
from app.models.user_progress import UserProgress


router = APIRouter(
    prefix="/progress",
    tags=["Progress"],
)


# ---------------------------------------------------------------------------
# Request schemas
# ---------------------------------------------------------------------------

class MigrateProgressRequest(BaseModel):
    problem_ids: List[int]


# ---------------------------------------------------------------------------
# GET USER PROGRESS
# ---------------------------------------------------------------------------

@router.get("")
def get_user_progress(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Return all problems solved by the authenticated user.
    """

    progress_rows = (
        db.query(UserProgress.problem_id)
        .filter(UserProgress.user_id == user_id)
        .all()
    )

    solved_problem_ids = [row.problem_id for row in progress_rows]

    return {
        "solved_problem_ids": solved_problem_ids,
        "count": len(solved_problem_ids),
    }


# ---------------------------------------------------------------------------
# GET USER PROGRESS STATS
# ---------------------------------------------------------------------------

@router.get("/stats")
def get_user_progress_stats(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Return solved-problem statistics for the authenticated user.
    """

    total_problems = db.query(func.count(Problem.id)).scalar() or 0

    solved_problems = (
        db.query(func.count(UserProgress.id))
        .filter(UserProgress.user_id == user_id)
        .scalar()
        or 0
    )

    easy_solved = (
        db.query(func.count(UserProgress.id))
        .join(
            Problem,
            Problem.id == UserProgress.problem_id,
        )
        .filter(
            UserProgress.user_id == user_id,
            Problem.difficulty == "Easy",
        )
        .scalar()
        or 0
    )

    medium_solved = (
        db.query(func.count(UserProgress.id))
        .join(
            Problem,
            Problem.id == UserProgress.problem_id,
        )
        .filter(
            UserProgress.user_id == user_id,
            Problem.difficulty == "Medium",
        )
        .scalar()
        or 0
    )

    hard_solved = (
        db.query(func.count(UserProgress.id))
        .join(
            Problem,
            Problem.id == UserProgress.problem_id,
        )
        .filter(
            UserProgress.user_id == user_id,
            Problem.difficulty == "Hard",
        )
        .scalar()
        or 0
    )

    completion_percentage = (
        round((solved_problems / total_problems) * 100, 2)
        if total_problems > 0
        else 0.0
    )

    return {
        "total_problems": total_problems,
        "solved_problems": solved_problems,
        "unsolved_problems": max(total_problems - solved_problems, 0),
        "completion_percentage": completion_percentage,
        "easy": easy_solved,
        "medium": medium_solved,
        "hard": hard_solved,
    }


# ---------------------------------------------------------------------------
# BATCH MIGRATE LOCAL SOLVED PROBLEMS
# ---------------------------------------------------------------------------

@router.post(
    "/migrate",
    status_code=status.HTTP_200_OK,
)
def migrate_progress(
    body: MigrateProgressRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Idempotent batch migration endpoint.

    Accepts a list of problem_ids that the user solved locally.
    Inserts only the rows that do not already exist in user_progress.
    Uses the existing UNIQUE(user_id, problem_id) constraint — no duplicate
    rows will ever be created.

    The authenticated user_id is always taken from the JWT; the request body
    must never supply it.
    """

    if not body.problem_ids:
        # Nothing to migrate — return the current state.
        existing_rows = (
            db.query(UserProgress.problem_id)
            .filter(UserProgress.user_id == user_id)
            .all()
        )
        solved_ids = [row.problem_id for row in existing_rows]
        return {
            "inserted": 0,
            "skipped": 0,
            "solved_problem_ids": solved_ids,
            "count": len(solved_ids),
        }

    # Deduplicate the incoming list.
    requested_ids = list(set(body.problem_ids))

    # Verify that all requested problem_ids actually exist in the database.
    valid_problems = (
        db.query(Problem.id)
        .filter(Problem.id.in_(requested_ids))
        .all()
    )
    valid_ids = {row.id for row in valid_problems}

    # Fetch IDs already recorded for this user.
    already_solved = (
        db.query(UserProgress.problem_id)
        .filter(
            UserProgress.user_id == user_id,
            UserProgress.problem_id.in_(valid_ids),
        )
        .all()
    )
    already_solved_ids = {row.problem_id for row in already_solved}

    # Insert only the rows that are not yet present.
    ids_to_insert = valid_ids - already_solved_ids
    now = datetime.utcnow()

    for problem_id in ids_to_insert:
        progress = UserProgress(
            user_id=user_id,
            problem_id=problem_id,
            solved_at=now,
            created_at=now,
            updated_at=now,
        )
        db.add(progress)

    if ids_to_insert:
        db.commit()

    # Return the full resulting solved list for this user.
    final_rows = (
        db.query(UserProgress.problem_id)
        .filter(UserProgress.user_id == user_id)
        .all()
    )
    solved_ids = [row.problem_id for row in final_rows]

    return {
        "inserted": len(ids_to_insert),
        "skipped": len(already_solved_ids),
        "solved_problem_ids": solved_ids,
        "count": len(solved_ids),
    }


# ---------------------------------------------------------------------------
# RESET ALL PROGRESS FOR THE AUTHENTICATED USER
# ---------------------------------------------------------------------------

@router.delete(
    "",
    status_code=status.HTTP_200_OK,
)
def reset_all_progress(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Delete all progress rows belonging to the authenticated user.

    The user_id is always extracted from the JWT — it is never accepted from
    the request body or query string, so a user cannot affect another user's
    data.
    """

    deleted_count = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user_id)
        .delete(synchronize_session=False)
    )
    db.commit()

    return {
        "message": "Progress reset successfully.",
        "deleted": deleted_count,
    }


# ---------------------------------------------------------------------------
# MARK PROBLEM AS SOLVED
# ---------------------------------------------------------------------------

@router.post(
    "/{problem_id}",
    status_code=status.HTTP_201_CREATED,
)
def mark_problem_solved(
    problem_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Mark a problem as solved for the authenticated user.

    If the problem is already solved, the existing record is returned
    instead of creating a duplicate.
    """

    # Verify that the problem exists.
    problem = (
        db.query(Problem)
        .filter(Problem.id == problem_id)
        .first()
    )

    if problem is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Problem not found.",
        )

    # Check whether the user already solved this problem.
    existing_progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == user_id,
            UserProgress.problem_id == problem_id,
        )
        .first()
    )

    if existing_progress:
        return {
            "message": "Problem already marked as solved.",
            "problem_id": problem_id,
            "solved": True,
            "solved_at": existing_progress.solved_at,
        }

    # Create progress record.
    progress = UserProgress(
        user_id=user_id,
        problem_id=problem_id,
        solved_at=datetime.utcnow(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(progress)
    db.commit()
    db.refresh(progress)

    return {
        "message": "Problem marked as solved.",
        "problem_id": problem_id,
        "solved": True,
        "solved_at": progress.solved_at,
    }


# ---------------------------------------------------------------------------
# MARK PROBLEM AS UNSOLVED
# ---------------------------------------------------------------------------

@router.delete("/{problem_id}")
def mark_problem_unsolved(
    problem_id: int,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Remove the solved status for a problem belonging to the authenticated user.
    """

    progress = (
        db.query(UserProgress)
        .filter(
            UserProgress.user_id == user_id,
            UserProgress.problem_id == problem_id,
        )
        .first()
    )

    if progress is None:
        return {
            "message": "Problem was not marked as solved.",
            "problem_id": problem_id,
            "solved": False,
        }

    db.delete(progress)
    db.commit()

    return {
        "message": "Problem marked as unsolved.",
        "problem_id": problem_id,
        "solved": False,
    }