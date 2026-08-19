import asyncio

from app.db.postgres import SessionFactory
from app.db.qdrant import ensure_collection
from app.services.sync_service import reindex_all


async def main() -> None:
    await ensure_collection()
    async with SessionFactory() as session:
        count = await reindex_all(session)
    print(f"Reindexed {count} jobs")


if __name__ == "__main__":
    asyncio.run(main())
