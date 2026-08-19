from datetime import datetime, timezone
from uuid import UUID

from qdrant_client.http import models
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.models import Job
from app.db.qdrant import client
from app.services.embedding_service import embedding_service


def _job_text(job: Job) -> str:
    return "\n".join(
        part for part in (
            job.title,
            job.company,
            job.location or "",
            job.description,
        ) if part
    )


async def sync_job(session: AsyncSession, job: Job) -> Job:
    vector = embedding_service.encode(_job_text(job))
    await client.upsert(
        collection_name=settings.qdrant_collection,
        points=[
            models.PointStruct(
                id=str(job.id),
                vector=vector,
                payload={"job_id": str(job.id)},
            )
        ],
        wait=True,
    )
    job.qdrant_synced_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(job)
    return job


async def delete_job_vector(job_id: UUID) -> None:
    await client.delete(
        collection_name=settings.qdrant_collection,
        points_selector=models.PointIdsList(points=[str(job_id)]),
        wait=True,
    )


async def reindex_all(session: AsyncSession) -> int:
    result = await session.execute(select(Job))
    jobs = list(result.scalars())
    for job in jobs:
        await sync_job(session, job)
    return len(jobs)
