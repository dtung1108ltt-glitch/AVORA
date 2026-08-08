"""
FastAPI wrapper around a local Qdrant instance.

Responsibilities:
  1. On startup: connect to Qdrant (localhost:6333), create the "jobs"
     collection if it doesn't exist yet, and load data/job_embeddings.json
     into it (idempotent - skipped if already loaded).
  2. Expose convenience endpoints:
       GET  /health
       GET  /jobs                 - list jobs (paginated)
       GET  /jobs/{job_id}        - fetch one job by id
       POST /search/vector        - nearest-neighbor search by raw vector
       POST /search/text          - nearest-neighbor search by free-text query
                                     (encoded on the fly using the same
                                     TF-IDF + SVD pipeline used to build the
                                     original embeddings), with optional
                                     exact-match payload filters.
"""
import json
import os
from typing import List, Optional

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
COLLECTION = "jobs"
QDRANT_HOST = os.environ.get("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.environ.get("QDRANT_PORT", "6333"))

app = FastAPI(
    title="Vector DB - Việc làm cho Người khuyết tật",
    description="Qdrant-backed vector search API over the job embeddings dataset.",
    version="1.0.0",
)

client: Optional[QdrantClient] = None
encoders = None
embedding_dim = None


def load_encoders():
    path = os.path.join(DATA_DIR, "encoders.pkl")
    return joblib.load(path)


def load_records():
    path = os.path.join(DATA_DIR, "job_embeddings.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def ensure_collection_and_data():
    global embedding_dim
    records = load_records()
    embedding_dim = records[0]["embedding_dim"]

    collections = [c.name for c in client.get_collections().collections]
    if COLLECTION not in collections:
        client.create_collection(
            collection_name=COLLECTION,
            vectors_config=qmodels.VectorParams(
                size=embedding_dim, distance=qmodels.Distance.COSINE
            ),
        )

    count = client.count(collection_name=COLLECTION, exact=True).count
    if count >= len(records):
        return  # already ingested

    points = []
    for i, rec in enumerate(records):
        payload = {k: v for k, v in rec.items() if k != "vector"}
        points.append(
            qmodels.PointStruct(id=i, vector=rec["vector"], payload=payload)
        )
    client.upsert(collection_name=COLLECTION, points=points)


def encode_text_query(query: str) -> List[float]:
    """Encode a free-text query into a full embedding vector, matching the
    feature layout used when the dataset embeddings were built:
    [salary(2), nhom(*), mucdo(*), nganh(*), hinhthuc(*), khuvuc(*), text_svd(32)]
    Non-text blocks use the dataset's average values (a neutral default),
    since a free-text query typically doesn't specify salary/category/etc.
    Use the `filters` field in /search/text for exact metadata constraints.
    """
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


@app.on_event("startup")
def startup():
    global client, encoders
    client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    encoders = load_encoders()
    ensure_collection_and_data()


@app.get("/health")
def health():
    ok = client is not None and client.get_collections() is not None
    return {"status": "ok" if ok else "unavailable", "collection": COLLECTION}


@app.get("/jobs")
def list_jobs(limit: int = 20, offset: int = 0):
    result, _ = client.scroll(
        collection_name=COLLECTION, limit=limit, offset=offset, with_payload=True
    )
    return [{"id": p.id, **p.payload} for p in result]


@app.get("/jobs/{job_id}")
def get_job(job_id: str):
    result = client.scroll(
        collection_name=COLLECTION,
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
    vector: List[float] = Field(..., description="Query vector, must match the collection's dimension")
    top_k: int = Field(5, ge=1, le=50)


class TextSearchRequest(BaseModel):
    query: str = Field(..., description="Free-text search query, e.g. 'chăm sóc khách hàng từ xa'")
    top_k: int = Field(5, ge=1, le=50)
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
    if embedding_dim and len(req.vector) != embedding_dim:
        raise HTTPException(
            status_code=400,
            detail=f"vector must have {embedding_dim} dimensions, got {len(req.vector)}",
        )
    result = client.query_points(collection_name=COLLECTION, query=req.vector, limit=req.top_k)
    return [{"id": h.id, "score": h.score, **h.payload} for h in result.points]


@app.post("/search/text")
def search_text(req: TextSearchRequest):
    vector = encode_text_query(req.query)
    qfilter = build_filter(req.nhom_khuyet_tat, req.muc_do_khuyet_tat)
    result = client.query_points(
        collection_name=COLLECTION,
        query=vector,
        query_filter=qfilter,
        limit=req.top_k,
    )
    return [{"id": h.id, "score": h.score, **h.payload} for h in result.points]
