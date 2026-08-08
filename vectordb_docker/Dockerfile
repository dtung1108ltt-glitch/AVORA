# Single-container Vector DB package:
#   - Qdrant (vector database engine)
#   - Pre-loaded job embeddings dataset (57 records, 133-dim vectors)
#   - FastAPI wrapper exposing convenience search endpoints
FROM qdrant/qdrant:latest

# Qdrant's base image is Debian-based; add Python for the API wrapper.
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 \
        python3-pip \
        curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

COPY app/ ./app/
COPY data/ ./data/
COPY entrypoint.sh .
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

# 6333/6334 = Qdrant REST/gRPC, 8000 = FastAPI wrapper
EXPOSE 6333 6334 8000

ENTRYPOINT ["./entrypoint.sh"]
