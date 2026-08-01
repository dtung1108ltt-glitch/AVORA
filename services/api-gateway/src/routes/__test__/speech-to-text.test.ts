/**
 * Test nhanh cho logic transcribeWithWhisper (services/api-gateway/src/routes/speech-to-text.routes.ts)
 *
 * Mục tiêu: verify luồng xử lý lỗi/thành công MÀ KHÔNG gọi OpenAI thật.
 * Cách làm: mock global.fetch để giả lập các phản hồi khác nhau từ OpenAI.
 *
 * Chạy:
 *   cd services/api-gateway
 *   npx tsx --test src/routes/__tests__/speech-to-text.test.ts
 *
 * Không cần OPENAI_API_KEY thật, không gọi mạng thật.
 */

import { test, after, mock } from 'node:test';
import assert from 'node:assert/strict';

// Set trước khi import module đích, vì module đọc process.env ở top-level.
process.env.SPEECH_TO_TEXT_LANGUAGE_CODE = 'vi';
process.env.SPEECH_TO_TEXT_MODEL = 'whisper-1';

const { transcribeWithWhisper } = await import('../speech-to-text.routes.js');

const originalFetch = globalThis.fetch;
const originalApiKey = process.env.OPENAI_API_KEY;

const fakeAudio = new Blob(['fake-audio-bytes'], { type: 'audio/webm' });

after(() => {
  globalThis.fetch = originalFetch;
  process.env.OPENAI_API_KEY = originalApiKey;
});

test('không có OPENAI_API_KEY -> ném AppError 503 SPEECH_TO_TEXT_NOT_CONFIGURED', async () => {
  delete process.env.OPENAI_API_KEY;

  await assert.rejects(
    () => transcribeWithWhisper(fakeAudio, 'clip.webm'),
    (err: unknown) => {
      const e = err as { statusCode?: number; code?: string; source?: string };
      assert.equal(e.statusCode, 503);
      assert.equal(e.code, 'SPEECH_TO_TEXT_NOT_CONFIGURED');
      assert.equal(e.source, 'openai-whisper');
      return true;
    }
  );
});

test('OpenAI trả lỗi (response.ok = false) -> ném AppError 502 SPEECH_TO_TEXT_FAILED', async () => {
  process.env.OPENAI_API_KEY = 'sk-test-key';

  globalThis.fetch = mock.fn(async () =>
    new Response('{"error":"invalid_request_error"}', { status: 401, statusText: 'Unauthorized' })
  ) as unknown as typeof fetch;

  await assert.rejects(
    () => transcribeWithWhisper(fakeAudio, 'clip.webm'),
    (err: unknown) => {
      const e = err as { statusCode?: number; code?: string };
      assert.equal(e.statusCode, 502);
      assert.equal(e.code, 'SPEECH_TO_TEXT_FAILED');
      return true;
    }
  );
});

test('OpenAI trả kết quả thành công -> trả về text đã trim, gọi đúng endpoint và field', async () => {
  process.env.OPENAI_API_KEY = 'sk-test-key';

  let capturedUrl: string | undefined;
  let capturedAuthHeader: string | null = null;
  let capturedFormData: FormData | undefined;

  globalThis.fetch = mock.fn(async (url: string, init: RequestInit) => {
    capturedUrl = url;
    capturedAuthHeader = (init.headers as Headers as unknown as Record<string, string>)['Authorization'] ??
      (init.headers as Headers)?.get?.('Authorization') ?? null;
    capturedFormData = init.body as FormData;
    return new Response(JSON.stringify({ text: '  xin chào, tôi muốn tìm việc  ' }), { status: 200 });
  }) as unknown as typeof fetch;

  const result = await transcribeWithWhisper(fakeAudio, 'clip.webm');

  assert.equal(result, 'xin chào, tôi muốn tìm việc');
  assert.equal(capturedUrl, 'https://api.openai.com/v1/audio/transcriptions');
  assert.equal(capturedAuthHeader, 'Bearer sk-test-key');
  assert.equal(capturedFormData?.get('model'), 'whisper-1');
  assert.equal(capturedFormData?.get('language'), 'vi');
  assert.equal(capturedFormData?.get('response_format'), 'json');
});

test('OpenAI trả thành công nhưng không có field text -> trả về chuỗi rỗng', async () => {
  process.env.OPENAI_API_KEY = 'sk-test-key';

  globalThis.fetch = mock.fn(async () =>
    new Response(JSON.stringify({}), { status: 200 })
  ) as unknown as typeof fetch;

  const result = await transcribeWithWhisper(fakeAudio, 'clip.webm');
  assert.equal(result, '');
});