# -*- coding: utf-8 -*-
"""
BƯỚC PHỤ: Xem toàn bộ vector của từng job
--------------------------------------------
Đọc data/job_vectors.npy + data/job_ids.json, rồi:
  (a) In ra console bản RÚT GỌN (job_id + 12 giá trị đầu) để xem nhanh.
  (b) Xuất ra 2 file ĐẦY ĐỦ để xem/kiểm tra kỹ:
        - data/vectors_full.csv   : mỗi hàng = 1 job, các cột = job_id + dim_0..dim_1023
        - data/vectors_full.json  : {"JOB_001": [1024 số...], "JOB_002": [...], ...}

Cách chạy:
    python 05_view_vectors.py

Tuỳ chọn xem 1 job cụ thể đầy đủ 1024 chiều ngay trên console:
    python 05_view_vectors.py JOB_001
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd

# Windows console (cp1252) không encode được tiếng Việt có dấu khi print().
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).parent
NPY_PATH = BASE_DIR / "data" / "job_vectors.npy"
IDS_PATH = BASE_DIR / "data" / "job_ids.json"
OUT_CSV = BASE_DIR / "data" / "vectors_full.csv"
OUT_JSON = BASE_DIR / "data" / "vectors_full.json"


def main():
    print(f"[1] Đọc vector: {NPY_PATH}")
    vectors = np.load(NPY_PATH)
    n, dim = vectors.shape
    print(f"    -> {n} job, {dim} chiều")

    print(f"[2] Đọc job_ids: {IDS_PATH}")
    with open(IDS_PATH, "r", encoding="utf-8") as f:
        job_ids = json.load(f)

    # Nếu người dùng truyền job_id cụ thể ở tham số dòng lệnh -> in đầy đủ 1024 số của riêng job đó
    if len(sys.argv) > 1:
        target = sys.argv[1]
        if target not in job_ids:
            print(f"    !! Không tìm thấy job_id '{target}' trong job_ids.json")
            return
        idx = job_ids.index(target)
        print(f"\n[3] Toàn bộ {dim} chiều của {target}:")
        np.set_printoptions(threshold=np.inf, linewidth=120, precision=6, suppress=True)
        print(vectors[idx])
        return

    # Mặc định: in bản rút gọn tất cả job ra console (12 giá trị đầu mỗi job)
    print(f"\n[3] Bản rút gọn tất cả {n} job (12 giá trị đầu mỗi vector):\n")
    for i, job_id in enumerate(job_ids):
        preview = ", ".join(f"{x:.4f}" for x in vectors[i][:12])
        print(f"    {job_id}: [{preview}, ...]")

    # Xuất CSV đầy đủ: job_id + 1024 cột dim_0..dim_1023
    print(f"\n[4] Xuất file CSV đầy đủ (mỗi hàng = 1 job, {dim} cột số) ...")
    col_names = [f"dim_{i}" for i in range(dim)]
    df = pd.DataFrame(vectors, columns=col_names)
    df.insert(0, "job_id", job_ids)
    df.to_csv(OUT_CSV, index=False, encoding="utf-8-sig")
    print(f"    -> Đã ghi: {OUT_CSV}  ({df.shape[0]} hàng x {df.shape[1]} cột)")

    # Xuất JSON đầy đủ: {job_id: [1024 số]}
    print(f"[5] Xuất file JSON đầy đủ ...")
    data = {job_id: vectors[i].tolist() for i, job_id in enumerate(job_ids)}
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    print(f"    -> Đã ghi: {OUT_JSON}")

    print(
        "\n✅ Xong. Mở data/vectors_full.csv bằng Excel (sẽ có 1025 cột) "
        "hoặc data/vectors_full.json để xem đầy đủ từng vector.\n"
        "👉 Muốn xem đầy đủ 1024 chiều của MỘT job cụ thể ngay trên console, chạy:\n"
        "   python 05_view_vectors.py JOB_001"
    )


if __name__ == "__main__":
    main()
