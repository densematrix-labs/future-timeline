import httpx
import json
from typing import List, Dict, Any
from app.core.config import settings

TIMELINE_PROMPT = """You are an expert futurist and trend analyst. Generate a detailed future timeline for the given subject.

Subject: {subject}
Timeframe: {years} years into the future (starting from 2026)

Generate exactly {num_events} milestone events. Each event should be:
- Plausible based on current trends
- Specific with concrete details
- Progressive (building on previous events)

Respond ONLY with valid JSON in this exact format:
{{
  "timeline": [
    {{
      "year": 2027,
      "title": "Event title here",
      "description": "2-3 sentence description of what happens and its significance.",
      "impact": "high" | "medium" | "low",
      "category": "technology" | "business" | "social" | "scientific" | "personal"
    }}
  ],
  "summary": "One paragraph summary of the overall trajectory."
}}

No markdown, no code blocks, just pure JSON."""

async def generate_timeline(
    subject: str,
    years: int = 10,
    num_events: int = 8
) -> Dict[str, Any]:
    """Generate a future timeline using LLM proxy."""
    
    prompt = TIMELINE_PROMPT.format(
        subject=subject,
        years=years,
        num_events=num_events
    )
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.LLM_PROXY_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.LLM_PROXY_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "claude-3-5-sonnet-20241022",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 2000,
                "temperature": 0.8
            }
        )
        response.raise_for_status()
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # Parse JSON response
        try:
            result = json.loads(content)
            return result
        except json.JSONDecodeError:
            # Try to extract JSON from response
            import re
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                return json.loads(json_match.group())
            raise ValueError("Failed to parse timeline response")
