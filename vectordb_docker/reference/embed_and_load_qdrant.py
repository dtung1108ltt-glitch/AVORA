"""
[Bản đã sửa để tương thích qdrant-client mới - xem ghi chú "FIXED" bên dưới]

Embed 57 JD (Vieclamnguoikhuyettat_embeddings.xlsx) bang model DUY NHAT cho
toan he thong (Qwen/Qwen3-Embedding-8B - 8 ty tham so, 4096 chieu, khuyen
nghi GPU) roi nap vao Qdrant de phuc vu Cosine Similarity search. Xem canh
bao tai nguyen trong vectordb_docker/README.md truoc khi chay.

Theo dung note cua thay:
  - Chi embedding phan MO TA CONG VIEC (JD), KHONG embedding nhan doi tuong
    khuyet tat (Nhom khuyet tat / Muc do khuyet tat phu hop) -> tranh leak
    dap an vao vector dung de tim kiem.

Cach chay:
    pip install sentence-transformers qdrant-client openpyxl
    python scripts/embed_and_load_qdrant.py

Yeu cau: Qdrant dang chay (vd. docker run -p 6333:6333 qdrant/qdrant)
Neu Qdrant chay o host/port khac, sua QDRANT_URL ben duoi.

Luu y: file nay chi de THAM KHAO / chay doc lap ben ngoai package Docker
chinh (vectordb_docker/). Ban Docker chinh (app/main.py + scripts/build_index.py)
da tich hop san logic tuong duong, tu dong nap du lieu luc container khoi dong.
"""

import openpyxl
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

SRC_XLSX = "data/database_demo/Vieclamnguoikhuyettat_embeddings.xlsx"
SHEET_NAME = "viec_lam_nguoi_khuyet_tat_datas"

QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "avora_jobs"

MODEL_NAME = "Qwen/Qwen3-Embedding-8B"
VECTOR_SIZE = 4096  # dim mac dinh thuc te cua model (khong phai 8192 - da fix)

# Qwen3-Embedding la model instruction-aware (KHAC e5): chi cau QUERY moi can
# them huong dan nhiem vu dang "Instruct: {task}\nQuery:{text}"; van ban
# DOCUMENT/PASSAGE (JD) thi encode THO, khong prefix gi ca. Xem app/main.py
# (QUERY_TASK_INSTRUCTION) de dong bo dung 1 quy uoc cho toan he thong.
QUERY_TASK_INSTRUCTION = (
    "Given a Vietnamese job-search query, retrieve job descriptions "
    "suitable for people with disabilities that match the query"
)


def load_jobs():
    wb = openpyxl.load_workbook(SRC_XLSX, read_only=True, data_only=True)
    ws = wb[SHEET_NAME]
    rows = list(ws.iter_rows(values_only=True))
    header_idx = next(i for i, r in enumerate(rows) if any(c is not None for c in r))
    header = rows[header_idx]
    data = [r for r in rows[header_idx + 1:] if any(c is not None for c in r)]
    return header, data


def build_embedding_text(row_dict):
    """Chi lay phan mo ta cong viec (JD) - KHONG lay Nhom khuyet tat / Muc do
    khuyet tat phu hop, dung theo yeu cau cua note."""
    parts = [
        row_dict.get("Nghề / Công việc") or "",
        row_dict.get("Mô tả công việc") or "",
        f"Kỹ năng yêu cầu: {row_dict.get('Kỹ năng / Yêu cầu chính') or ''}",
        f"Hỗ trợ cần thiết: {row_dict.get('Hỗ trợ / Điều chỉnh cần thiết') or ''}",
    ]
    return ". ".join(p.strip() for p in parts if p.strip())


def main():
    header, data = load_jobs()
    print(f"Doc duoc {len(data)} JD tu {SRC_XLSX}")

    print(f"Nap model {MODEL_NAME} (chi lan dau se tai ve, cac lan sau dung cache local)...")
    model = SentenceTransformer(MODEL_NAME)

    records = []
    texts = []
    for i, row in enumerate(data, start=1):
        row_dict = dict(zip(header, row))
        job_id = f"JOB_{i:03d}"
        text = build_embedding_text(row_dict)
        texts.append(text)  # document/passage: khong prefix (quy uoc Qwen3)
        records.append({"job_id": job_id, "text": text, "payload": row_dict})

    print(f"Embedding {len(texts)} JD...")
    vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=True)

    print(f"Ket noi Qdrant tai {QDRANT_URL} ...")
    client = QdrantClient(url=QDRANT_URL)

    # FIXED: recreate_collection() da bi go bo o qdrant-client ban moi.
    # Thay bang delete (bo qua loi neu chua ton tai) + create.
    try:
        client.delete_collection(collection_name=COLLECTION_NAME)
    except Exception:
        pass
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
    )

    points = [
        PointStruct(
            id=i,
            vector=vectors[i - 1].tolist(),
            payload={"job_id": rec["job_id"], "embedding_text": rec["text"], **rec["payload"]},
        )
        for i, rec in enumerate(records, start=1)
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)

    print(f"Da nap xong {len(points)} JD vao collection '{COLLECTION_NAME}'.")


if __name__ == "__main__":
    main()
