from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.postgres import get_db
from app.services.retrieval_service import search as semantic_search

router = APIRouter(tags=["search"])


@router.get("/search")
async def search(
    q: str = Query(..., min_length=1),
    top_k: int = Query(10, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query must not be blank")
    try:
        return await semantic_search(session, q, top_k)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
