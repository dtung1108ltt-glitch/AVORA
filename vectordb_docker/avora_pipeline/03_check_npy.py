# -*- coding: utf-8 -*-
"""
BƯỚC 3: Kiểm tra file .npy vừa sinh ra
-----------------------------------------
Đọc data/job_vectors.npy và data/job_ids.json, kiểm tra:
  - Số chiều vector đúng 1024
  - Số vector khớp số job_id
  - Không có vector toàn số 0 / NaN (dấu hiệu lỗi encode)
  - Vector đã normalize chưa (norm ~= 1.0, vì bước 2 dùng normalize_embeddings=True)

Cách chạy:
    python 03_check_npy.py
"""

import json
import sys
from pathlib import Path

import numpy as np

# Windows console (cp1252) không encode được tiếng Việt có dấu khi print().
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).parent
NPY_PATH = BASE_DIR / "data" / "job_vectors.npy"
IDS_PATH = BASE_DIR / "data" / "job_ids.json"


def main():
    print(f"[1] Đọc vector: {NPY_PATH}")
    vectors = np.load(NPY_PATH)
    print(f"    -> shape = {vectors.shape}, dtype = {vectors.dtype}")

    n_vectors, dim = vectors.shape
    print(f"\n[2] Số chiều (dimension) = {dim}")
    if dim == 1024:
        print("    -> OK, đúng 1024 chiều")
    else:
        print(f"    !! CẢNH BÁO: kỳ vọng 1024 chiều, nhưng thực tế là {dim}")

    print(f"\n[3] Đọc job_ids: {IDS_PATH}")
    with open(IDS_PATH, "r", encoding="utf-8") as f:
        job_ids = json.load(f)
    print(f"    -> {len(job_ids)} job_id")

    if len(job_ids) == n_vectors:
        print("    -> OK, số job_id khớp số vector")
    else:
        print(f"    !! LỖI: {len(job_ids)} job_id nhưng {n_vectors} vector -> LỆCH THỨ TỰ!")

    print("\n[4] Kiểm tra vector rỗng / NaN / Inf ...")
    nan_rows = np.isnan(vectors).any(axis=1)
    inf_rows = np.isinf(vectors).any(axis=1)
    zero_rows = np.all(vectors == 0, axis=1)
    if nan_rows.any():
        print(f"    !! {nan_rows.sum()} vector chứa NaN: {[job_ids[i] for i in np.where(nan_rows)[0]]}")
    if inf_rows.any():
        print(f"    !! {inf_rows.sum()} vector chứa Inf: {[job_ids[i] for i in np.where(inf_rows)[0]]}")
    if zero_rows.any():
        print(f"    !! {zero_rows.sum()} vector toàn số 0: {[job_ids[i] for i in np.where(zero_rows)[0]]}")
    if not (nan_rows.any() or inf_rows.any() or zero_rows.any()):
        print("    -> OK, không có vector lỗi")

    print("\n[5] Kiểm tra chuẩn hoá (L2 norm, nên ~= 1.0 vì đã normalize_embeddings=True) ...")
    norms = np.linalg.norm(vectors, axis=1)
    print(f"    -> min={norms.min():.4f}, max={norms.max():.4f}, mean={norms.mean():.4f}")

    print(f"\n[6] Xem thử vector đầu tiên ({job_ids[0]}), 8 giá trị đầu:")
    print(f"    {vectors[0][:8]}")

    print("\n✅ Xong bước 3. Nếu mọi thứ OK, chạy tiếp: python 04_load_to_qdrant.py")


if __name__ == "__main__":
    main()