"""
Runs ONCE at Docker build time (not at container startup).

Embed 57 JD bang model nhe, mien phi (intfloat/multilingual-e5-small -
118M tham so, 384 chieu, chay CPU) va luu vector ra
data/job_embeddings_e5.json de main.py nap vao Qdrant luc container khoi dong.

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
MODEL_NAME = "intfloat/multilingual-e5-small"

# e5 models yeu cau prefix "passage: " cho van ban duoc luu (index), va
# "query: " cho van ban dung de tim kiem (xem app/main.py) - thieu prefix
# nay se lam giam do chinh xac ro ret.
PASSAGE_PREFIX = "passage: "


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

print(f"Loading model {MODEL_NAME} ...")
model = SentenceTransformer(MODEL_NAME)

texts = [PASSAGE_PREFIX + build_embedding_text(j) for j in jobs]

print(f"Encoding {len(texts)} job descriptions with e5-small...")
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

out_path = os.path.join(DATA_DIR, "job_embeddings_e5.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(records, f, ensure_ascii=False, indent=2)

print(f"Saved {len(records)} e5 embeddings ({records[0]['embedding_dim']} dims) to {out_path}")
