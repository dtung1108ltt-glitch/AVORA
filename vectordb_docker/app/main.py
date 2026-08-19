"""
FastAPI wrapper around a local Qdrant instance.

KIẾN TRÚC ĐÃ THỐNG NHẤT (2026-08-18): toàn hệ thống chỉ dùng ĐÚNG 1 MODEL
EMBEDDING DUY NHẤT — Qwen/Qwen3-Embedding-8B (4096 chiều) — cho cả việc
encode 57 job lúc build lẫn encode câu truy vấn lúc runtime. Pipeline
TF-IDF/SVD 133 chiều trước đây đã bị GỠ BỎ khỏi API (file data/job_
embeddings.json, encoders.pkl, embedding_manifest.json vẫn còn trên đĩa để
tham khảo lịch sử nhưng không còn được service này nạp/dùng nữa).

Responsibilities:
  1. On startup: connect to Qdrant (localhost:6333), tạo (nếu chưa có) và
     nạp dữ liệu (idempotent) vào MỘT collection duy nhất:
       - "avora_jobs" (4096-dim) - Qwen/Qwen3-Embedding-8B, chỉ nhúng JD
         text (Nghề/Mô tả/Kỹ năng/Hỗ trợ) - nhãn khuyết tật bị loại khỏi
         văn bản encode để tránh label leakage vào vector tìm kiếm (theo
         đúng note của thầy). Vector job được build lúc Docker BUILD time
         (xem scripts/build_index.py), không cần internet lúc container
         chạy thật.
     Tên collection "avora_jobs" khớp với reference/embed_and_load_qdrant.py
     / reference/query_qdrant.py, nên 2 script đó có thể trỏ thẳng vào
     Qdrant của container này (port 6333) nếu cần chạy độc lập.
  2. Expose các endpoint:
       GET  /health
       GET  /jobs                 - list jobs (paginated)
       GET  /jobs/{job_id}        - fetch one job by id
       POST /search/vector        - nearest-neighbor search by raw vector
                                     (vector phải đúng 4096 chiều)
       POST /search/text          - nearest-neighbor search by free-text
                                     query, encode bằng Qwen3-Embedding-8B.
                                     Optional exact-match payload filters
                                     (nhom_khuyet_tat, muc_do_khuyet_tat).
     Cả 4 endpoint đều nhận `include_vector` (mặc định False) để trả kèm
     toạ độ vector đầy đủ (4096 số thực) của mỗi job.

CẢNH BÁO TÀI NGUYÊN: Qwen3-Embedding-8B là model decoder 8 tỷ tham số
(kiến trúc giống LLM). Container cần tối thiểu ~16GB RAM để load model này
lúc startup, và mỗi lần encode câu query (mỗi request /search/text) sẽ chậm
hơn đáng kể so với model encoder nhẹ trước đây (e5-small, 118M tham số).
"""
import json
import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from sentence_transformers import SentenceTransformer

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
COLLECTION_NAME = "avora_jobs"
QWEN_MODEL_NAME = "Qwen/Qwen3-Embedding-8B"
EMBEDDINGS_FILE = "job_embeddings_qwen3.json"

# Qwen3-Embedding là model instruction-aware (khác e5): CHỈ câu QUERY mới
# cần thêm hướng dẫn nhiệm vụ theo định dạng "Instruct: ...\nQuery:{text}".
# Văn bản DOCUMENT (mô tả công việc) được encode THÔ, không thêm prefix gì
# cả — đây là quy ước chính thức của Qwen (khác với "passage: "/"query: "
# của e5-small trước đây). Nguồn: model card + ví dụ code chính thức của
# Qwen3-Embedding-8B trên Hugging Face.
QUERY_TASK_INSTRUCTION = (
    "Given a Vietnamese job-search query, retrieve job descriptions "
    "suitable for people with disabilities that match the query"
)

QDRANT_HOST = os.environ.get("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.environ.get("QDRANT_PORT", "6333"))

app = FastAPI(
    title="Vector DB - Việc làm cho Người khuyết tật",
    description="Qdrant-backed vector search API, dùng đúng 1 model duy nhất cho toàn hệ thống: Qwen/Qwen3-Embedding-8B.",
    version="3.0.0",
)

client: Optional[QdrantClient] = None
qwen_model: Optional[SentenceTransformer] = None
vector_dim: Optional[int] = None


def load_json(filename):
    with open(os.path.join(DATA_DIR, filename), "r", encoding="utf-8") as f:
        return json.load(f)


def ensure_collection(records: list):
    """Create the collection if missing and ingest `records` if empty/partial.
    Idempotent - safe to call on every startup."""
    dim = records[0]["embedding_dim"]

    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(size=dim, distance=qmodels.Distance.COSINE),
        )

    count = client.count(collection_name=COLLECTION_NAME, exact=True).count
    if count < len(records):
        points = [
            qmodels.PointStruct(
                id=i,
                vector=rec["vector"],
                payload={k: v for k, v in rec.items() if k != "vector"},
            )
            for i, rec in enumerate(records)
        ]
        client.upsert(collection_name=COLLECTION_NAME, points=points)

    return dim


def encode_text_query(query: str) -> List[float]:
    """Encode a free-text query bằng Qwen3-Embedding-8B - cùng model/không
    gian vector dùng để embed mọi job description (xem
    scripts/build_index.py). Chỉ câu query mới cần prefix hướng dẫn nhiệm vụ
    (instruction-aware); document/passage thì KHÔNG cần."""
    instructed = f"Instruct: {QUERY_TASK_INSTRUCTION}\nQuery:{query}"
    vec = qwen_model.encode(instructed, normalize_embeddings=True, convert_to_numpy=True)
    return vec.tolist()


@app.on_event("startup")
def startup():
    global client, qwen_model, vector_dim

    client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

    records = load_json(EMBEDDINGS_FILE)
    vector_dim = ensure_collection(records)

    # Model weights were already downloaded at Docker build time
    # (scripts/build_index.py), so this just loads them from the local
    # cache - no internet needed at runtime. Vẫn cần ~16GB RAM để load
    # model 8B tham số này.
    qwen_model = SentenceTransformer(QWEN_MODEL_NAME)


@app.get("/health")
def health():
    ok = client is not None and client.get_collections() is not None
    return {
        "status": "ok" if ok else "unavailable",
        "collection": COLLECTION_NAME,
        "model": QWEN_MODEL_NAME,
        "dim": vector_dim,
    }


@app.get("/jobs")
def list_jobs(limit: int = 20, offset: int = 0, include_vector: bool = False):
    result, _ = client.scroll(
        collection_name=COLLECTION_NAME,
        limit=limit,
        offset=offset,
        with_payload=True,
        with_vectors=include_vector,
    )
    out = []
    for p in result:
        item = {"id": p.id, **p.payload}
        if include_vector:
            item["vector"] = p.vector
        out.append(item)
    return out


@app.get("/jobs/{job_id}")
def get_job(job_id: str, include_vector: bool = False):
    result = client.scroll(
        collection_name=COLLECTION_NAME,
        scroll_filter=qmodels.Filter(
            must=[qmodels.FieldCondition(key="job_id", match=qmodels.MatchValue(value=job_id))]
        ),
        limit=1,
        with_payload=True,
        with_vectors=include_vector,
    )
    points = result[0]
    if not points:
        raise HTTPException(status_code=404, detail=f"job_id '{job_id}' not found")
    p = points[0]
    item = {"id": p.id, **p.payload}
    if include_vector:
        item["vector"] = p.vector
    return item


class VectorSearchRequest(BaseModel):
    vector: List[float] = Field(..., description="Query vector - phải đúng số chiều của model Qwen3-Embedding-8B (4096)")
    top_k: int = Field(5, ge=1, le=50)
    include_vector: bool = Field(False, description="If true, include each hit's own stored vector in the response")


class TextSearchRequest(BaseModel):
    query: str = Field(..., description="Free-text search query, e.g. 'chăm sóc khách hàng từ xa'")
    top_k: int = Field(5, ge=1, le=50)
    nhom_khuyet_tat: Optional[str] = Field(None, description="Exact filter on nhom_khuyet_tat payload field")
    muc_do_khuyet_tat: Optional[str] = Field(None, description="Exact filter on muc_do_khuyet_tat payload field")
    include_vector: bool = Field(False, description="If true, include each hit's own stored vector in the response")


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
    if vector_dim and len(req.vector) != vector_dim:
        raise HTTPException(
            status_code=400,
            detail=f"vector must have {vector_dim} dimensions (Qwen3-Embedding-8B), got {len(req.vector)}",
        )
    result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=req.vector,
        limit=req.top_k,
        with_vectors=req.include_vector,
    )
    out = []
    for h in result.points:
        item = {"id": h.id, "score": h.score, **h.payload}
        if req.include_vector:
            item["vector"] = h.vector
        out.append(item)
    return out


@app.post("/search/text")
def search_text(req: TextSearchRequest):
    vector = encode_text_query(req.query)
    qfilter = build_filter(req.nhom_khuyet_tat, req.muc_do_khuyet_tat)
    result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=vector,
        query_filter=qfilter,
        limit=req.top_k,
        with_vectors=req.include_vector,
    )
    out = []
    for h in result.points:
        item = {"id": h.id, "score": h.score, **h.payload}
        if req.include_vector:
            item["vector"] = h.vector
        out.append(item)
    return out
