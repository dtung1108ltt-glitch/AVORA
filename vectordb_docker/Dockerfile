# Single-container Vector DB package:
#   - Qdrant (vector database engine)
#   - Pre-loaded job embeddings dataset (57 records), MOT model DUY NHAT
#     cho toan he thong:
#     - "avora_jobs" collection: 4096-dim Qwen/Qwen3-Embedding-8B vectors
#       (JD text only - no disability labels, per teacher's spec)
#   - FastAPI wrapper exposing convenience search endpoints
#

FROM qdrant/qdrant:latest

# Qdrant's base image is Debian-based; add Python for the API wrapper.
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
# CPU-only torch keeps the image much smaller than the default CUDA wheels.
RUN pip3 install --no-cache-dir --break-system-packages torch --index-url https://download.pytorch.org/whl/cpu
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

COPY app/ ./app/
COPY data/ ./data/
COPY scripts/ ./scripts/
COPY entrypoint.sh .
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# Download Qwen/Qwen3-Embedding-8B (~16-32GB) AND encode all 57 jobs into
# data/job_embeddings_qwen3.json — baked into the image at build time so
# no internet is needed when the container actually runs. This step will
# take substantially longer than before (large download + CPU encode of
# an 8B-parameter model instead of a 118M-parameter one).
RUN python3 scripts/build_index.py

# 6333/6334 = Qdrant REST/gRPC, 8000 = FastAPI wrapper
EXPOSE 6333 6334 8000

ENTRYPOINT ["./entrypoint.sh"]
