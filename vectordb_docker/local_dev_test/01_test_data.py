"""
Script 1: Validate dữ liệu embedding đã chuẩn bị sẵn (database_demo.zip).

Vector trong bộ dữ liệu này ĐÃ được tính sẵn (one-hot + salary norm + TF-IDF/SVD),
không cần chạy qua model embedding nào cả -> script này chỉ kiểm tra dữ liệu có
hợp lệ, đủ chiều, đúng cấu trúc trước khi đẩy vào Qdrant ở script 2 & 3.

Chạy:
    python 01_test_data.py
"""

from collections import Counter

from common import load_job_records, EXPECTED_VECTOR_SIZE


def main():
    print("[1] Đọc job_embeddings.json (+ làm giàu từ jobs_raw.json) ...")
    records = load_job_records(enrich=True)
    print(f"    -> Tổng số job: {len(records)}")

    print("\n[2] Kiểm tra số chiều vector ...")
    dims = {len(r["vector"]) for r in records}
    print(f"    -> Các giá trị dimension gặp phải: {dims}")
    assert dims == {EXPECTED_VECTOR_SIZE}, (
        f"❌ Có vector sai số chiều! Kỳ vọng {EXPECTED_VECTOR_SIZE}, gặp {dims}"
    )
    print(f"    -> OK, tất cả đều {EXPECTED_VECTOR_SIZE} chiều")

    print("\n[3] Kiểm tra job_id có bị trùng không ...")
    ids = [r["job_id"] for r in records]
    dup = [jid for jid, cnt in Counter(ids).items() if cnt > 1]
    assert not dup, f"❌ job_id bị trùng: {dup}"
    print("    -> OK, không trùng job_id")

    print("\n[4] Kiểm tra payload có field rỗng bất thường không ...")
    missing = [
        r["job_id"] for r in records
        if not r["payload"].get("nghe") or not r["payload"].get("nhom_khuyet_tat")
    ]
    if missing:
        print(f"    -> ⚠️ Các job thiếu field 'nghe'/'nhom_khuyet_tat': {missing}")
    else:
        print("    -> OK, không có field bắt buộc bị rỗng")

    print("\n[5] Thống kê phân bố theo Nhóm khuyết tật:")
    for nhom, cnt in Counter(r["payload"]["nhom_khuyet_tat"] for r in records).most_common():
        print(f"    - {nhom}: {cnt} job")

    print("\n[6] Thống kê phân bố theo Ngành / Lĩnh vực (top 10):")
    for nganh, cnt in Counter(r["payload"]["nganh"] for r in records).most_common(10):
        print(f"    - {nganh}: {cnt} job")

    print("\n[7] Xem thử 1 record đầy đủ (JOB_001):")
    sample = next(r for r in records if r["job_id"] == "JOB_001")
    for k, v in sample["payload"].items():
        print(f"    {k}: {v}")
    print(f"    vector[:8] = {sample['vector'][:8]} ...")

    print("\n✅ Dữ liệu hợp lệ, sẵn sàng nạp vào Qdrant (script 2 & 3).")


if __name__ == "__main__":
    main()
