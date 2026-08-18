"""
FastAPI wrapper around a local Qdrant instance.

Responsibilities:
  1. On startup: connect to Qdrant (localhost:6333), create TWO collections
     if they don't exist yet, and ingest data into each (idempotent):
       - "jobs"       (133-dim) - TF-IDF + SVD + one-hot/multi-hot features,
                                   built from data/job_embeddings.json
       - "avora_jobs" (384-dim) - intfloat/multilingual-e5-small embeddings
                                   of the JD text ONLY (Nghề/Mô tả/Kỹ năng/
                                   Hỗ trợ) - disability labels are
                                   deliberately excluded from the embedded
                                   text to avoid leaking the answer into the
                                   search vector (per spec). Built at Docker
                                   BUILD time, see scripts/build_index.py.
     Collection name "avora_jobs" matches the teacher's original
     embed_and_load_qdrant.py / query_qdrant.py scripts, so those can be
     pointed at this container's Qdrant port (6333) directly if needed.
  2. Expose convenience endpoints:
       GET  /health
       GET  /jobs                 - list jobs (paginated)
       GET  /jobs/{job_id}        - fetch one job by id
       POST /search/vector        - nearest-neighbor search by raw vector
       POST /search/text          - nearest-neighbor search by free-text
                                     query. `method` picks which collection/
                                     encoder is used: "e5" (default) or
                                     "tfidf". Optional exact-match payload
                                     filters (nhom_khuyet_tat, muc_do_khuyet_tat).
"""
import json
import os
from typing import List, Literal, Optional

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from sentence_transformers import SentenceTransformer

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
COLLECTION_TFIDF = "jobs"
COLLECTION_E5 = "avora_jobs"
E5_MODEL_NAME = "intfloat/multilingual-e5-small"
E5_QUERY_PREFIX = "query: "
QDRANT_HOST = os.environ.get("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.environ.get("QDRANT_PORT", "6333"))

app = FastAPI(
    title="Vector DB - Việc làm cho Người khuyết tật",
    description="Qdrant-backed vector search API (TF-IDF and multilingual-e5-small) over the job embeddings dataset.",
    version="2.1.0",
)

client: Optional[QdrantClient] = None
encoders = None  # TF-IDF/SVD/scaler bundle (data/encoders.pkl)
e5_model: Optional[SentenceTransformer] = None
dims = {"tfidf": None, "e5": None}


def load_encoders():
    return joblib.load(os.path.join(DATA_DIR, "encoders.pkl"))


def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


def ensure_collection(collection_name: str, records: list):
    """Create the collection if missing and ingest `records` if empty/partial.
    Idempotent - safe to call on every startup."""
    dim = records[0]["embedding_dim"]

    existing = [c.name for c in client.get_collections().collections]
    if collection_name not in existing:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=qmodels.VectorParams(size=dim, distance=qmodels.Distance.COSINE),
        )

    count = client.count(collection_name=collection_name, exact=True).count
    if count < len(records):
        points = [
            qmodels.PointStruct(
                id=i,
                vector=rec["vector"],
                payload={k: v for k, v in rec.items() if k != "vector"},
            )
            for i, rec in enumerate(records)
        ]
        client.upsert(collection_name=collection_name, points=points)

    return dim


def encode_text_query_tfidf(query: str) -> List[float]:
    """Encode a free-text query into the 133-dim TF-IDF/SVD-based vector
    space (see data/embedding_manifest.json for the exact feature layout).
    Non-text blocks (salary/category/format/region) use the dataset's mean
    values since a free-text query usually doesn't specify them. Use
    nhom_khuyet_tat / muc_do_khuyet_tat in the request for exact filtering
    on those instead of relying on the vector. Note: this collection DOES
    include disability-group one-hot features in the vector, unlike "e5"."""
    tfidf = encoders["tfidf"]
    svd = encoders["svd"]
    bm = encoders["block_means"]

    text_vec = svd.transform(tfidf.transform([query]))[0].tolist()

    vector = []
    vector += bm["salary"]
    vector += bm["nhom"]
    vector += bm["mucdo"]
    vector += bm["nganh"]
    vector += bm["hinhthuc"]
    vector += bm["khuvuc"]
    vector += text_vec
    return vector


def encode_text_query_e5(query: str) -> List[float]:
    """Encode a free-text query using multilingual-e5-small - same model/
    space used to embed all job descriptions (see scripts/build_index.py).
    e5 requires the "query: " prefix for search queries (vs "passage: " used
    when indexing) and normalized embeddings for correct cosine similarity."""
    vec = e5_model.encode(E5_QUERY_PREFIX + query, normalize_embeddings=True, convert_to_numpy=True)
    return vec.tolist()


@app.on_event("startup")
def startup():
    global client, encoders, e5_model

    client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    encoders = load_encoders()

    tfidf_records = load_json("job_embeddings.json")
    dims["tfidf"] = ensure_collection(COLLECTION_TFIDF, tfidf_records)

    e5_records = load_json("job_embeddings_e5.json")
    dims["e5"] = ensure_collection(COLLECTION_E5, e5_records)

    # Model weights were already downloaded at Docker build time
    # (scripts/build_index.py), so this just loads them from the local
    # cache - no internet needed at runtime.
    e5_model = SentenceTransformer(E5_MODEL_NAME)


@app.get("/health")
def health():
    ok = client is not None and client.get_collections() is not None
    return {
        "status": "ok" if ok else "unavailable",
        "collections": {"tfidf": COLLECTION_TFIDF, "e5": COLLECTION_E5},
        "dims": dims,
    }


@app.get("/jobs")
def list_jobs(limit: int = 20, offset: int = 0, method: Literal["tfidf", "e5"] = "e5"):
    collection = COLLECTION_E5 if method == "e5" else COLLECTION_TFIDF
    result, _ = client.scroll(collection_name=collection, limit=limit, offset=offset, with_payload=True)
    return [{"id": p.id, **p.payload} for p in result]


@app.get("/jobs/{job_id}")
def get_job(job_id: str, method: Literal["tfidf", "e5"] = "e5"):
    collection = COLLECTION_E5 if method == "e5" else COLLECTION_TFIDF
    result = client.scroll(
        collection_name=collection,
        scroll_filter=qmodels.Filter(
            must=[qmodels.FieldCondition(key="job_id", match=qmodels.MatchValue(value=job_id))]
        ),
        limit=1,
        with_payload=True,
    )
    points = result[0]
    if not points:
        raise HTTPException(status_code=404, detail=f"job_id '{job_id}' not found")
    p = points[0]
    return {"id": p.id, **p.payload}


class VectorSearchRequest(BaseModel):
    vector: List[float] = Field(..., description="Query vector")
    top_k: int = Field(5, ge=1, le=50)
    method: Literal["tfidf", "e5"] = Field("e5", description="Which collection this vector belongs to")


class TextSearchRequest(BaseModel):
    query: str = Field(..., description="Free-text search query, e.g. 'chăm sóc khách hàng từ xa'")
    top_k: int = Field(5, ge=1, le=50)
    method: Literal["tfidf", "e5"] = Field(
        "e5", description="'e5' = multilingual-e5-small, JD-only text, no label leakage (default); 'tfidf' = original TF-IDF/SVD pipeline (includes disability-group one-hot features)"
    )
    nhom_khuyet_tat: Optional[str] = Field(None, description="Exact filter on nhom_khuyet_tat payload field")
    muc_do_khuyet_tat: Optional[str] = Field(None, description="Exact filter on muc_do_khuyet_tat payload field")


def build_filter(nhom_khuyet_tat: Optional[str], muc_do_khuyet_tat: Optional[str]):
    conditions = []
    if nhom_khuyet_tat:
        conditions.append(
            qmodels.FieldCondition(key="nhom_khuyet_tat", match=qmodels.MatchValue(value=nhom_khuyet_tat))
        )
    if muc_do_khuyet_tat:
        conditions.append(
            qmodels.FieldCondition(key="muc_do_khuyet_tat", match=qmodels.MatchValue(value=muc_do_khuyet_tat))
        )
    return qmodels.Filter(must=conditions) if conditions else None


@app.post("/search/vector")
def search_vector(req: VectorSearchRequest):
    collection = COLLECTION_E5 if req.method == "e5" else COLLECTION_TFIDF
    expected_dim = dims["e5"] if req.method == "e5" else dims["tfidf"]
    if expected_dim and len(req.vector) != expected_dim:
        raise HTTPException(
            status_code=400,
            detail=f"vector must have {expected_dim} dimensions for method='{req.method}', got {len(req.vector)}",
        )
    result = client.query_points(collection_name=collection, query=req.vector, limit=req.top_k)
    return [{"id": h.id, "score": h.score, **h.payload} for h in result.points]


@app.post("/search/text")
def search_text(req: TextSearchRequest):
    if req.method == "e5":
        vector = encode_text_query_e5(req.query)
        collection = COLLECTION_E5
    else:
        vector = encode_text_query_tfidf(req.query)
        collection = COLLECTION_TFIDF

    qfilter = build_filter(req.nhom_khuyet_tat, req.muc_do_khuyet_tat)
    result = client.query_points(
        collection_name=collection,
        query=vector,
        query_filter=qfilter,
        limit=req.top_k,
    )
    return [{"id": h.id, "score": h.score, **h.payload} for h in result.points]
