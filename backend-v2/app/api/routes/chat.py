from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.ai_service import ai_service

router = APIRouter(tags=["ai"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


@router.post("/chat")
async def chat(payload: ChatRequest) -> dict:
    try:
        return await ai_service.chat([
            {"role": "user", "content": payload.message},
        ])
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
