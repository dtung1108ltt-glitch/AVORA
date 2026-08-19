from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class JobCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    company: str = Field(min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)


class JobUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, min_length=1)
    company: str | None = Field(default=None, min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)


class JobRead(BaseModel):
    id: UUID
    title: str
    description: str
    company: str
    location: str | None
    qdrant_synced_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SearchResult(JobRead):
    score: float
