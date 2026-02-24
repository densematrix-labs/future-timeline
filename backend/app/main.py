from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
from app.api.v1 import api_router
from app.metrics import metrics_router, http_requests, http_request_duration, crawler_visits
from app.models.database import engine, Base
from app.core.config import settings

BOT_PATTERNS = ["Googlebot", "bingbot", "Baiduspider", "YandexBot", "DuckDuckBot"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request tracking middleware
@app.middleware("http")
async def track_requests(request: Request, call_next):
    start = time.time()
    
    # Track crawler visits
    ua = request.headers.get("user-agent", "")
    for bot in BOT_PATTERNS:
        if bot.lower() in ua.lower():
            crawler_visits.labels(tool=settings.TOOL_NAME, bot=bot).inc()
            break
    
    response = await call_next(request)
    
    # Track request metrics
    duration = time.time() - start
    path = request.url.path
    http_requests.labels(
        tool=settings.TOOL_NAME,
        endpoint=path,
        method=request.method,
        status=response.status_code
    ).inc()
    http_request_duration.labels(
        tool=settings.TOOL_NAME,
        endpoint=path
    ).observe(duration)
    
    return response

# Include routers
app.include_router(api_router, prefix="/api/v1")
app.include_router(metrics_router)

@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.APP_NAME}

@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }
