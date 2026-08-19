"""The single and only text -> embedding implementation in AVORA v2.

IMPORTANT ARCHITECTURE RULE:
No other module may instantiate SentenceTransformer or call model.encode().
Every vector must pass through EmbeddingService.encode(), where the 1024D
Dimension Guard is applied before the vector can reach Qdrant.
"""

from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.core.config import settings
from app.core.exceptions import DimensionMismatchError


class EmbeddingService:
    """Own the BGE-M3 model lifecycle and convert text into 1024D vectors."""

    def __init__(self) -> None:
        # Load the model once when the service is constructed.
        self.model = self._load_model()

    @staticmethod
    @lru_cache(maxsize=1)
    def _load_model() -> SentenceTransformer:
        """Create BGE-M3 exactly once for the process."""
        return SentenceTransformer(
            # The model name comes only from centralized Settings.
            settings.embedding_model,
            # CPU/GPU selection also comes from environment configuration.
            device=settings.embedding_device,
        )

    def encode(self, text: str) -> list[float]:
        """Convert text into one validated embedding vector.

        THIS FUNCTION IS THE TEXT -> EMBEDDING BOUNDARY.
        The returned vector is guaranteed to have EMBEDDING_DIMENSION values.
        """
        # Normalize surrounding whitespace; blank input is rejected rather than
        # replaced with a fake/default query.
        normalized = text.strip()
        if not normalized:
            raise ValueError("Text must not be blank")

        # ================= TEXT -> EMBEDDING VECTOR =================
        # BGE-M3 tokenizes the text and runs inference here. The result is a
        # numeric vector; normalize_embeddings=True makes it unit-normalized,
        # matching the Cosine distance configured in Qdrant.
        vector = self.model.encode(
            normalized,
            normalize_embeddings=True,
            convert_to_numpy=True,
        ).tolist()
        # =============================================================

        # Dimension Guard is deliberately centralized here. No vector may
        # leave this service before its length has been validated.
        if len(vector) != settings.embedding_dimension:
            raise DimensionMismatchError(
                expected=settings.embedding_dimension,
                got=len(vector),
            )

        # Convert NumPy scalar values to ordinary Python floats for Qdrant,
        # serialization, and predictable tests.
        return [float(value) for value in vector]


# Shared service instance. Other modules import this object instead of loading
# SentenceTransformer themselves, preventing model/dimension drift.
embedding_service = EmbeddingService()
