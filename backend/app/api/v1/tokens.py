from fastapi import APIRouter, Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.models.database import get_db
from app.services.token_service import TokenService

router = APIRouter()

class TokenInfoResponse(BaseModel):
    tokens_remaining: int
    tokens_total: int
    tokens_used: int
    is_subscription: bool
    subscription_expires_at: Optional[str]

@router.get("/info", response_model=TokenInfoResponse)
async def get_token_info(
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Get token info for device."""
    token_service = TokenService(db)
    return await token_service.get_token_info(x_device_id)
