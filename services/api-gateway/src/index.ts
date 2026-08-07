import './env.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../../../.env');

// Now import everything else
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { logger } from './utils/logger.js';

import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { assessmentsRouter } from './routes/assessments.routes.js';
import { jobsRouter } from './routes/jobs.routes.js';
import { roadmapsRouter } from './routes/roadmaps.routes.js';
import { interviewsRouter } from './routes/interviews.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { partnersRouter } from './routes/partners.routes.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

console.log('[DEBUG] SUPABASE_URL after dotenv:', process.env.SUPABASE_URL);
console.log('[DEBUG] RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);

const app = express();
const PORT = process.env.PORT || 4000;

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'AI rate limit exceeded. Please wait before making more AI requests.' },
  keyGenerator: (req) => (req as any).user?.userId || req.ip || 'anonymous',
});
app.use('/api/ai', aiLimiter);

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/assessments', assessmentsRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/roadmaps', roadmapsRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/ai', aiRouter);
app.use('/api', partnersRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
});

export default app;
