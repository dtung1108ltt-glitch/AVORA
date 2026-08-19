from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router
from app.api.routes.health import router as health_router
from app.api.routes.jobs import router as jobs_router
from app.api.routes.search import router as search_router
from app.core.config import settings
from app.db.qdrant import ensure_collection


@asynccontextmanager
async def lifespan(_: FastAPI):
    await ensure_collection()
    yield


app = FastAPI(title=settings.app_name, debug=settings.debug, lifespan=lifespan)
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(search_router)
app.include_router(chat_router)
