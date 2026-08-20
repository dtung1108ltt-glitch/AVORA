# -*- coding: utf-8 -*-
"""
BƯỚC 1: Excel -> CSV
---------------------
Đọc file Excel gốc (Vieclamnguoikhuyettat_cleandata_.xlsx), làm sạch,
gán job_id (JOB_001, JOB_002, ...) và xuất ra CSV chuẩn UTF-8 để
bước 2 (sinh embedding) dùng.

Cách chạy:
    python 01_excel_to_csv.py

Input  : data/Vieclamnguoikhuyettat_cleandata_.xlsx
Output : data/jobs_clean.csv
"""

import sys
import pandas as pd
from pathlib import Path

# Windows console (cp1252) không encode được tiếng Việt có dấu khi print().
# Ép stdout/stderr sang UTF-8 để tránh UnicodeEncodeError.
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).parent
INPUT_XLSX = BASE_DIR / "data" / "Vieclamnguoikhuyettat_cleandata_.xlsx"
OUTPUT_CSV = BASE_DIR / "data" / "jobs_clean.csv"

# Tên cột chuẩn hoá (không dấu, snake_case) <- tên cột tiếng Việt trong file gốc
COLUMN_MAP = {
    "Nhóm khuyết tật": "nhom_khuyet_tat",
    "Nghề / Công việc": "nghe",
    "Ngành / Lĩnh vực": "nganh",
    "Mô tả công việc": "mo_ta_cong_viec",
    "Kỹ năng / Yêu cầu chính": "ky_nang",
    "Hỗ trợ / Điều chỉnh cần thiết": "ho_tro",
    "Hình thức làm việc": "hinh_thuc_lam_viec",
    "Mức lương tham khảo (triệu VNĐ/tháng)": "muc_luong",
    "Khu vực phổ biến": "khu_vuc",
    "Mức độ khuyết tật phù hợp": "muc_do_khuyet_tat",
    "Nguồn tham khảo": "nguon_tham_khao",
}


def main():
    print(f"[1] Đọc file Excel: {INPUT_XLSX.name} ...")
    raw = pd.read_excel(INPUT_XLSX, sheet_name="viec_lam_nguoi_khuyet_tat_datas", header=None)

    # Dòng 0 trống, dòng 1 là header thật, dữ liệu bắt đầu từ dòng 2
    header_row = raw.iloc[1].tolist()
    df = raw.iloc[2:].copy()
    df.columns = header_row
    df = df.reset_index(drop=True)

    # Bỏ các dòng hoàn toàn trống
    df = df.dropna(how="all")

    print(f"    -> Đọc được {len(df)} dòng dữ liệu")

    # Đổi tên cột sang snake_case không dấu
    missing_cols = [c for c in COLUMN_MAP if c not in df.columns]
    if missing_cols:
        print(f"    !! CẢNH BÁO: thiếu cột trong file gốc: {missing_cols}")
    df = df.rename(columns=COLUMN_MAP)

    # Chỉ giữ các cột đã map (đúng thứ tự)
    ordered_cols = list(COLUMN_MAP.values())
    df = df[[c for c in ordered_cols if c in df.columns]]

    # Xử lý NaN -> chuỗi rỗng cho các cột text
    text_cols = df.columns.tolist()
    for c in text_cols:
        df[c] = df[c].fillna("").astype(str).str.strip()

    # Gán job_id JOB_001, JOB_002, ...
    df.insert(0, "job_id", [f"JOB_{i+1:03d}" for i in range(len(df))])

    # Kiểm tra field bắt buộc không rỗng
    required = ["nghe", "nganh", "mo_ta_cong_viec"]
    empty_mask = (df[required] == "").any(axis=1)
    if empty_mask.any():
        print(f"    !! CẢNH BÁO: {empty_mask.sum()} dòng thiếu field bắt buộc {required}")
        print(df.loc[empty_mask, ['job_id'] + required].to_string())

    OUTPUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")

    print(f"[2] Đã ghi CSV: {OUTPUT_CSV}")
    print(f"    -> {len(df)} dòng, {len(df.columns)} cột: {df.columns.tolist()}")
    print("\n✅ Xong bước 1. Tiếp theo chạy: python 02_generate_embeddings.py")


if __name__ == "__main__":
    main()