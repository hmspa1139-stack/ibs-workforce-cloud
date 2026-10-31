import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.init_db import init_database
from app.api.v1.router import api_v1_router

# Configure Structured Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ibs.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing IBS AI Workforce database and 30-agent registry...")
    try:
        await init_database()
        logger.info("Database and agents registry ready.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
    yield
    logger.info("Shutting down IBS AI Workforce API service.")

app = FastAPI(
    title="IBS AI WORKFORCE — Enterprise Core API",
    description="Digital agency operating system powered by 30 specialized AI agents under one central AI CEO. IBS Digital.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
origins = [
    settings.APP_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_v1_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception at {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error occurred. Please contact system administrator."}
    )

@app.get("/")
async def root():
    return {
        "product": "IBS AI Workforce",
        "company": "IBS Digital",
        "tagline": "One Company. Thirty AI Specialists. Unlimited Possibilities.",
        "api_docs": "/docs",
        "version": "1.0.0"
    }
