from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from .database import Base

class GenerationToken(Base):
    __tablename__ = "generation_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String(255), index=True, nullable=False)
    tokens_total = Column(Integer, default=0)
    tokens_used = Column(Integer, default=0)
    is_subscription = Column(Boolean, default=False)
    subscription_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @property
    def tokens_remaining(self) -> int:
        if self.is_subscription:
            if self.subscription_expires_at and self.subscription_expires_at > datetime.utcnow():
                return 999999
            return 0
        return max(0, self.tokens_total - self.tokens_used)
    
    def use_token(self) -> bool:
        if self.tokens_remaining > 0:
            if not self.is_subscription:
                self.tokens_used += 1
            return True
        return False
