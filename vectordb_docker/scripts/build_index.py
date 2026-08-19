"""
Runs ONCE at Docker build time (not at container startup).

Embed 57 JD bang model duy nhat cho toan he thong: Qwen/Qwen3-Embedding-8B
(8 ty tham so, decoder-only, dim mac dinh 4096 - xem
https://huggingface.co/Qwen/Qwen3-Embedding-8B). Luu vector ra
data/job_embeddings_qwen3.json de main.py nap vao Qdrant luc container
khoi dong.

Theo dung note cua thay:
  - Chi embedding phan MO TA CONG VIEC (JD), KHONG embedding nhan doi tuong
    khuyet tat (Nhom khuyet tat / Muc do khuyet tat phu hop) -> tranh leak
    dap an vao vector dung de tim kiem.

Baking viec encode vao luc build image (thay vi luc container chay) giup:
  - Khong can internet khi container thuc su chay.
  - Container khoi dong nhanh (khong phai tai model / encode luc runtime).
"""
import json
import os

from sentence_transformers import SentenceTransformer

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

# Model DUY NHAT cho toan he thong - dung dung 1 cho ca job (passage) lan
# cau query nguoi dung nhap luc search (xem app/main.py: QWEN_MODEL_NAME).
MODEL_NAME = "Qwen/Qwen3-Embedding-8B"

# Qwen3-Embedding la model instruction-aware: CHI query moi can them huong
# dan nhiem vu (xem app/main.py: encode_text_query), con van ban DOCUMENT/
# PASSAGE (job description) thi encode THO, khong can prefix - khac voi quy
# uoc "passage: "/"query: " cua e5. Nguon: model card chinh thuc + vi du
# code cua Qwen (sentence-transformers >= 2.7, transformers >= 4.51.0).


def build_embedding_text(job: dict) -> str:
    """Chi lay phan mo ta cong viec (JD) - KHONG lay Nhom khuyet tat / Muc do
    khuyet tat phu hop, dung theo yeu cau cua thay (tranh label leakage)."""
    parts = [
        job.get("nghe") or "",
        job.get("mo_ta") or "",
        f"Kỹ năng yêu cầu: {job.get('ky_nang') or ''}",
        f"Hỗ trợ cần thiết: {job.get('ho_tro') or ''}",
    ]
    return ". ".join(p.strip() for p in parts if p.strip())


with open(os.path.join(DATA_DIR, "jobs_raw.json"), "r", encoding="utf-8") as f:
    jobs = json.load(f)

print(f"Loading model {MODEL_NAME} (8B params - lan dau se tai ~16-32GB, co the mat rat lau)...")
model = SentenceTransformer(MODEL_NAME)

texts = [build_embedding_text(j) for j in jobs]  # KHONG prefix cho document/passage

print(f"Encoding {len(texts)} job descriptions with Qwen3-Embedding-8B (CPU, co the cham)...")
vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=True, convert_to_numpy=True)

records = []
for j, vec in zip(jobs, vectors):
    records.append({
        "job_id": j["job_id"],
        "nhom_khuyet_tat": j["nhom_khuyet_tat"],
        "nghe": j["nghe"],
        "nganh": j["nganh"],
        "muc_do_khuyet_tat": j["muc_do_khuyet_tat"],
        "embedding_dim": int(vec.shape[0]),
        "vector": [round(float(x), 6) for x in vec.tolist()],
    })

out_path = os.path.join(DATA_DIR, "job_embeddings_qwen3.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print(f"Saved {len(records)} Qwen3 embeddings ({records[0]['embedding_dim']} dims) to {out_path}")
