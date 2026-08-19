from uuid import UUID

from qdrant_client.http import models
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import Job
from app.db.qdrant import client
from app.schemas.jobs import SearchResult
from app.services.embedding_service import embedding_service


async def search(session: AsyncSession, query: str, top_k: int = 10) -> list[SearchResult]:
    if not query.strip():
        raise ValueError("Query must not be blank")

    vector = embedding_service.encode(query)
    hits = await client.search(
        collection_name=settings.qdrant_collection,
        query_vector=vector,
        limit=top_k,
        with_payload=True,
    )

    ids = [UUID(str(hit.id)) for hit in hits]
    if not ids:
        return []

    result = await session.execute(select(Job).where(Job.id.in_(ids)))
    jobs = {job.id: job for job in result.scalars()}

    return [
        SearchResult.model_validate(jobs[job_id], from_attributes=True).model_copy(
            update={"score": float(hit.score)}
        )
        for hit in hits
        if (job_id := UUID(str(hit.id))) in jobs
    ]
