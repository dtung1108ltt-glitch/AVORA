/**
 * Seed dữ liệu job từ file scripts/seed-data/jobs-seed.json (chuyển từ
 * Vieclamnguoikhuyettat_cleandata_.xlsx) vào bảng public.jobs trên Supabase,
 * kèm tính sẵn embedding (Qwen3-Embedding-8B) cho từng job để Vector Search dùng ngay.
 *
 * YÊU CẦU TRƯỚC KHI CHẠY:
 *   1. Đã chạy infra/supabase/free-mvp-schema.sql       (tạo bảng jobs)
 *   2. Đã chạy infra/supabase/embeddings-migration.sql  (thêm cột embedding + hàm match_jobs)
 *   3. .env có SUPABASE_URL, SUPABASE_SERVICE_KEY, và OPENAI_API_KEY (OpenRouter key)
 *
 * Chạy:
 *   cd services/api-gateway
 *   npx tsx scripts/seed-jobs.ts
 *
 * Script IDEMPOTENT: chạy lại nhiều lần không tạo trùng job — dùng source_url + title
 * làm khóa nhận diện, upsert (update nếu đã tồn tại, insert nếu chưa).
 */

import { config } from 'dotenv';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Nạp .env giống hệt cách services/api-gateway/src/config/env.ts làm, vì script này
// chạy độc lập bên ngoài luồng khởi động Express server.
config();
config({ path: resolve(process.cwd(), '../../.env') });

export type SeedRow = {
  disability_group: string;
  role: string;
  industry: string;
  description: string;
  skills: string;
  support_needed: string;
  work_type: string;
  salary_range: string;
  location: string;
  severity: string;
  source: string;
};

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const splitList = (value: string): string[] =>
  value
    .split(/[,;]/)
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Chấm accessibility_score (0-100) theo heuristic đơn giản, vì dữ liệu gốc không có
 * sẵn con số này — chỉ có "Mức độ khuyết tật phù hợp" (Nhẹ / Vừa / Nặng) dạng chữ.
 * Nguyên tắc: job phù hợp với càng nhiều mức độ khuyết tật + càng linh hoạt về địa điểm
 * làm việc (remote/tại nhà) thì điểm tiếp cận càng cao.
 */
export const computeAccessibilityScore = (row: SeedRow): number => {
  let score = 40;

  if (row.severity.includes('Nhẹ')) score += 15;
  if (row.severity.includes('Vừa')) score += 15;
  if (row.severity.includes('Nặng')) score += 15;

  const flexible = /từ xa|remote|tại nhà|online/i.test(`${row.work_type} ${row.location}`);
  if (flexible) score += 15;

  return Math.min(100, score);
};

export const buildRequirements = (row: SeedRow): string[] => splitList(row.skills);

export const buildAccessibilityFeatures = (row: SeedRow): string[] => [
  `Phù hợp: ${row.disability_group}`,
  ...splitList(row.support_needed),
];

export const buildDescription = (row: SeedRow): string =>
  `${row.description} (Ngành: ${row.industry}, mức độ khuyết tật phù hợp: ${row.severity}).`;

export const buildEmbeddingText = (row: SeedRow): string =>
  [row.role, row.industry, row.description, row.skills, row.support_needed, row.disability_group]
    .filter(Boolean)
    .join('. ');

async function main() {
  // Import ở đây (thay vì đầu file) để khi seed-jobs.ts được import chỉ để test các hàm thuần
  // (splitList, computeAccessibilityScore...), Node không bị bắt phải resolve module Supabase.
  const { getSupabaseAdmin } = await import('../src/utils/supabase.js');
  const { EmbeddingService } = await import('../src/services/embedding.service.js');

  const supabase = getSupabaseAdmin(); // throw rõ ràng nếu thiếu SUPABASE_URL/SERVICE_KEY, đúng ý — seed không có ý nghĩa nếu không có DB thật
  const embeddingService = new EmbeddingService();

  const seedPath = resolve(__dirname, 'seed-data/jobs-seed.json');
  const rows = JSON.parse(readFileSync(seedPath, 'utf-8')) as SeedRow[];

  console.log(`Đọc được ${rows.length} bản ghi từ ${seedPath}`);

  let inserted = 0;
  let failed = 0;

  for (const [index, row] of rows.entries()) {
    const embeddingText = buildEmbeddingText(row);
    const embedding = await embeddingService.embed(embeddingText);

    if (!embedding) {
      console.warn(`[${index + 1}/${rows.length}] Bỏ qua "${row.role}" — không tạo được embedding (kiểm tra OPENAI_API_KEY/EMBEDDING_MODEL)`);
      failed += 1;
      continue;
    }

    const jobRow = {
      title: row.role,
      company: row.industry, // dữ liệu gốc là danh sách ngành nghề tham khảo, không có tên doanh nghiệp cụ thể
      location: row.location,
      type: row.work_type,
      salary_range: row.salary_range,
      description: buildDescription(row),
      requirements: buildRequirements(row),
      benefits: [],
      accessibility_features: buildAccessibilityFeatures(row),
      accessibility_score: computeAccessibilityScore(row),
      source_url: row.source,
      embedding,
    };

    // Upsert theo cặp (title, company) — coi đây là khóa tự nhiên cho dữ liệu seed này,
    // vì bảng jobs không có unique constraint sẵn cho nguồn dữ liệu tham khảo dạng này.
    const { data: existing, error: findError } = await supabase
      .from('jobs')
      .select('id')
      .eq('title', jobRow.title)
      .eq('company', jobRow.company)
      .maybeSingle();

    if (findError) {
      console.error(`[${index + 1}/${rows.length}] Lỗi tìm job "${row.role}":`, findError.message);
      failed += 1;
      continue;
    }

    const { error: writeError } = existing
      ? await supabase.from('jobs').update(jobRow).eq('id', existing.id)
      : await supabase.from('jobs').insert(jobRow);

    if (writeError) {
      console.error(`[${index + 1}/${rows.length}] Lỗi ghi job "${row.role}":`, writeError.message);
      failed += 1;
      continue;
    }

    inserted += 1;
    console.log(`[${index + 1}/${rows.length}] OK — ${existing ? 'cập nhật' : 'thêm mới'}: ${row.role}`);
  }

  console.log(`\nHoàn tất: ${inserted} job ghi thành công, ${failed} job lỗi/bỏ qua.`);
  if (failed > 0) process.exitCode = 1;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  main().catch((err) => {
    console.error('Seed thất bại:', err);
    process.exitCode = 1;
  });
}