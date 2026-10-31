from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.agents import router as agents_router
from app.api.v1.departments import router as departments_router
from app.api.v1.projects import router as projects_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.ceo import router as ceo_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.clients import router as clients_router
from app.api.v1.integrations import router as integrations_router
from app.api.v1.files import router as files_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.settings import settings_router, audit_router, system_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(agents_router)
api_v1_router.include_router(departments_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(ceo_router)
api_v1_router.include_router(approvals_router)
api_v1_router.include_router(clients_router)
api_v1_router.include_router(integrations_router)
api_v1_router.include_router(files_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(settings_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(system_router)
