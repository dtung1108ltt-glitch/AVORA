import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the single, monorepo-root .env (matches the root .env.example),
// regardless of the current working directory the process was started from.
// This file must be the FIRST import in src/index.ts: ES module imports are
// evaluated before any other top-level code, so any module that reads
// process.env at import time (e.g. routes/users.routes.ts) needs the .env
// file to already be loaded by the time it is imported.
const envPath = resolve(__dirname, '../../../.env');
console.log('[DEBUG] Loading .env from:', envPath);
config({ path: envPath });
