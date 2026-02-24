import pytest
from datetime import datetime, timedelta
from app.services.token_service import TokenService

@pytest.mark.asyncio
async def test_get_or_create_token_new(db):
    """Create new token for new device."""
    service = TokenService(db)
    token = await service.get_or_create_token("new-device")
    
    assert token.device_id == "new-device"
    assert token.tokens_total == 3
    assert token.tokens_used == 0

@pytest.mark.asyncio
async def test_get_or_create_token_existing(db):
    """Get existing token for known device."""
    service = TokenService(db)
    
    # Create
    token1 = await service.get_or_create_token("device-x")
    
    # Get again
    token2 = await service.get_or_create_token("device-x")
    
    assert token1.id == token2.id

@pytest.mark.asyncio
async def test_use_generation(db):
    """Use a generation token."""
    service = TokenService(db)
    
    # Use one token
    result = await service.use_generation("device-y")
    assert result is True
    
    # Check remaining
    info = await service.get_token_info("device-y")
    assert info["tokens_remaining"] == 2
    assert info["tokens_used"] == 1

@pytest.mark.asyncio
async def test_use_generation_exhausted(db):
    """Cannot use when tokens exhausted."""
    service = TokenService(db)
    device = "exhausted-device"
    
    # Use all 3 tokens
    for _ in range(3):
        await service.use_generation(device)
    
    # Fourth should fail
    result = await service.use_generation(device)
    assert result is False

@pytest.mark.asyncio
async def test_add_tokens(db):
    """Add tokens to device."""
    service = TokenService(db)
    device = "add-tokens-device"
    
    # Initial: 3 tokens
    await service.get_or_create_token(device)
    
    # Add 30 tokens
    await service.add_tokens(device, 30)
    
    info = await service.get_token_info(device)
    assert info["tokens_total"] == 33  # 3 + 30

@pytest.mark.asyncio
async def test_subscription(db):
    """Subscription gives unlimited tokens."""
    service = TokenService(db)
    device = "sub-device"
    
    # Set subscription
    expires = datetime.utcnow() + timedelta(days=30)
    await service.set_subscription(device, expires)
    
    info = await service.get_token_info(device)
    assert info["is_subscription"] is True
    assert info["tokens_remaining"] == 999999
    
    # Use should not decrement
    await service.use_generation(device)
    info = await service.get_token_info(device)
    assert info["tokens_remaining"] == 999999
