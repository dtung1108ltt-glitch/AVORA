"""
[Bản đã sửa để tương thích qdrant-client mới - xem ghi chú "FIXED" bên dưới]

Test truy van: nhap mot mo ta cong viec bat ky -> embed -> tim top-k JD
gan nhat trong Qdrant theo Cosine Similarity.

Cach chay:
    python scripts/query_qdrant.py "Nhân viên nhập liệu tại nhà, không cần đi lại nhiều"

Chay duoc truc tiep nham vao container Docker chinh (vectordb_docker), vi
collection "avora_jobs" trong container do dung dung ten + model + logic
loai nhan khuyet tat giong file nay.
"""

import sys
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient

QDRANT_URL = "http://localhost:6333"
COLLECTION_NAME = "avora_jobs"
MODEL_NAME = "intfloat/multilingual-e5-small"
QUERY_PREFIX = "query: "
TOP_K = 5


def main():
    query_text = sys.argv[1] if len(sys.argv) > 1 else "Công việc văn phòng, làm từ xa, không cần di chuyển nhiều"
    print(f"Query: {query_text}\n")

    model = SentenceTransformer(MODEL_NAME)
    query_vector = model.encode(QUERY_PREFIX + query_text, normalize_embeddings=True).tolist()

    client = QdrantClient(url=QDRANT_URL)
    # FIXED: client.search() da bi go bo o qdrant-client ban moi (>=1.12),
    # thay bang client.query_points() - tra ve object co .points thay vi list truc tiep.
    result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=TOP_K,
    )

    for rank, hit in enumerate(result.points, start=1):
        p = hit.payload
        print(f"#{rank} | score={hit.score:.4f} | {p.get('job_id')} | {p.get('Nghề / Công việc') or p.get('nghe')}")
        print(f"     Nhóm khuyết tật: {p.get('Nhóm khuyết tật') or p.get('nhom_khuyet_tat')} | Mức độ phù hợp: {p.get('Mức độ khuyết tật phù hợp') or p.get('muc_do_khuyet_tat')}")
        print()


if __name__ == "__main__":
    main()
