from fastapi import APIRouter

from app.api.companies import router as companies_router
from app.api.problems import router as problems_router
from app.api.progress import router as progress_router
from app.api.stats import router as stats_router
from app.api.topics import router as topics_router


api_router = APIRouter()

api_router.include_router(stats_router)
api_router.include_router(companies_router)
api_router.include_router(problems_router)
api_router.include_router(topics_router)
api_router.include_router(progress_router)