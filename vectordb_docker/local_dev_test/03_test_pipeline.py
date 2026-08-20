"""
Script 3: End-to-end test với dữ liệu thật - semantic search trong Qdrant local.

Script này KHÔNG phụ thuộc đã chạy script 2 trước hay chưa (tự load + upsert lại
từ đầu), nên có thể chạy độc lập.

Demo 2 kiểu truy vấn hay dùng trong AVORA:
  (a) Similarity search thuần: cho 1 job, tìm các job "giống" nó nhất.
  (b) Similarity search + filter theo payload: tìm job giống nhất NHƯNG chỉ
      trong nhóm khuyết tật cụ thể (đúng bài toán gợi ý việc làm theo dạng
      khuyết tật của người dùng).

Chạy:
    python 03_test_pipeline.py
"""

from qdrant_client.models import Filter, FieldCondition, MatchValue

from common import load_job_records, get_qdrant_client, upsert_all, COLLECTION_NAME

QUERY_JOB_ID = "JOB_001"
FILTER_NHOM_KHUYET_TAT = "Khuyết tật thị giác (khiếm thị)"


def main():
    print("[1] Đọc dữ liệu + nạp vào Qdrant local (persistent) ...")
    records = load_job_records()
    client = get_qdrant_client(persistent=True)
    upsert_all(client, records, recreate=True)
    print(f"    -> Đã nạp {len(records)} job")

    # Lấy vector + thông tin của job dùng làm query
    query_record = next(r for r in records if r["job_id"] == QUERY_JOB_ID)
    query_vector = query_record["vector"]
    print(f"\n[2] Query job: {QUERY_JOB_ID} - "
          f"\"{query_record['payload']['nghe']}\" "
          f"({query_record['payload']['nganh']})")

    # ---- (a) Similarity search thuần --------------------------------------
    print("\n[3] (a) Top 5 job GIỐNG NHẤT (không lọc) ...")
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=6,  # +1 vì kết quả đầu thường chính là query_record
    ).points
    for r in results:
        if r.payload["job_id"] == QUERY_JOB_ID:
            continue  # bỏ qua chính nó
        print(f"    score={r.score:.4f} | {r.payload['job_id']} | "
              f"{r.payload['nghe']} ({r.payload['nganh']})")

    # ---- (b) Similarity search + filter theo payload -----------------------
    print(f"\n[4] (b) Top 5 job GIỐNG NHẤT, chỉ trong nhóm "
          f"'{FILTER_NHOM_KHUYET_TAT}' ...")
    filtered_results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="nhom_khuyet_tat",
                    match=MatchValue(value=FILTER_NHOM_KHUYET_TAT),
                )
            ]
        ),
        limit=5,
    ).points
    if not filtered_results:
        print("    -> Không có job nào khớp filter này.")
    for r in filtered_results:
        print(f"    score={r.score:.4f} | {r.payload['job_id']} | "
              f"{r.payload['nghe']} ({r.payload['nganh']})")

    print("\n✅ Pipeline search (thuần + có filter) trên dữ liệu thật chạy thành công.")


if __name__ == "__main__":
    main()
