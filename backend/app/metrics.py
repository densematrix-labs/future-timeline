from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter
from fastapi.responses import Response
import os

TOOL_NAME = os.getenv("TOOL_NAME", "future-timeline")

# HTTP metrics
http_requests = Counter(
    "http_requests_total", 
    "HTTP requests", 
    ["tool", "endpoint", "method", "status"]
)

http_request_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["tool", "endpoint"]
)

# Payment metrics
payment_success = Counter(
    "payment_success_total",
    "Successful payments",
    ["tool", "product_sku"]
)

payment_revenue_cents = Counter(
    "payment_revenue_cents_total",
    "Total revenue in cents",
    ["tool"]
)

# Token metrics
tokens_consumed = Counter(
    "tokens_consumed_total",
    "Tokens consumed",
    ["tool"]
)

free_trial_used = Counter(
    "free_trial_used_total",
    "Free trial uses",
    ["tool"]
)

# Core function metrics
timeline_requests = Counter(
    "timeline_requests_total",
    "Timeline generation requests",
    ["tool"]
)

# SEO metrics
page_views = Counter(
    "page_views_total",
    "Page views",
    ["tool", "path"]
)

crawler_visits = Counter(
    "crawler_visits_total",
    "Crawler visits",
    ["tool", "bot"]
)

programmatic_pages = Gauge(
    "programmatic_pages_count",
    "Number of programmatic SEO pages",
    ["tool"]
)

# Metrics endpoint
metrics_router = APIRouter()

@metrics_router.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
