from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.core.config import settings
from app.core.exceptions import DimensionMismatchError


class EmbeddingService:
    def __init__(self) -> None:
        self.model = self._load_model()

    @staticmethod
    @lru_cache(maxsize=1)
    def _load_model() -> SentenceTransformer:
        # This is the only model construction point in the backend.
        return SentenceTransformer(
            settings.embedding_model,
            device=settings.embedding_device,
        )

    def encode(self, text: str) -> list[float]:
        normalized = text.strip()
        if not normalized:
            raise ValueError("Text must not be blank")

        vector = self.model.encode(
            normalized,
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).tolist()

        if len(vector) != settings.embedding_dimension:
            raise DimensionMismatchError(
                expected=settings.embedding_dimension,
                got=len(vector),
            )

        return [float(value) for value in vector]


embedding_service = EmbeddingService()
