from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.database import get_db
from app.services.llm_service import generate_timeline
from app.services.token_service import TokenService
from app.metrics import timeline_requests, tokens_consumed, free_trial_used

router = APIRouter()

class TimelineRequest(BaseModel):
    subject: str = Field(..., min_length=1, max_length=500)
    years: int = Field(default=10, ge=5, le=100)
    num_events: int = Field(default=8, ge=5, le=15)

class TimelineEvent(BaseModel):
    year: int
    title: str
    description: str
    impact: str
    category: str

class TimelineResponse(BaseModel):
    timeline: List[TimelineEvent]
    summary: str
    subject: str
    years: int

@router.post("/generate", response_model=TimelineResponse)
async def generate_timeline_endpoint(
    request: TimelineRequest,
    x_device_id: str = Header(..., alias="X-Device-Id"),
    db: AsyncSession = Depends(get_db)
):
    """Generate a future timeline for the given subject."""
    
    timeline_requests.labels(tool="future-timeline").inc()
    
    # Check and consume token
    token_service = TokenService(db)
    token_info = await token_service.get_token_info(x_device_id)
    
    if token_info["tokens_remaining"] <= 0:
        raise HTTPException(
            status_code=402,
            detail="No tokens remaining. Please purchase more to continue."
        )
    
    # Track if this is a free trial use
    if not token_info["is_subscription"] and token_info["tokens_used"] < 3:
        free_trial_used.labels(tool="future-timeline").inc()
    
    # Generate timeline
    try:
        result = await generate_timeline(
            subject=request.subject,
            years=request.years,
            num_events=request.num_events
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate timeline: {str(e)}"
        )
    
    # Consume token only on success
    await token_service.use_generation(x_device_id)
    tokens_consumed.labels(tool="future-timeline").inc()
    
    return TimelineResponse(
        timeline=result["timeline"],
        summary=result["summary"],
        subject=request.subject,
        years=request.years
    )
