# -*- coding: utf-8 -*-
"""
BƯỚC 2: CSV -> Embedding 1024 chiều -> .npy
---------------------------------------------
Đọc jobs_clean.csv, ghép các field quan trọng thành 1 đoạn text/job,
sinh embedding bằng model đa ngôn ngữ (mặc định: intfloat/multilingual-e5-large,
output 1024 chiều), rồi lưu KẾT QUẢ ra 2 file riêng biệt:

  - data/job_vectors.npy   : ma trận numpy (N, 1024) float32 -> CHỈ chứa số,
                              không chứa job_id hay text gốc.
  - data/job_ids.json      : list job_id theo ĐÚNG thứ tự hàng của job_vectors.npy
                              (dùng để nối vector <-> job_id <-> metadata ở bước 4).

=> Nguyên tắc: .npy chỉ nên chứa vector thuần (ma trận số), KHÔNG nhét text/id
   vào chung, vì numpy không tối ưu cho dữ liệu hỗn hợp kiểu string.
   Việc "map" vector nào là job nào dựa vào THỨ TỰ HÀNG, nên file
   job_ids.json (hoặc chính jobs_clean.csv, cùng thứ tự) đóng vai trò ánh xạ.

Cài đặt (1 lần):
    pip install sentence-transformers pandas numpy

Cách chạy:
    python 02_generate_embeddings.py

Input  : data/jobs_clean.csv
Output : data/job_vectors.npy, data/job_ids.json
"""

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

# Windows console (cp1252) không encode được tiếng Việt có dấu khi print().
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).parent
INPUT_CSV = BASE_DIR / "data" / "jobs_clean.csv"
OUTPUT_NPY = BASE_DIR / "data" / "job_vectors.npy"
OUTPUT_IDS = BASE_DIR / "data" / "job_ids.json"

# multilingual-e5-large: 1024 chiều, hỗ trợ tiếng Việt tốt, chạy được CPU
# (chậm hơn GPU nhưng với 57 job thì vài giây là xong)
MODEL_NAME = "intfloat/multilingual-e5-large"

# Alternative cùng 1024 chiều nếu muốn thử: "BAAI/bge-m3"


def build_text(row: pd.Series) -> str:
    """Ghép các field thành 1 đoạn text để embed.
    Nhắc lại 'nghe' (chức danh) 2 lần để tăng trọng số ngữ nghĩa cho nó,
    vì đây là field quan trọng nhất khi so khớp công việc.
    """
    parts = [
        f"Công việc: {row['nghe']}.",
        f"Công việc: {row['nghe']}.",  # nhân đôi trọng số chức danh
        f"Ngành: {row['nganh']}.",
        f"Mô tả: {row['mo_ta_cong_viec']}.",
        f"Kỹ năng yêu cầu: {row['ky_nang']}.",
        f"Hình thức làm việc: {row['hinh_thuc_lam_viec']}.",
    ]
    return " ".join(p for p in parts if p and not p.startswith(("Công việc: .", "Ngành: .")))


def main():
    print(f"[1] Đọc CSV: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV, encoding="utf-8-sig").fillna("")
    print(f"    -> {len(df)} job")

    print(f"[2] Tải model embedding: {MODEL_NAME} (lần đầu sẽ tải về, hơi lâu) ...")
    model = SentenceTransformer(MODEL_NAME)

    texts = df.apply(build_text, axis=1).tolist()
    # E5 yêu cầu prefix "passage: " cho văn bản được lưu trữ / tìm kiếm
    texts_prefixed = [f"passage: {t}" for t in texts]

    print(f"[3] Sinh embedding cho {len(texts_prefixed)} job ...")
    vectors = model.encode(
        texts_prefixed,
        batch_size=16,
        show_progress_bar=True,
        normalize_embeddings=True,  # chuẩn hoá để dùng cosine similarity
        convert_to_numpy=True,
    ).astype("float32")

    print(f"    -> Kích thước ma trận vector: {vectors.shape}  (N_job, dim)")
    assert vectors.shape[0] == len(df), "Số vector không khớp số job!"
    assert vectors.shape[1] == 1024, f"Số chiều không phải 1024, mà là {vectors.shape[1]}"

    OUTPUT_NPY.parent.mkdir(parents=True, exist_ok=True)
    np.save(OUTPUT_NPY, vectors)
    print(f"[4] Đã lưu vector: {OUTPUT_NPY}")

    job_ids = df["job_id"].tolist()
    with open(OUTPUT_IDS, "w", encoding="utf-8") as f:
        json.dump(job_ids, f, ensure_ascii=False, indent=2)
    print(f"[5] Đã lưu job_ids (ánh xạ thứ tự): {OUTPUT_IDS}")

    print("\n✅ Xong bước 2. Tiếp theo chạy: python 03_check_npy.py")


if __name__ == "__main__":
    main()