# Vector DB — Việc làm cho Người khuyết tật (Qdrant, đóng gói Docker)

Một container duy nhất chứa:
- **Qdrant** — vector database engine
- **2 collection dữ liệu đã nạp sẵn**, mỗi collection = 57 việc làm:
  - `avora_jobs` (384 chiều) — `intfloat/multilingual-e5-small`, chỉ nhúng
    phần **mô tả công việc** (Nghề, Mô tả, Kỹ năng, Hỗ trợ). **Không** nhúng
    `Nhóm khuyết tật` / `Mức độ khuyết tật phù hợp` vào vector — tránh rò rỉ
    nhãn (label leakage) vào không gian tìm kiếm. Encode ngay lúc **build
    image** (xem `scripts/build_index.py`), không cần internet lúc chạy.
  - `jobs` (133 chiều) — pipeline TF-IDF/SVD + one-hot/multi-hot ban đầu
    (lưu ý: collection này **có** đưa nhãn khuyết tật vào vector, giữ lại để
    tham khảo/so sánh, không phải lựa chọn mặc định)
- **API truy vấn** (FastAPI, cổng 8000) — tìm theo vector, theo văn bản tự do
  (`method: "e5"` mặc định, hoặc `"tfidf"`), lọc theo nhóm/mức độ khuyết tật
- **`reference/`** — bản đã sửa lỗi tương thích của 2 script gốc
  (`embed_and_load_qdrant.py`, `query_qdrant.py`) để chạy độc lập nếu cần,
  dùng đúng tên collection `avora_jobs` nên có thể trỏ thẳng vào Qdrant của
  container này (port 6333)

Dữ liệu được **tự động nạp vào Qdrant khi container khởi động** (idempotent —
chạy lại không bị trùng lặp). Model e5 cũng được tải sẵn từ lúc build, nên
container khởi động nhanh, không cần internet lúc runtime.

## 1. Build image

```bash
cd vectordb_docker
docker build --platform linux/amd64 --provenance=false -t jobs-vector-db .
```

> Cần internet khi build (để `docker pull qdrant/qdrant`, `pip install`, và
> tải model e5-small ~120MB). Build lâu hơn bản gốc (torch + sentence-
> transformers + tải + encode), nhưng nhanh hơn bản CLIP trước đó vì
> e5-small nhẹ hơn nhiều.

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
curl "http://localhost:8000/jobs?limit=5&method=e5"
```

### Lấy 1 việc làm theo job_id
```bash
curl "http://localhost:8000/jobs/JOB_001?method=e5"
```

### Tìm theo văn bản tự do (semantic search)
```bash
curl -X POST http://localhost:8000/search/text \
  -H "Content-Type: application/json" \
  -d '{
        "query": "chăm sóc khách hàng làm việc từ xa",
        "top_k": 5,
        "method": "e5",
        "nhom_khuyet_tat": "Khuyết tật vận động"
      }'
```
- `method`: `"e5"` (mặc định) — dùng `multilingual-e5-small`, chỉ dựa vào mô
  tả công việc, không bị rò rỉ nhãn khuyết tật vào vector; hoặc `"tfidf"` —
  pipeline gốc (có đưa nhãn khuyết tật vào vector).
- `nhom_khuyet_tat`, `muc_do_khuyet_tat`: bộ lọc **khớp chính xác** (tùy chọn),
  áp dụng trên payload trong Qdrant — dùng để lọc đúng đối tượng phù hợp mà
  không cần (và không nên) để vector "đoán" giúp việc đó.

### Tìm theo vector có sẵn
```bash
curl -X POST http://localhost:8000/search/vector \
  -H "Content-Type: application/json" \
  -d '{"vector": [0.12, 0.05, ...], "top_k": 5, "method": "e5"}'
```
- `method: "e5"` → vector phải có **384 chiều**
- `method: "tfidf"` → vector phải có **133 chiều** (cấu trúc trong
  `data/embedding_manifest.json`)

## 4. Cấu trúc thư mục

```
vectordb_docker/
├── Dockerfile
├── entrypoint.sh          # khởi động Qdrant, đợi sẵn sàng, rồi khởi động API
├── requirements.txt
├── app/
│   └── main.py             # FastAPI: ingest 2 collection + các endpoint tìm kiếm
├── scripts/
│   └── build_index.py      # chạy lúc BUILD: encode 57 job bằng e5-small (JD-only)
├── reference/               # bản sửa lỗi của 2 script gốc, chạy độc lập nếu cần
│   ├── embed_and_load_qdrant.py
│   └── query_qdrant.py
└── data/
    ├── jobs_raw.json            # dữ liệu gốc đầy đủ (input cho build_index.py)
    ├── job_embeddings.json      # 57 việc làm + vector TF-IDF/SVD (133 chiều)
    ├── job_embeddings_e5.json   # sinh ra lúc build: vector e5 (384 chiều)
    ├── embedding_manifest.json  # giải thích cấu trúc vector TF-IDF
    └── encoders.pkl             # TF-IDF/SVD/scaler đã fit, dùng để mã hóa
                                   # câu truy vấn văn bản mới theo pipeline cũ
```

## 5. Vì sao loại nhãn khuyết tật khỏi vector e5?

Nếu đưa `Nhóm khuyết tật` / `Mức độ khuyết tật phù hợp` vào văn bản dùng để
encode, mô hình có thể "ăn gian" — tìm đúng việc làm chỉ vì khớp nhãn category
giống hệt, chứ không thực sự hiểu ngữ nghĩa của mô tả công việc. Vector `e5`
trong package này **chỉ** được sinh ra từ Nghề/Mô tả/Kỹ năng/Hỗ trợ — buộc mô
hình phải đánh giá độ phù hợp dựa trên nội dung công việc thật sự. Muốn lọc
theo nhóm/mức độ khuyết tật một cách chính xác, dùng tham số
`nhom_khuyet_tat` / `muc_do_khuyet_tat` (lọc payload, tách biệt hoàn toàn khỏi
vector).

Collection `jobs` (TF-IDF) được giữ lại chỉ để tham khảo/so sánh — vector đó
**có** đưa nhãn khuyết tật vào, nên không nên dùng làm cơ sở đánh giá độ chính
xác ngữ nghĩa.
