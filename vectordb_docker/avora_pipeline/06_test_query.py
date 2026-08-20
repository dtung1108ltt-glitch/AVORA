# -*- coding: utf-8 -*-
"""
BƯỚC 6: Test truy vấn (semantic search) trên collection 1024 chiều
----------------------------------------------------------------------
Thay thế cho 03_test_pipeline.py cũ (vốn dùng TF-IDF 133 chiều).
Giờ dùng embedding ngữ nghĩa thật (multilingual-e5-large) nên kết quả
phải phản ánh ĐÚNG nghĩa công việc, không chỉ trùng từ khoá bề mặt.

3 CÁCH DÙNG:

(A) Không truyền gì -> chạy demo mặc định giống 03_test_pipeline.py cũ:
    lấy JOB_001 làm câu query, tìm top 5 job giống nhất (không lọc),
    rồi tìm top 5 job giống nhất TRONG một nhóm khuyết tật cụ thể.

        python 06_test_query.py

(B) Tìm job tương tự một job_id có sẵn trong collection:

        python 06_test_query.py --job JOB_007

(C) Tìm bằng câu query tự do (text tuỳ ý, mô phỏng người dùng thật nhập):

        python 06_test_query.py --text "nhân viên chăm sóc khách hàng qua điện thoại"
        python 06_test_query.py --text "thiết kế đồ hoạ" --filter "Khuyết tật thị giác (khiếm thị)"

Tham số:
    --job JOB_XXX     : dùng vector có sẵn của job này làm câu query
    --text "..."       : encode câu text mới làm câu query (ưu tiên hơn --job nếu truyền cả 2)
    --filter "..."     : lọc kết quả chỉ trong 1 nhóm khuyết tật (giá trị cột nhom_khuyet_tat)
    --top N            : số kết quả trả về (mặc định 5)
"""

import argparse
import json
import sys
from pathlib import Path

import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.models import FieldCondition, Filter, MatchValue
from sentence_transformers import SentenceTransformer

# Windows console (cp1252) không encode được tiếng Việt có dấu khi print().
if sys.stdout.encoding is None or sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

BASE_DIR = Path(__file__).parent
QDRANT_PATH = BASE_DIR / "qdrant_local_data"
IDS_PATH = BASE_DIR / "data" / "job_ids.json"

COLLECTION_NAME = "avora_jobs_1024"
MODEL_NAME = "intfloat/multilingual-e5-large"  # phải TRÙNG model đã dùng ở bước 2


def print_results(results, title):
    print(f"\n{title}")
    if not results:
        print("    (không có kết quả)")
        return
    for r in results:
        p = r.payload
        print(
            f"    score={r.score:.4f} | {p.get('job_id')} | {p.get('nghe')} "
            f"({p.get('nganh')}) | Nhóm: {p.get('nhom_khuyet_tat')}"
        )


def main():
    parser = argparse.ArgumentParser(description="Test truy vấn semantic search trên avora_jobs_1024")
    parser.add_argument("--job", type=str, default=None, help="job_id có sẵn để dùng làm query")
    parser.add_argument("--text", type=str, default=None, help="câu query tự do")
    parser.add_argument("--filter", type=str, default=None, help="lọc theo nhom_khuyet_tat")
    parser.add_argument("--top", type=int, default=5, help="số kết quả trả về")
    args = parser.parse_args()

    print(f"[1] Kết nối Qdrant local (path='{QDRANT_PATH}') ...")
    client = QdrantClient(path=str(QDRANT_PATH))

    print(f"[2] Tải model embedding: {MODEL_NAME} (dùng cache nếu đã tải ở bước 2) ...")
    model = SentenceTransformer(MODEL_NAME)

    # --- Chế độ mặc định: demo giống 03_test_pipeline.py cũ, dùng JOB_001 ---
    if args.text is None and args.job is None:
        args.job = "JOB_001"

    if args.text is not None:
        # E5 yêu cầu prefix "query: " cho câu truy vấn (khác với "passage: " lúc index)
        print(f"\n[3] Câu query tự do: \"{args.text}\"")
        query_vector = model.encode(
            f"query: {args.text}", normalize_embeddings=True, convert_to_numpy=True
        ).astype("float32").tolist()
        query_label = args.text
    else:
        print(f"\n[3] Dùng vector có sẵn của job: {args.job}")
        # Lấy vector đúng theo job_id (tìm bằng filter payload vì id lưu trong Qdrant là index số nguyên)
        scroll_result, _ = client.scroll(
            collection_name=COLLECTION_NAME,
            scroll_filter=Filter(must=[FieldCondition(key="job_id", match=MatchValue(value=args.job))]),
            with_vectors=True,
            with_payload=True,
            limit=1,
        )
        if not scroll_result:
            print(f"    !! Không tìm thấy job_id '{args.job}' trong collection")
            return
        query_vector = scroll_result[0].vector
        query_label = f"{args.job} - {scroll_result[0].payload.get('nghe')} ({scroll_result[0].payload.get('nganh')})"

    print(f"    -> Query: {query_label}")

    # (a) Top N, không lọc
    res_unfiltered = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=args.top + (1 if args.job else 0),  # +1 vì job chính nó cũng có thể match điểm cao nhất
        with_payload=True,
    ).points
    if args.job:
        res_unfiltered = [r for r in res_unfiltered if r.payload.get("job_id") != args.job][: args.top]
    print_results(res_unfiltered, f"[4] (a) Top {args.top} job GIỐNG NHẤT (không lọc):")

    # (b) Top N, lọc theo nhóm khuyết tật (nếu có truyền --filter)
    if args.filter:
        res_filtered = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=args.top + (1 if args.job else 0),
            query_filter=Filter(
                must=[FieldCondition(key="nhom_khuyet_tat", match=MatchValue(value=args.filter))]
            ),
            with_payload=True,
        ).points
        if args.job:
            res_filtered = [r for r in res_filtered if r.payload.get("job_id") != args.job][: args.top]
        print_results(res_filtered, f"[5] (b) Top {args.top} job GIỐNG NHẤT, chỉ trong nhóm '{args.filter}':")

    print("\n✅ Truy vấn semantic search hoàn tất.")


if __name__ == "__main__":
    main()
