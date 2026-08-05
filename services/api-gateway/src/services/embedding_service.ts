import { logger } from '../utils/logger.js';

// Dùng chung base URL + API key với AIService (OPENAI_BASE_URL trỏ tới OpenRouter),
// chỉ khác model — đúng tinh thần "1 provider, 2 model" của phương án B.
const embeddingBaseUrl = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const embeddingApiKey = process.env.OPENAI_API_KEY || '';
const embeddingModel = process.env.EMBEDDING_MODEL || 'qwen/qwen3-embedding-8b';

/**
 * Tính cosine similarity giữa 2 vector cùng chiều dài.
 * Trả về giá trị trong khoảng [-1, 1], thực tế với embedding luôn dương nên nằm [0, 1].
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

export class EmbeddingService {
  // Cache trong bộ nhớ tiến trình — tránh gọi lại API cho cùng 1 đoạn text nhiều lần
  // (ví dụ: JD của cùng 1 job được embed lại mỗi lần user tìm kiếm).
  private cache = new Map<string, number[]>();

  /**
   * Sinh embedding cho 1 đoạn text. Trả về null nếu chưa cấu hình API key hoặc
   * request thất bại — cố tình KHÔNG throw để phần Vector Search chỉ là nâng cao,
   * không làm sập luồng tìm việc chính khi model tạm thời lỗi.
   */
  async embed(text: string): Promise<number[] | null> {
    const trimmed = text.trim();
    if (!trimmed) return null;

    if (!embeddingApiKey) {
      logger.warn('Embedding service is not configured (missing OPENAI_API_KEY)');
      return null;
    }

    const cacheKey = `${embeddingModel}::${trimmed.slice(0, 500)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${embeddingBaseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${embeddingApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: embeddingModel, input: trimmed }),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        logger.warn('Embedding request failed', {
          status: response.status,
          statusText: response.statusText,
          body: body.slice(0, 240),
        });
        return null;
      }

      const payload = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
      const vector = payload.data?.[0]?.embedding;
      if (!vector || !Array.isArray(vector)) return null;

      this.cache.set(cacheKey, vector);
      return vector;
    } catch (err) {
      logger.warn('Embedding request threw an error', { error: (err as Error)?.message });
      return null;
    }
  }
}