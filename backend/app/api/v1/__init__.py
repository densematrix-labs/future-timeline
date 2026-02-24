from fastapi import APIRouter
from .timeline import router as timeline_router
from .tokens import router as tokens_router
from .payment import router as payment_router

api_router = APIRouter()
api_router.include_router(timeline_router, prefix="/timeline", tags=["timeline"])
api_router.include_router(tokens_router, prefix="/tokens", tags=["tokens"])
api_router.include_router(payment_router, prefix="/payment", tags=["payment"])
