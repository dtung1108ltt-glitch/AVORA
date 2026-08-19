# Vector DB — Việc làm cho Người khuyết tật (Qdrant, đóng gói Docker)

## Kiến trúc đã thống nhất (2026-08-18)

Toàn hệ thống chỉ dùng **đúng 1 model embedding duy nhất**:
`Qwen/Qwen3-Embedding-8B` (4096 chiều) — dùng cho cả việc encode 57 job
lúc build image lẫn encode câu truy vấn người dùng lúc chạy thật. Pipeline
TF-IDF/SVD (133 chiều) trước đây đã **bị gỡ khỏi API** — các file liên quan
(`data/job_embeddings.json`, `data/encoders.pkl`,
`data/embedding_manifest.json`) vẫn còn trên đĩa để tham khảo lịch sử,
nhưng không còn được service này nạp hay dùng nữa.

> ⚠️ **Cảnh báo tài nguyên** — Qwen3-Embedding-8B là model decoder **8 tỷ
> tham số** (kiến trúc giống LLM, không phải encoder nhẹ như e5-small
> trước đây):
> - Tải model lần đầu (~16-32GB tuỳ precision) lúc build image — cần ít
>   nhất 20-30GB dung lượng trống trên ổ đĩa lúc build.
> - Cần tối thiểu ~16GB RAM để load model (khuyến nghị chính thức của Qwen
>   là GPU 16GB VRAM để chạy ổn định; CPU-only vẫn chạy được nhưng chậm hơn
>   nhiều, và RAM phải đủ nếu không sẽ bị kill OOM).
> - Mỗi lần encode câu query lúc search cũng chậm hơn đáng kể so với
>   e5-small trước đây.

M��t container duy nhất chứa:
- **Qdrant** — vector database engine
- **1 collection dữ liệu đã nạp sẵn** — `avora_jobs` (4096 chiều), 57 việc
  làm, vector sinh từ `Qwen/Qwen3-Embedding-8B`, chỉ nhúng phần **mô tả
  công việc** (Nghề, Mô tả, Kỹ năng, Hỗ trợ). **Không** nhúng `Nhóm khuyết
  tật` / `Mức độ khuyết tật phù hợp` vào vector — tránh rò rỉ nhãn (label
  leakage) vào không gian tìm kiếm. Encode ngay lúc **build image** (xem
  `scripts/build_index.py`), không cần internet lúc chạy.
- **API truy vấn** (FastAPI, cổng 8000) — tìm theo vector, theo văn bản tự
  do, lọc theo nhóm/mức độ khuyết tật
- **`reference/`** — bản đã sửa lỗi tương thích + đồng bộ đúng model/quy
  ước prompt của 2 script gốc (`embed_and_load_qdrant.py`,
  `query_qdrant.py`) để chạy độc lập nếu cần, dùng đúng tên collection
  `avora_jobs` nên có thể trỏ thẳng vào Qdrant của container này (port 6333)

Dữ liệu được **tự động nạp vào Qdrant khi container khởi động** (idempotent —
chạy lại không bị trùng lặp). Model Qwen3 cũng được tải sẵn từ lúc build,
nên container khởi động không cần internet lúc runtime (nhưng vẫn cần
~16GB RAM để load model vào bộ nhớ mỗi lần container start).

## 1. Build image

```bash
cd vectordb_docker
docker build --platform linux/amd64 --provenance=false -t jobs-vector-db .
```

> Cần internet khi build (để `docker pull qdrant/qdrant`, `pip install`, và
> tải model Qwen3-Embedding-8B ~16-32GB). Build **lâu hơn đáng kể** so với
> bản e5-small trước đây (model nặng gấp ~70 lần) — có thể mất từ vài chục
> phút đến hàng giờ tuỳ tốc độ mạng và cấu hình máy.

## 2. Chạy container

```bash
docker run -d --name jobs-vector-db \
  -p 6333:6333 \
  -p 8000:8000 \
  -v jobs_qdrant_storage:/qdrant/storage \
  jobs-vector-db
```

- `6333` — Qdrant REST API gốc (nếu muốn truy vấn trực tiếp Qdrant, hoặc
  chạy `reference/query_qdrant.py` nhắm vào container)
- `8000` — API tiện dụng (FastAPI) — **nên dùng cổng này**
- Volume `jobs_qdrant_storage` giúp dữ liệu vector không mất khi restart container

Kiểm tra container đã sẵn sàng:
```bash
curl http://localhost:8000/health
```

## 3. Các endpoint chính (cổng 8000)

### Liệt kê việc làm
```bash
curl "http://localhost:8000/jobs?limit=5"
```

### Lấy 1 việc làm theo job_id
```bash
curl "http://localhost:8000/jobs/JOB_001"
```

### Tìm theo văn bản tự do (semantic search)
```bash
curl -X POST http://localhost:8000/search/text \
  -H "Content-Type: application/json" \
  -d '{
        "query": "chăm sóc khách hàng làm việc từ xa",
        "top_k": 5,
        "nhom_khuyet_tat": "Khuyết tật vận động"
      }'
```
- `nhom_khuyet_tat`, `muc_do_khuyet_tat`: bộ lọc **khớp chính xác** (tùy chọn),
  áp dụng trên payload trong Qdrant — dùng để lọc đúng đối tượng phù hợp mà
  không cần (và không nên) để vector "đoán" giúp việc đó.

### Tìm theo vector có sẵn
```bash
curl -X POST http://localhost:8000/search/vector \
  -H "Content-Type: application/json" \
  -d '{"vector": [0.12, 0.05, ...], "top_k": 5}'
```
- Vector phải có đúng **4096 chiều** (Qwen3-Embedding-8B)

## 4. Cấu trúc thư mục

```
vectordb_docker/
├── Dockerfile
├── entrypoint.sh          # khởi động Qdrant, đợi sẵn sàng, rồi khởi động API
├── requirements.txt
├── app/
│   └── main.py             # FastAPI: ingest 1 collection + các endpoint tìm kiếm
├── scripts/
│   └── build_index.py      # chạy lúc BUILD: encode 57 job bằng Qwen3-Embedding-8B (JD-only)
├── reference/               # bản sửa lỗi + đồng bộ model của 2 script gốc, chạy độc lập nếu cần
│   ├── embed_and_load_qdrant.py
│   └── query_qdrant.py
└── data/
    ├── jobs_raw.json              # dữ liệu gốc đầy đủ (input cho build_index.py)
    ├── job_embeddings_qwen3.json  # sinh ra lúc build: vector Qwen3 (4096 chiều)
    │
    │   # --- LEGACY, KHÔNG còn được app/main.py dùng, giữ lại tham khảo ---
    ├── job_embeddings.json      # 57 việc làm + vector TF-IDF/SVD (133 chiều, cũ)
    ├── embedding_manifest.json  # giải thích cấu trúc vector TF-IDF (cũ)
    └── encoders.pkl             # TF-IDF/SVD/scaler đã fit (cũ)
```

## 5. Vì sao loại nhãn khuyết tật khỏi vector?

Nếu đưa `Nhóm khuyết tật` / `Mức độ khuyết tật phù hợp` vào văn bản dùng để
encode, mô hình có thể "ăn gian" — tìm đúng việc làm chỉ vì khớp nhãn category
giống hệt, chứ không thực sự hiểu ngữ nghĩa của mô tả công việc. Vector
trong package này **chỉ** được sinh ra từ Nghề/Mô tả/Kỹ năng/Hỗ trợ — buộc
mô hình phải đánh giá độ phù hợp dựa trên nội dung công việc thật sự. Muốn
lọc theo nhóm/mức độ khuyết tật một cách chính xác, dùng tham số
`nhom_khuyet_tat` / `muc_do_khuyet_tat` (lọc payload, tách biệt hoàn toàn khỏi
vector).

## 6. Quy ước prompt của Qwen3-Embedding-8B (khác e5-small)

Model này là **instruction-aware**, khác quy ước `"passage: "`/`"query: "`
đơn giản của e5-small:
- **Document/passage** (mô tả công việc lúc index): encode **thô**, không
  thêm prefix gì.
- **Query** (câu tìm kiếm của người dùng): thêm hướng dẫn nhiệm vụ theo
  định dạng `"Instruct: {mô tả nhiệm vụ}\nQuery:{câu query}"` — xem hằng số
  `QUERY_TASK_INSTRUCTION` trong `app/main.py` (và đồng bộ y hệt trong
  `reference/query_qdrant.py`).
