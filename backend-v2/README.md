# AVORA Backend v2

Fresh FastAPI backend implementing the approved architecture:

- FastAPI async modular monolith
- PostgreSQL + SQLAlchemy 2.0 async + asyncpg
- Qdrant vector database
- BAAI/bge-m3 embeddings, exactly 1024 dimensions
- JWT authentication + bcrypt password hashing
- Provider-agnostic HTTP LLM client via environment variables
- Podman deployment

Legacy Supabase, pgvector, 4096D embeddings, Qwen3-Embedding-8B, Docker and Docker Compose are intentionally not used.

## Vector invariant

`BAAI/bge-m3 -> 1024D -> Dimension Guard -> Qdrant`

Only `app/services/embedding_service.py` may create embeddings.
