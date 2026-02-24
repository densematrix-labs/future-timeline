from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from .database import Base

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    checkout_id = Column(String(255), unique=True, index=True)
    device_id = Column(String(255), index=True)
    product_id = Column(String(255))
    product_sku = Column(String(100))
    amount_cents = Column(Integer)
    currency = Column(String(10), default="USD")
    status = Column(String(50), default="pending")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
