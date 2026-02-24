import pytest

@pytest.mark.asyncio
async def test_get_token_info_new_device(client, device_id):
    """New device gets free tier tokens."""
    response = await client.get(
        "/api/v1/tokens/info",
        headers={"X-Device-Id": device_id}
    )
    assert response.status_code == 200
    data = response.json()
    
    assert data["tokens_remaining"] == 3
    assert data["tokens_total"] == 3
    assert data["tokens_used"] == 0
    assert data["is_subscription"] is False

@pytest.mark.asyncio
async def test_get_token_info_same_device(client, device_id):
    """Same device gets same token record."""
    # First call
    await client.get("/api/v1/tokens/info", headers={"X-Device-Id": device_id})
    
    # Second call
    response = await client.get(
        "/api/v1/tokens/info",
        headers={"X-Device-Id": device_id}
    )
    data = response.json()
    
    # Should still be the same
    assert data["tokens_total"] == 3

@pytest.mark.asyncio
async def test_token_info_requires_device_id(client):
    """Request without device ID should fail."""
    response = await client.get("/api/v1/tokens/info")
    assert response.status_code == 422
