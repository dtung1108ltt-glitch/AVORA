"""
common.py
---------
Module dùng chung cho 3 script test local: đọc dữ liệu embedding LEGACY
(TF-IDF/SVD 133 chiều) trong vectordb_docker/data/ và kết nối Qdrant local
mode (không cần Docker/Podman).

⚠️ LƯU Ý QUAN TRỌNG (đọc kỹ trước khi dùng):
Theo vectordb_docker/README.md, kiến trúc hiện tại của AVORA chỉ dùng
Qwen/Qwen3-Embedding-8B (4096 chiều) cho production. Pipeline TF-IDF/SVD
133 chiều ở đây ĐÃ BỊ GỠ khỏi app/main.py, chỉ còn trên đĩa để tham khảo.
=> 3 script này KHÔNG kiểm chứng hành vi search production thật (khác
   model, khác số chiều, khác collection). Chúng chỉ để test nhanh cơ chế
   Qdrant local (tạo collection / upsert / search / filter) mà không cần
   tải model 4096 chiều nặng hay chạy Docker.

Cấu trúc vector 133 chiều (theo data/embedding_manifest.json):
  - salary_min_norm, salary_max_norm      : 2 chiều (MinMax-scaled)
  - nhom_*   : one-hot Nhóm khuyết tật     : 6 chiều
  - mucdo_*  : one-hot Mức độ phù hợp      : 4 chiều
  - nganh_*  : one-hot Ngành / Lĩnh vực    : 43 chiều
  - hinhthuc_* : multi-hot Hình thức làm việc : 30 chiều
  - khuvuc_* : multi-hot Khu vực phổ biến  : 16 chiều
  - text_svd_* : TF-IDF + TruncatedSVD (Nghề+Mô tả+Kỹ năng+Hỗ trợ) : 32 chiều

Vector này đã được tính sẵn trong job_embeddings.json - KHÔNG cần chạy qua
model embedding nào nữa lúc test.
"""

import json
from pathlib import Path

from qdrant_client import QdrantClient

# ---- Đường dẫn dữ liệu ----------------------------------------------------
# Ưu tiên data/ nằm cạnh chính các script này (dùng độc lập ngoài repo);
# nếu không có thì dùng data thật của repo (vectordb_docker/data, khi các
# script này được đặt trong một thư mục con của vectordb_docker/).
_THIS_DIR = Path(__file__).parent
_CANDIDATE_DATA_DIRS = [
    _THIS_DIR / "data",
    _THIS_DIR.parent / "data",
]
DATA_DIR = next(
    (p for p in _CANDIDATE_DATA_DIRS if (p / "job_embeddings.json").exists()),
    _CANDIDATE_DATA_DIRS[0],
)

JSON_PATH = DATA_DIR / "job_embeddings.json"
RAW_PATH = DATA_DIR / "jobs_raw.json"   # dữ liệu gốc, dùng để làm giàu payload

# ---- Cấu hình Qdrant ------------------------------------------------------
# Đặt tên khác "avora_jobs" (tên collection production dùng cho Qwen3
# 4096 chiều) để tránh nhầm lẫn / đụng độ nếu sau này bạn cũng chạy
# vectordb_docker thật trên cùng máy.
COLLECTION_NAME = "avora_jobs_legacy_tfidf133"
QDRANT_LOCAL_PATH = "./qdrant_local_data"   # persistent local storage, không cần server
EXPECTED_VECTOR_SIZE = 133


def load_job_records(enrich: bool = True) -> list[dict]:
    """
    Đọc job_embeddings.json (nguồn chuẩn cho vector + payload gọn).
    Nếu enrich=True, bổ sung thêm mô tả/kỹ năng/hỗ trợ/lương từ jobs_raw.json
    (khớp theo job_id).

    Trả về list[dict] với các key: job_id, vector, payload (dict).
    """
    if not JSON_PATH.exists():
        raise FileNotFoundError(
            f"Không tìm thấy {JSON_PATH}. Đặt các script này trong "
            f"vectordb_docker/<thư_mục_con>/ (cạnh data/ của repo), hoặc tạo "
            f"thư mục 'data/' cạnh script và copy job_embeddings.json + "
            f"jobs_raw.json vào đó."
        )

    with open(JSON_PATH, encoding="utf-8") as f:
        raw_records = json.load(f)

    enrichment_by_id = _load_enrichment() if enrich else {}

    records = []
    for rec in raw_records:
        payload = {
            "job_id": rec["job_id"],
            "nhom_khuyet_tat": rec["nhom_khuyet_tat"],
            "nghe": rec["nghe"],
            "nganh": rec["nganh"],
            "muc_do_khuyet_tat": rec["muc_do_khuyet_tat"],
        }
        payload.update(enrichment_by_id.get(rec["job_id"], {}))

        records.append({
            "job_id": rec["job_id"],
            "vector": rec["vector"],
            "payload": payload,
        })
    return records


def _load_enrichment() -> dict:
    """Đọc thêm mô tả/kỹ năng/hỗ trợ/lương từ jobs_raw.json, khớp theo job_id."""
    if not RAW_PATH.exists():
        return {}

    with open(RAW_PATH, encoding="utf-8") as f:
        raw_jobs = json.load(f)

    return {
        job["job_id"]: {
            "mo_ta_cong_viec": job.get("mo_ta"),
            "ky_nang": job.get("ky_nang"),
            "ho_tro": job.get("ho_tro"),
            "hinh_thuc_lam_viec": job.get("hinh_thuc"),
            "khu_vuc": job.get("khu_vuc"),
            "muc_luong": job.get("luong"),
        }
        for job in raw_jobs
    }


def get_qdrant_client(persistent: bool = True) -> QdrantClient:
    """Trả về QdrantClient chạy local mode - KHÔNG cần Docker/Podman.

    persistent=True  -> lưu xuống đĩa tại QDRANT_LOCAL_PATH (RocksDB embedded)
    persistent=False -> chạy hoàn toàn trong RAM (":memory:"), mất khi kết thúc
    """
    if persistent:
        return QdrantClient(path=QDRANT_LOCAL_PATH)
    return QdrantClient(":memory:")


def upsert_all(client: QdrantClient, records: list[dict], recreate: bool = True) -> None:
    """Tạo collection (nếu recreate=True) và upsert toàn bộ records vào Qdrant."""
    from qdrant_client.models import Distance, VectorParams, PointStruct

    vector_size = len(records[0]["vector"])

    if recreate:
        if client.collection_exists(COLLECTION_NAME):
            client.delete_collection(COLLECTION_NAME)
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
        )

    points = [
        PointStruct(id=i, vector=rec["vector"], payload=rec["payload"])
        for i, rec in enumerate(records)
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)
