const API_BASE = '/api/v1'

interface TimelineEvent {
  year: number
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  category: string
}

interface TimelineResponse {
  timeline: TimelineEvent[]
  summary: string
  subject: string
  years: number
}

interface TokenInfo {
  tokens_remaining: number
  tokens_total: number
  tokens_used: number
  is_subscription: boolean
  subscription_expires_at: string | null
}

interface CheckoutResponse {
  checkout_url: string
}

// Helper to extract error message
function extractErrorMessage(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail
  }
  if (typeof detail === 'object' && detail !== null) {
    const obj = detail as Record<string, unknown>
    if (typeof obj.error === 'string') return obj.error
    if (typeof obj.message === 'string') return obj.message
  }
  return 'Request failed'
}

export async function generateTimeline(
  subject: string,
  years: number,
  deviceId: string
): Promise<TimelineResponse> {
  const response = await fetch(`${API_BASE}/timeline/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId
    },
    body: JSON.stringify({ subject, years, num_events: 8 })
  })

  const data = await response.json()

  if (!response.ok) {
    const errorMessage = extractErrorMessage(data.detail)
    throw new Error(errorMessage)
  }

  return data
}

export async function getTokenInfo(deviceId: string): Promise<TokenInfo> {
  const response = await fetch(`${API_BASE}/tokens/info`, {
    headers: {
      'X-Device-Id': deviceId
    }
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(extractErrorMessage(data.detail))
  }

  return response.json()
}

export async function createCheckout(
  productSku: string,
  deviceId: string,
  successUrl: string
): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE}/payment/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId
    },
    body: JSON.stringify({
      product_sku: productSku,
      success_url: successUrl
    })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(extractErrorMessage(data.detail))
  }

  return data
}

export async function getPaymentSuccess(
  checkoutId: string,
  deviceId: string
) {
  const response = await fetch(`${API_BASE}/payment/success?checkout_id=${checkoutId}`, {
    headers: {
      'X-Device-Id': deviceId
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(extractErrorMessage(data.detail))
  }

  return data
}
