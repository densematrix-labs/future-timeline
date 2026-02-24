import pytest
from unittest.mock import patch, AsyncMock

MOCK_TIMELINE_RESPONSE = {
    "timeline": [
        {
            "year": 2027,
            "title": "AI Breakthrough",
            "description": "Major advancement in AI capabilities.",
            "impact": "high",
            "category": "technology"
        },
        {
            "year": 2028,
            "title": "Mass Adoption",
            "description": "Widespread adoption begins.",
            "impact": "medium",
            "category": "business"
        }
    ],
    "summary": "The future looks bright with continuous advancement."
}

@pytest.mark.asyncio
async def test_generate_timeline_success(client, device_id):
    """Timeline generation with valid input."""
    with patch("app.api.v1.timeline.generate_timeline", new_callable=AsyncMock) as mock:
        mock.return_value = MOCK_TIMELINE_RESPONSE
        
        response = await client.post(
            "/api/v1/timeline/generate",
            headers={"X-Device-Id": device_id},
            json={
                "subject": "Artificial Intelligence",
                "years": 10,
                "num_events": 5
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "timeline" in data
        assert "summary" in data
        assert data["subject"] == "Artificial Intelligence"

@pytest.mark.asyncio
async def test_generate_timeline_consumes_token(client, device_id):
    """Generation should consume one token."""
    with patch("app.api.v1.timeline.generate_timeline", new_callable=AsyncMock) as mock:
        mock.return_value = MOCK_TIMELINE_RESPONSE
        
        # Check initial tokens
        token_resp = await client.get(
            "/api/v1/tokens/info",
            headers={"X-Device-Id": device_id}
        )
        initial_remaining = token_resp.json()["tokens_remaining"]
        
        # Generate timeline
        await client.post(
            "/api/v1/timeline/generate",
            headers={"X-Device-Id": device_id},
            json={"subject": "Test", "years": 5, "num_events": 5}
        )
        
        # Check tokens after
        token_resp = await client.get(
            "/api/v1/tokens/info",
            headers={"X-Device-Id": device_id}
        )
        assert token_resp.json()["tokens_remaining"] == initial_remaining - 1

@pytest.mark.asyncio
async def test_generate_timeline_no_tokens(client, device_id):
    """Should return 402 when no tokens left."""
    with patch("app.api.v1.timeline.generate_timeline", new_callable=AsyncMock) as mock:
        mock.return_value = MOCK_TIMELINE_RESPONSE
        
        # Exhaust all 3 free tokens
        for _ in range(3):
            await client.post(
                "/api/v1/timeline/generate",
                headers={"X-Device-Id": device_id},
                json={"subject": "Test", "years": 5, "num_events": 5}
            )
        
        # Fourth request should fail
        response = await client.post(
            "/api/v1/timeline/generate",
            headers={"X-Device-Id": device_id},
            json={"subject": "Test", "years": 5, "num_events": 5}
        )
        
        assert response.status_code == 402
        data = response.json()
        assert "detail" in data
        # Verify detail is a string, not an object
        assert isinstance(data["detail"], str)

@pytest.mark.asyncio
async def test_generate_timeline_validation(client, device_id):
    """Invalid input should return 422."""
    response = await client.post(
        "/api/v1/timeline/generate",
        headers={"X-Device-Id": device_id},
        json={
            "subject": "",  # Empty subject
            "years": 10
        }
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_generate_timeline_years_validation(client, device_id):
    """Years out of range should return 422."""
    response = await client.post(
        "/api/v1/timeline/generate",
        headers={"X-Device-Id": device_id},
        json={
            "subject": "AI",
            "years": 1  # Too low (minimum is 5)
        }
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_error_detail_is_string(client, device_id):
    """Verify all error responses have string detail."""
    # Test 402 error
    with patch("app.api.v1.timeline.generate_timeline", new_callable=AsyncMock) as mock:
        mock.return_value = MOCK_TIMELINE_RESPONSE
        
        # Exhaust tokens
        for _ in range(3):
            await client.post(
                "/api/v1/timeline/generate",
                headers={"X-Device-Id": device_id},
                json={"subject": "Test", "years": 5, "num_events": 5}
            )
        
        response = await client.post(
            "/api/v1/timeline/generate",
            headers={"X-Device-Id": device_id},
            json={"subject": "Test", "years": 5, "num_events": 5}
        )
        
        data = response.json()
        detail = data.get("detail")
        
        # Must be string or have error/message field if object
        if isinstance(detail, dict):
            assert "error" in detail or "message" in detail, \
                f"Object detail must have 'error' or 'message': {detail}"
        else:
            assert isinstance(detail, str), f"detail must be string: {detail}"
