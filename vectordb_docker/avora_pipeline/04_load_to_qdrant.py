# -*- coding: utf-8 -*-
"""
BƯỚC 4: Nạp từ .npy vào Qdrant (local persistent, không cần Docker)
----------------------------------------------------------------------
Đọc:
  - data/job_vectors.npy  : ma trận vector (N, 1024)
  - data/job_ids.json     : job_id theo đúng thứ tự hàng của npy
  - data/jobs_clean.csv   : metadata đầy đủ (payload) từng job, join theo job_id

Ghi vào collection Qdrant mới: 'avora_jobs_1024' (KHÁC tên collection cũ
'avora_jobs_legacy_tfidf133' để không lẫn 2 hệ vector 133 chiều / 1024 chiều).

Cách chạy:
    python 04_load_to_qdrant.py
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

# Windows console (cp1252) không encode được tiếng Việt có dấu khi print().
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).parent
NPY_PATH = BASE_DIR / "data" / "job_vectors.npy"
IDS_PATH = BASE_DIR / "data" / "job_ids.json"
CSV_PATH = BASE_DIR / "data" / "jobs_clean.csv"
QDRANT_PATH = BASE_DIR / "qdrant_local_data"

COLLECTION_NAME = "avora_jobs_1024"
VECTOR_DIM = 1024


def main():
    print(f"[1] Đọc vector: {NPY_PATH}")
    vectors = np.load(NPY_PATH)
    print(f"    -> shape = {vectors.shape}")
    assert vectors.shape[1] == VECTOR_DIM, f"Vector không phải {VECTOR_DIM} chiều!"

    print(f"[2] Đọc job_ids: {IDS_PATH}")
    with open(IDS_PATH, "r", encoding="utf-8") as f:
        job_ids = json.load(f)
    assert len(job_ids) == vectors.shape[0], "Số job_id không khớp số vector!"

    print(f"[3] Đọc metadata: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH, encoding="utf-8-sig").fillna("")
    df = df.set_index("job_id")

    print(f"[4] Kết nối Qdrant local mode (persistent, path='{QDRANT_PATH}') ...")
    client = QdrantClient(path=str(QDRANT_PATH))

    print(f"[5] Tạo collection '{COLLECTION_NAME}' ({VECTOR_DIM} chiều, cosine) ...")
    client.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
    )

    print(f"[6] Upsert {len(job_ids)} điểm ...")
    points = []
    for idx, job_id in enumerate(job_ids):
        if job_id not in df.index:
            print(f"    !! CẢNH BÁO: {job_id} không có trong CSV metadata, bỏ qua")
            continue
        payload = df.loc[job_id].to_dict()
        payload["job_id"] = job_id
        points.append(
            PointStruct(
                id=idx,
                vector=vectors[idx].tolist(),
                payload=payload,
            )
        )
    client.upsert(collection_name=COLLECTION_NAME, points=points)

    count = client.count(collection_name=COLLECTION_NAME).count
    print(f"[7] Kiểm tra số điểm trong collection ...")
    print(f"    -> count = {count}")
    if count == len(points):
        print("    -> OK, khớp với số job đã nạp")
    else:
        print("    !! LỆCH SỐ LƯỢNG, kiểm tra lại")

    # Thử retrieve 1 điểm
    sample = client.retrieve(collection_name=COLLECTION_NAME, ids=[0], with_payload=True)
    if sample:
        print(f"\n[8] Thử retrieve điểm id=0:")
        for k, v in sample[0].payload.items():
            print(f"       {k}: {v}")

    print(f"\n✅ Dữ liệu 1024 chiều đã nạp vào Qdrant local ('{COLLECTION_NAME}').")
    print(f"👉 Dữ liệu nằm trong thư mục: {QDRANT_PATH}")


if __name__ == "__main__":
    main()