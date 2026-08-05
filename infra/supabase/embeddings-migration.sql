-- Bổ sung Vector Search (Giai đoạn 3) cho AVORA — chạy SAU free-mvp-schema.sql.
-- Dùng Qwen3-Embedding-8B qua OpenRouter (native 4096 chiều) — xem services/api-gateway/src/services/embedding.service.ts.
--
-- Chạy trong Supabase SQL editor.

-- pgvector có sẵn trên Supabase (mọi gói, kể cả Free), chỉ cần bật extension.
create extension if not exists vector;

-- Cột lưu embedding của job (tính từ tiêu đề + mô tả + kỹ năng yêu cầu + tính năng tiếp cận).
alter table public.jobs
  add column if not exists embedding vector(4096);

-- Index để tăng tốc truy vấn cosine similarity khi số lượng job lớn (vài nghìn job trở lên).
-- Với vài trăm job như giai đoạn demo/thi, có thể bỏ qua bước này — Postgres vẫn quét tuần tự đủ nhanh.
-- HNSW của pgvector giới hạn tối đa 2000 chiều, nên KHÔNG thể index trực tiếp vector 4096 chiều này.
-- Nếu cần index thật, phải giảm chiều embedding (MRL truncation) xuống <=2000 khi gọi model, xem ghi chú cuối file.

-- Hàm RPC để job.service.ts gọi qua supabase.rpc('match_jobs', ...).
-- Trả về job kèm điểm similarity (1 - cosine distance), sắp xếp giảm dần.
create or replace function public.match_jobs(
  query_embedding vector(4096),
  match_count int default 20
)
returns table (
  id uuid,
  title text,
  company text,
  location text,
  type text,
  salary_range text,
  description text,
  requirements jsonb,
  benefits jsonb,
  accessibility_features jsonb,
  accessibility_score integer,
  source_url text,
  posted_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  similarity float
)
language sql stable
as $$
  select
    j.id, j.title, j.company, j.location, j.type, j.salary_range, j.description,
    j.requirements, j.benefits, j.accessibility_features, j.accessibility_score,
    j.source_url, j.posted_date, j.created_at, j.updated_at,
    1 - (j.embedding <=> query_embedding) as similarity
  from public.jobs j
  where j.embedding is not null
  order by j.embedding <=> query_embedding
  limit match_count;
$$;

-- Ghi chú: nếu sau này cần index HNSW (khi job > ~5.000 dòng), gọi embedding model với
-- tham số dimensions=1024 (MRL truncation, Qwen3-Embedding-8B hỗ trợ 32-4096 chiều) thay vì 4096,
-- đổi vector(4096) -> vector(1024) ở trên, rồi thêm:
--   create index on public.jobs using hnsw (embedding vector_cosine_ops);