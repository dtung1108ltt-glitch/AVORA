# AVORA – Pipeline nâng cấp vector 1024 chiều

## Luồng xử lý

```
Excel (.xlsx)
   │  01_excel_to_csv.py
   ▼
CSV (jobs_clean.csv)                 <- metadata gốc (text), có job_id
   │  02_generate_embeddings.py  (model đa ngôn ngữ, 1024 chiều)
   ▼
job_vectors.npy  +  job_ids.json     <- CHỈ chứa số (ma trận vector) + ánh xạ thứ tự
   │  03_check_npy.py                (kiểm tra shape, NaN, norm...)
   ▼
04_load_to_qdrant.py  (join npy + json + csv theo job_id)
   ▼
Qdrant local (collection 'avora_jobs_1024')
```

## Trả lời câu hỏi: "Lúc chuyển ra vector thì lưu vector đó vô đâu?"

**Nguyên tắc: `.npy` chỉ nên chứa MA TRẬN SỐ THUẦN TUÝ**, không nhét chung
job_id hay text vào (numpy không được thiết kế cho dữ liệu hỗn hợp
string + số, sẽ mất hiệu năng và khó thao tác).

Vì vậy pipeline này tách làm 2 file đi kèm nhau, liên kết qua **thứ tự hàng**:

| File | Chứa gì | Vai trò |
|---|---|---|
| `data/job_vectors.npy` | ma trận `(57, 1024)` float32 | vector thuần, không có ý nghĩa gì nếu đứng một mình |
| `data/job_ids.json` | list `["JOB_001", "JOB_002", ...]` | ánh xạ: hàng thứ *i* của npy ↔ job_id thứ *i* trong list này |
| `data/jobs_clean.csv` | toàn bộ metadata text (nghề, ngành, mô tả...) | tra cứu payload khi đã biết job_id |

Khi nạp vào Qdrant (bước 4), script join 3 file này lại theo `job_id` để mỗi
point trong Qdrant có đủ: `id`, `vector` (1024 chiều), và `payload` (toàn bộ
metadata) — giống hệt cách `avora_jobs_legacy_tfidf133` cũ hoạt động, chỉ khác
là vector giờ có ý nghĩa ngữ nghĩa thật (embedding) thay vì TF-IDF.

⚠️ Quan trọng: KHÔNG được sort/shuffle `jobs_clean.csv` hay chỉnh sửa
`job_ids.json` một cách độc lập sau khi đã sinh `job_vectors.npy` — nếu không
thứ tự sẽ lệch và vector sẽ bị gán nhầm cho job khác. Nếu cần sửa dữ liệu, sửa
từ Excel gốc rồi chạy lại từ bước 1.

## Cách chạy (trên máy local của bạn — xem lưu ý bên dưới)

```bash
pip install -r requirements.txt

python 01_excel_to_csv.py          # Excel -> CSV
python 02_generate_embeddings.py   # CSV -> job_vectors.npy (1024 chiều)
python 03_check_npy.py             # kiểm tra file npy
python 04_load_to_qdrant.py        # npy + CSV -> Qdrant local
```

## Lưu ý về môi trường chạy bước 2

`02_generate_embeddings.py` dùng model `intfloat/multilingual-e5-large`
(1024 chiều) tải từ Hugging Face. Môi trường sandbox tạo ra các file này
**không có quyền truy cập mạng tới huggingface.co**, nên mình chưa chạy thử
được bước 2–4 ở đây — bạn cần chạy 4 script này trên máy local (giống cách
bạn đã chạy `01/02/03_test_*.py` trước đó trong
`vectordb_docker\local_dev_test`).

Bước 1 (`01_excel_to_csv.py`) mình **đã chạy thử thành công** trong sandbox —
kết quả `data/jobs_clean.csv` (57 job, 12 cột) đã có sẵn trong thư mục này,
bạn dùng lại luôn không cần chạy lại bước 1 (trừ khi Excel gốc thay đổi).

## Model embedding dùng trong bước 2

Mặc định: `intfloat/multilingual-e5-large` — 1024 chiều, hỗ trợ tiếng Việt,
chạy tốt trên CPU với 57 job (vài giây tới vài chục giây tuỳ máy).

Muốn thử model khác cùng 1024 chiều: đổi `MODEL_NAME` trong
`02_generate_embeddings.py` thành `"BAAI/bge-m3"`.

Lưu ý: model E5 yêu cầu prefix `"passage: "` khi embed văn bản lưu trữ, và
`"query: "` khi embed câu truy vấn lúc search — script bước 2 đã tự thêm
prefix `passage:`, nhưng khi bạn viết script search sau này (thay cho
`03_test_pipeline.py` cũ) nhớ thêm `"query: "` vào câu query trước khi encode.

## Khác biệt so với pipeline cũ (133 chiều, TF-IDF)

- Vector giờ mang ngữ nghĩa thật (semantic embedding) thay vì đếm từ (TF-IDF)
  → kết quả search theo nghĩa công việc chính xác hơn nhiều.
- Tên collection Qdrant đổi thành `avora_jobs_1024` (giữ nguyên
  `avora_jobs_legacy_tfidf133` cũ để so sánh nếu muốn).
- Thêm bước kiểm tra `.npy` độc lập (bước 3) trước khi nạp Qdrant, để bắt lỗi
  sớm (NaN, sai chiều, lệch thứ tự) thay vì phát hiện khi search cho kết quả
  vô lý.
