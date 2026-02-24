from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional, Dict
from app.models.token_model import GenerationToken
from app.core.config import settings

class TokenService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_or_create_token(self, device_id: str) -> GenerationToken:
        """Get existing token record or create new one with free tier."""
        result = await self.db.execute(
            select(GenerationToken).where(GenerationToken.device_id == device_id)
        )
        token = result.scalar_one_or_none()
        
        if not token:
            token = GenerationToken(
                device_id=device_id,
                tokens_total=settings.FREE_GENERATIONS_PER_DEVICE,
                tokens_used=0
            )
            self.db.add(token)
            await self.db.commit()
            await self.db.refresh(token)
        
        return token
    
    async def get_token_info(self, device_id: str) -> Dict:
        """Get token info for device."""
        token = await self.get_or_create_token(device_id)
        return {
            "tokens_remaining": token.tokens_remaining,
            "tokens_total": token.tokens_total,
            "tokens_used": token.tokens_used,
            "is_subscription": token.is_subscription,
            "subscription_expires_at": token.subscription_expires_at.isoformat() if token.subscription_expires_at else None
        }
    
    async def use_generation(self, device_id: str) -> bool:
        """Consume one generation token. Returns True if successful."""
        token = await self.get_or_create_token(device_id)
        
        if token.use_token():
            await self.db.commit()
            return True
        return False
    
    async def add_tokens(self, device_id: str, amount: int) -> GenerationToken:
        """Add tokens to device (after purchase)."""
        token = await self.get_or_create_token(device_id)
        token.tokens_total += amount
        await self.db.commit()
        await self.db.refresh(token)
        return token
    
    async def set_subscription(
        self, 
        device_id: str, 
        expires_at: datetime
    ) -> GenerationToken:
        """Set unlimited subscription for device."""
        token = await self.get_or_create_token(device_id)
        token.is_subscription = True
        token.subscription_expires_at = expires_at
        await self.db.commit()
        await self.db.refresh(token)
        return token
