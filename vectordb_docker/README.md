# Vector DB — Việc làm cho Người khuyết tật (Qdrant, đóng gói Docker)

Một container duy nhất chứa:
- **Qdrant** — vector database engine
- **Dữ liệu đã nạp sẵn** — 57 việc làm, mỗi việc làm là 1 vector 133 chiều
  (`data/job_embeddings.json`, xem chi tiết cách xây vector trong
  `data/embedding_manifest.json`)
- **API truy vấn** (FastAPI, cổng 8000) — bọc quanh Qdrant để dễ dùng hơn:
  tìm theo vector, tìm theo văn bản tự do, lọc theo nhóm/mức độ khuyết tật

Dữ liệu được **tự động nạp vào Qdrant khi container khởi động** (idempotent —
chạy lại không bị trùng lặp).

## 1. Build image

```bash
cd vectordb_docker
docker build -t jobs-vector-db .
```

> Cần internet khi build (để `docker pull qdrant/qdrant` và `pip install`).

## 2. Chạy container

```bash
docker run -d --name jobs-vector-db \
  -p 6333:6333 \
  -p 8000:8000 \
  -v jobs_qdrant_storage:/qdrant/storage \
  jobs-vector-db
```

- `6333` — Qdrant REST API gốc (nếu muốn truy vấn trực tiếp Qdrant)
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
- `query`: mô tả tự do bằng tiếng Việt, được mã hóa bằng đúng pipeline
  TF-IDF + SVD đã dùng để tạo bộ embedding gốc.
- `nhom_khuyet_tat`, `muc_do_khuyet_tat`: bộ lọc **khớp chính xác** (tùy chọn),
  áp dụng trên payload trong Qdrant — đáng tin cậy hơn là để mô hình "đoán"
  qua vector.

### Tìm theo vector có sẵn (ví dụ: vector của 1 job khác, hoặc vector do mô hình ML khác sinh ra)
```bash
curl -X POST http://localhost:8000/search/vector \
  -H "Content-Type: application/json" \
  -d '{"vector": [0.12, 0.05, ...], "top_k": 5}'
```
Vector phải có đúng **133 chiều**, cùng thứ tự đặc trưng như mô tả trong
`data/embedding_manifest.json`.

## 4. Cấu trúc thư mục

```
vectordb_docker/
├── Dockerfile
├── entrypoint.sh          # khởi động Qdrant, đợi sẵn sàng, rồi khởi động API
├── requirements.txt
├── app/
│   └── main.py             # FastAPI: ingest + các endpoint tìm kiếm
└── data/
    ├── job_embeddings.json     # 57 việc làm + vector 133 chiều
    ├── embedding_manifest.json # giải thích cấu trúc từng khối đặc trưng
    └── encoders.pkl            # TF-IDF/SVD/scaler đã fit, dùng để mã hóa
                                  # câu truy vấn văn bản mới cho đúng "không gian"
                                  # vector với dữ liệu đã nạp
```

## 5. Lưu ý về độ chính xác của tìm kiếm theo văn bản

Vector embedding gốc gồm nhiều khối: lương, nhóm khuyết tật, ngành nghề, hình
thức làm việc, khu vực, và văn bản mô tả (TF-IDF+SVD, 32/133 chiều). Khi tìm
theo văn bản tự do (`/search/text`), các khối không phải văn bản (lương, ngành,
...) được điền bằng **giá trị trung bình toàn tập dữ liệu** (trung lập) vì câu
truy vấn tự do thường không nêu rõ các thông tin đó — nên độ tương đồng chủ
yếu phản ánh phần mô tả công việc/kỹ năng. Muốn lọc chính xác theo nhóm/mức độ
khuyết tật, hãy dùng tham số `nhom_khuyet_tat` / `muc_do_khuyet_tat` (lọc
payload chính xác, không phụ thuộc vector).
