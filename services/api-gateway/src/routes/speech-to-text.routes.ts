import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { aiActionLimiter } from '../middleware/rate-limit.middleware.js';
import { logger } from '../utils/logger.js';

const router: Router = Router();
const maxAudioBytes = Number(process.env.SPEECH_TO_TEXT_MAX_AUDIO_BYTES || 10 * 1024 * 1024);
const openaiTranscriptionEndpoint = 'https://api.openai.com/v1/audio/transcriptions';
const whisperModel = process.env.SPEECH_TO_TEXT_MODEL || 'whisper-1';
// Whisper dùng mã ngôn ngữ ISO-639-1 (ví dụ "vi"), khác định dạng "vi-VN" của ElevenLabs.
const speechToTextLanguageCode = process.env.SPEECH_TO_TEXT_LANGUAGE_CODE?.trim();

const parseAudioFormData = async (req: Request) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new AppError('Audio upload must use multipart/form-data', 400);
  }

  const contentLength = Number(req.headers['content-length'] || 0);
  if (contentLength > maxAudioBytes) {
    throw new AppError('Audio upload is too large', 413);
  }

  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else if (value !== undefined) {
      headers.set(key, String(value));
    }
  });

  const request = new globalThis.Request(`http://${req.headers.host || 'localhost'}${req.originalUrl}`, {
    method: req.method,
    headers,
    body: req,
    duplex: 'half',
  } as RequestInit & { duplex: 'half' });

  return request.formData();
};

export const transcribeWithWhisper = async (audio: Blob, fileName: string) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AppError('Speech-to-text service is not configured', 503, {
      code: 'SPEECH_TO_TEXT_NOT_CONFIGURED',
      source: 'openai-whisper',
    });
  }

  const formData = new FormData();
  formData.append('model', whisperModel);
  formData.append('response_format', 'json');
  if (speechToTextLanguageCode) {
    formData.append('language', speechToTextLanguageCode);
  }
  formData.append('file', audio, fileName);

  const response = await fetch(openaiTranscriptionEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    logger.warn('OpenAI Whisper speech-to-text request failed', {
      status: response.status,
      statusText: response.statusText,
      body: body.slice(0, 240),
    });
    throw new AppError('Unable to transcribe speech, please try again', 502, {
      code: 'SPEECH_TO_TEXT_FAILED',
      source: 'openai-whisper',
    });
  }

  const payload = (await response.json()) as { text?: string };
  return payload.text?.trim() || '';
};

router.post(
  '/',
  authMiddleware,
  aiActionLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const formData = await parseAudioFormData(req);
      const audio = formData.get('audio');

      if (!(audio instanceof Blob)) {
        throw new AppError('Audio file is required', 400);
      }

      if (audio.size <= 0) {
        throw new AppError('Audio file is empty', 400);
      }

      if (audio.size > maxAudioBytes) {
        throw new AppError('Audio upload is too large', 413);
      }

      const fileName = (audio as Blob & { name?: string }).name || 'interview-response.webm';
      const text = await transcribeWithWhisper(audio, fileName);
      res.json({ text });
    } catch (error) {
      next(error);
    }
  }
);

export const speechToTextRouter = router;