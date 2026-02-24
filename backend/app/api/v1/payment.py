from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import httpx
import hmac
import hashlib
import json
from datetime import datetime, timedelta
from app.models.database import get_db
from app.models.payment_model import PaymentTransaction
from app.services.token_service import TokenService
from app.core.config import settings
from app.metrics import payment_success, payment_revenue_cents

router = APIRouter()

# Product SKU to tokens mapping
PRODUCT_TOKENS = {
    "starter": 30,
    "pro": 100,
    "unlimited": 0  # subscription
}

class CheckoutRequest(BaseModel):
    product_sku: str
    success_url: str
    cancel_url: Optional[str] = None

class CheckoutResponse(BaseModel):
    checkout_url: str

@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(
    request: CheckoutRequest,
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Create a Creem checkout session."""
    
    product_ids = json.loads(settings.CREEM_PRODUCT_IDS)
    product_id = product_ids.get(request.product_sku)
    
    if not product_id:
        raise HTTPException(status_code=400, detail="Invalid product SKU")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.creem.io/v1/checkouts",
            headers={
                "Authorization": f"Bearer {settings.CREEM_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "product_id": product_id,
                "success_url": request.success_url,
                "cancel_url": request.cancel_url,
                "metadata": {
                    "device_id": x_device_id,
                    "product_sku": request.product_sku
                }
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to create checkout")
        
        data = response.json()
        
        # Record pending transaction
        tx = PaymentTransaction(
            checkout_id=data["id"],
            device_id=x_device_id,
            product_id=product_id,
            product_sku=request.product_sku,
            amount_cents=0,  # Will be updated on webhook
            status="pending"
        )
        db.add(tx)
        await db.commit()
        
        return CheckoutResponse(checkout_url=data["checkout_url"])

@router.post("/webhook")
async def handle_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Handle Creem webhook events."""
    
    body = await request.body()
    signature = request.headers.get("X-Creem-Signature", "")
    
    # Verify signature
    expected_sig = hmac.new(
        settings.CREEM_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_sig):
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    data = json.loads(body)
    event_type = data.get("type")
    
    if event_type == "checkout.completed":
        checkout = data["data"]
        checkout_id = checkout["id"]
        
        # Find and update transaction
        from sqlalchemy import select
        result = await db.execute(
            select(PaymentTransaction).where(PaymentTransaction.checkout_id == checkout_id)
        )
        tx = result.scalar_one_or_none()
        
        if tx:
            tx.status = "completed"
            tx.amount_cents = checkout.get("amount_total", 0)
            tx.completed_at = datetime.utcnow()
            await db.commit()
            
            # Add tokens
            token_service = TokenService(db)
            tokens = PRODUCT_TOKENS.get(tx.product_sku, 0)
            
            if tx.product_sku == "unlimited":
                # Subscription: set 30-day access
                await token_service.set_subscription(
                    tx.device_id,
                    datetime.utcnow() + timedelta(days=30)
                )
            else:
                await token_service.add_tokens(tx.device_id, tokens)
            
            # Track metrics
            payment_success.labels(tool="future-timeline", product_sku=tx.product_sku).inc()
            payment_revenue_cents.labels(tool="future-timeline").inc(tx.amount_cents)
    
    return {"status": "ok"}

@router.get("/success")
async def payment_success_page(
    checkout_id: str,
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Get payment success info."""
    from sqlalchemy import select
    
    result = await db.execute(
        select(PaymentTransaction).where(PaymentTransaction.checkout_id == checkout_id)
    )
    tx = result.scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    token_service = TokenService(db)
    token_info = await token_service.get_token_info(x_device_id)
    
    return {
        "status": tx.status,
        "product_sku": tx.product_sku,
        "tokens": token_info
    }
