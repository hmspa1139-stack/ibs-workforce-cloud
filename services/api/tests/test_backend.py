import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database.init_db import init_database

@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_database()

@pytest.mark.asyncio
async def test_health_and_root():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/system/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert "IBS AI Workforce" in data["service"]

@pytest.mark.asyncio
async def test_30_agents_registry():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/agents")
        assert res.status_code == 200
        agents = res.json()
        # Exactly 30 registered agents
        assert len(agents) == 30
        
        # Verify specific key agents exist
        agent_ids = [a["agent_id"] for a in agents]
        assert "agent_ceo" in agent_ids
        assert "agent_frontend_developer" in agent_ids
        assert "agent_backend_developer" in agent_ids
        assert "agent_qa_engineer" in agent_ids
        assert "agent_meta_ads" in agent_ids
        assert "agent_client_success" in agent_ids

@pytest.mark.asyncio
async def test_5_departments():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/v1/departments")
        assert res.status_code == 200
        depts = res.json()
        assert len(depts) == 5
        codes = [d["code"] for d in depts]
        assert "executive" in codes
        assert "tech" in codes
        assert "marketing" in codes
        assert "creative" in codes
        assert "sales" in codes

@pytest.mark.asyncio
async def test_owner_setup_and_login():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Check setup status
        res = await client.get("/api/v1/auth/status")
        assert res.status_code == 200
        
        # Setup owner if not initialized
        owner_data = {
            "full_name": "IBS Founder",
            "email": "owner@ibsdigital.com",
            "password": "SecurePassword123!"
        }
        setup_res = await client.post("/api/v1/auth/setup", json=owner_data)
        if setup_res.status_code == 200:
            token_data = setup_res.json()
            assert "access_token" in token_data
            assert token_data["user"]["role"] == "owner"
        
        # Login
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "owner@ibsdigital.com",
            "password": "SecurePassword123!"
        })
        assert login_res.status_code == 200
        data = login_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "owner@ibsdigital.com"

@pytest.mark.asyncio
async def test_ceo_planning_engine():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Authenticate first
        login_res = await client.post("/api/v1/auth/login", json={
            "email": "owner@ibsdigital.com",
            "password": "SecurePassword123!"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Request CEO plan
        chat_req = {
            "message": "Build an e-commerce clothing website with cart, payment integration, SEO and Meta ads",
            "plan_only": False
        }
        res = await client.post("/api/v1/ceo/chat", json=chat_req, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["plan"] is not None
        assert len(data["plan"]["tasks"]) > 0
        assert data["project_id"] is not None
        assert data["execution_started"] is True
