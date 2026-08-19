from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings
from app.db.postgres import SessionFactory
from app.db.qdrant import client
from app.services.embedding_service import embedding_service

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, object]:
    postgres_ok = False
    qdrant_ok = False

    try:
        async with SessionFactory() as session:
            await session.execute(text("SELECT 1"))
            postgres_ok = True
    except Exception:
        pass

    try:
        await client.get_collections()
        qdrant_ok = True
    except Exception:
        pass

    model_ok = embedding_service.model is not None
    healthy = postgres_ok and qdrant_ok and model_ok

    return {
        "status": "ok" if healthy else "degraded",
        "postgres": postgres_ok,
        "qdrant": qdrant_ok,
        "embedding_model_loaded": model_ok,
        "embedding_model": settings.embedding_model,
        "embedding_dimension": settings.embedding_dimension,
    }
