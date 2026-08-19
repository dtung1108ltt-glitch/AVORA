import httpx

from app.core.config import settings


class AIService:
    async def chat(self, messages: list[dict[str, str]]) -> dict:
        if not settings.llm_base_url or not settings.llm_model:
            raise RuntimeError("LLM_BASE_URL and LLM_MODEL must be configured")

        headers = {"Content-Type": "application/json"}
        if settings.llm_api_key:
            headers["Authorization"] = f"Bearer {settings.llm_api_key}"

        payload = {
            "model": settings.llm_model,
            "messages": messages,
        }

        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as http:
            response = await http.post(
                f"{settings.llm_base_url.rstrip('/')}/chat/completions",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            return response.json()


ai_service = AIService()
