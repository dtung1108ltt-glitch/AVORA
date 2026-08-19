from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Job
from app.db.postgres import get_db
from app.schemas.jobs import JobCreate, JobRead, JobUpdate
from app.services.sync_service import delete_job_vector, sync_job

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=JobRead, status_code=status.HTTP_201_CREATED)
async def create_job(payload: JobCreate, session: AsyncSession = Depends(get_db)) -> Job:
    job = Job(**payload.model_dump())
    session.add(job)
    await session.commit()
    await session.refresh(job)
    return await sync_job(session, job)


@router.put("/{job_id}", response_model=JobRead)
async def update_job(job_id: UUID, payload: JobUpdate, session: AsyncSession = Depends(get_db)) -> Job:
    job = await session.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(job, key, value)
    await session.commit()
    await session.refresh(job)
    return await sync_job(session, job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: UUID, session: AsyncSession = Depends(get_db)) -> None:
    job = await session.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    await session.delete(job)
    await session.commit()
    await delete_job_vector(job_id)


@router.get("", response_model=list[JobRead])
async def list_jobs(session: AsyncSession = Depends(get_db)) -> list[Job]:
    result = await session.execute(select(Job).order_by(Job.created_at.desc()))
    return list(result.scalars())
