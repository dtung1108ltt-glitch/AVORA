"""
Script 2: Nạp dữ liệu thật (57 job) vào Qdrant Local Mode - KHÔNG cần Docker/Podman.

Qdrant local mode:
  - QdrantClient(path="./qdrant_local_data") -> embedded, lưu xuống đĩa (RocksDB),
    dữ liệu còn nguyên giữa các lần chạy.
  - QdrantClient(":memory:") -> chạy trong RAM, mất khi script kết thúc.

Script này: tạo collection, upsert toàn bộ job thật, rồi kiểm tra lại
(count, retrieve by id) để chắc chắn dữ liệu đã vào đúng và đủ.

Chạy:
    python 02_test_qdrant_local.py
"""

from common import (
    load_job_records,
    get_qdrant_client,
    upsert_all,
    COLLECTION_NAME,
)


def main():
    print("[1] Đọc dữ liệu job thật ...")
    records = load_job_records()
    print(f"    -> {len(records)} job, vector size = {len(records[0]['vector'])}")

    print(f"\n[2] Kết nối Qdrant local mode (persistent, path='./qdrant_local_data') ...")
    client = get_qdrant_client(persistent=True)

    print(f"[3] Tạo collection '{COLLECTION_NAME}' và upsert {len(records)} job ...")
    upsert_all(client, records, recreate=True)
    print("    -> OK")

    print("\n[4] Kiểm tra số điểm trong collection ...")
    count = client.count(collection_name=COLLECTION_NAME).count
    print(f"    -> count = {count}")
    assert count == len(records), "❌ Số điểm trong Qdrant không khớp số job upsert!"
    print("    -> OK, khớp với số job đã đọc")

    print("\n[5] Thử retrieve 1 điểm bằng id (JOB_001, id=0) ...")
    points = client.retrieve(collection_name=COLLECTION_NAME, ids=[0], with_payload=True)
    p = points[0]
    print(f"    -> id={p.id}")
    for k, v in p.payload.items():
        print(f"       {k}: {v}")

    print("\n✅ Dữ liệu thật đã nạp thành công vào Qdrant local (không cần Docker/Podman).")
    print("👉 Dữ liệu vẫn còn trong thư mục ./qdrant_local_data để script 3 dùng lại.")


if __name__ == "__main__":
    main()
