"""
Demo: chay thu nhieu truy van thuc te de kiem chung luong tim kiem end-to-end
(khong chi luu tru tho) - dung cho bao cao / trinh bay nhom.

Cach chay (container jobs-vector-db dang chay, expose port 8000):
    python demo_query_test.py

Neu chay ben ngoai container va goi thang vao Qdrant (port 6333) thay vi
qua API 8000, xem ham `search_via_qdrant_direct()` o cuoi file - dung
"reference/query_qdrant.py" lam vi du.
"""
import json
import urllib.request

API_URL = "http://localhost:8000/search/text"

# Bo cau hoi demo - moi cau mo phong mot tinh huong tim viec thuc te,
# cham dung cach dien dat khac nhau de kiem tra kha nang hieu ngu nghia
# (khong chi khop tu khoa) cua mo hinh embedding.
TEST_QUERIES = [
    {
        "label": "Tim theo tu khoa nganh nghe",
        "query": "lập trình viên phát triển phần mềm",
        "top_k": 3,
    },
    {
        "label": "Tim theo mo ta hoan canh, khong dung tu khoa nganh nghe",
        "query": "công việc có thể làm tại nhà, không cần di chuyển nhiều, phù hợp người khó đi lại",
        "top_k": 3,
    },
    {
        "label": "Tim ket hop loc chinh xac theo nhom khuyet tat",
        "query": "chăm sóc khách hàng, giao tiếp qua điện thoại hoặc chat",
        "top_k": 3,
        "nhom_khuyet_tat": "Khuyết tật vận động",
    },
    {
        "label": "Cau hoi dien dat tu nhien nhu nguoi dung that",
        "query": "em bị khó khăn khi di chuyển, muốn tìm việc văn phòng nhẹ nhàng, lương ổn định",
        "top_k": 3,
    },
]


def run_query(payload: dict):
    # API hien chi con dung 1 model duy nhat (Qwen3-Embedding-8B), khong con
    # tham so "method" nua - khong can setdefault gi them o day.
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        API_URL, data=data, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def print_results(label: str, query: str, results: list):
    print("=" * 70)
    print(f"[{label}]")
    print(f"Query: \"{query}\"")
    print("-" * 70)
    if not results:
        print("  (khong co ket qua)")
    for rank, r in enumerate(results, start=1):
        print(f"  #{rank}  score={r['score']:.4f}  |  {r.get('job_id')}  |  {r.get('nghe')}")
        print(f"        Ngành: {r.get('nganh')}  |  Nhóm KT: {r.get('nhom_khuyet_tat')}  |  Mức độ: {r.get('muc_do_khuyet_tat')}")
    print()


def main():
    print("DEMO: Luong tim kiem thuc te (Query -> Embedding -> Qdrant -> Ket qua)\n")
    for case in TEST_QUERIES:
        label = case.pop("label")
        query = case["query"]
        try:
            results = run_query(dict(case))
            print_results(label, query, results)
        except Exception as e:
            print(f"[LOI] Query '{query}' that bai: {e}\n")

    print("=" * 70)
    print("Hoan tat demo. Tong cong da chay", len(TEST_QUERIES), "truy van.")


# --- Phuong an thay the: goi thang Qdrant, khong qua API 8000 -------------
def search_via_qdrant_direct(query_text: str, top_k: int = 5):
    """Vi du goi thang vao Qdrant (port 6333) bang chinh model embedding,
    tuong duong logic trong reference/query_qdrant.py. Dung khi muon demo
    ma khong phu thuoc vao FastAPI wrapper."""
    from sentence_transformers import SentenceTransformer
    from qdrant_client import QdrantClient

    # Phai dung dung model + quy uoc prompt voi app/main.py (xem
    # QUERY_TASK_INSTRUCTION o do) de vector query tuong thich voi index.
    model = SentenceTransformer("Qwen/Qwen3-Embedding-8B")
    task = (
        "Given a Vietnamese job-search query, retrieve job descriptions "
        "suitable for people with disabilities that match the query"
    )
    instructed = f"Instruct: {task}\nQuery:{query_text}"
    query_vector = model.encode(instructed, normalize_embeddings=True).tolist()

    client = QdrantClient(url="http://localhost:6333")
    result = client.query_points(collection_name="avora_jobs", query=query_vector, limit=top_k)
    return [{"score": h.score, **h.payload} for h in result.points]


if __name__ == "__main__":
    main()
