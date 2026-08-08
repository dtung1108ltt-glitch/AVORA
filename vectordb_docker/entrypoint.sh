#!/bin/bash
set -e

echo "[entrypoint] Starting Qdrant..."
(cd /qdrant && ./qdrant) &
QDRANT_PID=$!

echo "[entrypoint] Waiting for Qdrant to become ready..."
until curl -sf http://localhost:6333/readyz > /dev/null 2>&1; do
  sleep 1
done
echo "[entrypoint] Qdrant is ready."

echo "[entrypoint] Starting API wrapper (will ingest data on startup)..."
cd /app
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
API_PID=$!

# If either process dies, stop the container so orchestration can restart it.
wait -n "$QDRANT_PID" "$API_PID"
