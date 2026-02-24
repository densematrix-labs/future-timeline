import pytest
from unittest.mock import patch, AsyncMock, MagicMock
import hmac
import hashlib
import json

@pytest.mark.asyncio
async def test_checkout_invalid_sku(client, device_id):
    """Invalid SKU should return 400."""
    response = await client.post(
        "/api/v1/payment/checkout",
        headers={"X-Device-Id": device_id},
        json={
            "product_sku": "invalid-sku",
            "success_url": "https://example.com/success"
        }
    )
    assert response.status_code == 400

@pytest.mark.asyncio
async def test_payment_success_not_found(client, device_id):
    """Non-existent checkout should return 404."""
    response = await client.get(
        "/api/v1/payment/success?checkout_id=nonexistent",
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 404
    
    data = response.json()
    assert isinstance(data["detail"], str)

@pytest.mark.asyncio
async def test_webhook_invalid_signature(client):
    """Webhook with invalid signature should return 400."""
    response = await client.post(
        "/api/v1/payment/webhook",
        headers={
            "X-Creem-Signature": "invalid-signature",
            "Content-Type": "application/json"
        },
        content=b'{"type": "checkout.completed"}'
    )
    assert response.status_code == 400
