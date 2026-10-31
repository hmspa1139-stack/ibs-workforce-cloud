import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in res.fetchall()]
        print(f"Created Tables ({len(tables)}): {', '.join(sorted(tables))}")
        
        agents_cnt = (await conn.execute(text("SELECT count(*) FROM agent_profiles;"))).scalar()
        depts_cnt = (await conn.execute(text("SELECT count(*) FROM departments;"))).scalar()
        integ_cnt = (await conn.execute(text("SELECT count(*) FROM integrations;"))).scalar()
        print(f"Verified Records -> Departments: {depts_cnt}, Agents: {agents_cnt}, Integrations: {integ_cnt}")

if __name__ == "__main__":
    asyncio.run(check())
