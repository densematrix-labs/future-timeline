import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateTimeline, getTokenInfo } from '../lib/api'

describe('API error handling', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('handles string error detail', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: "Something went wrong" })
    })
    
    await expect(generateTimeline('test', 10, 'device-1'))
      .rejects.toThrow("Something went wrong")
  })

  it('handles object error detail with error field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      json: () => Promise.resolve({ 
        detail: { error: "No tokens remaining", code: "payment_required" }
      })
    })
    
    // Should extract the error message, not throw [object Object]
    await expect(generateTimeline('test', 10, 'device-1'))
      .rejects.toThrow("No tokens remaining")
    
    // Verify it doesn't throw [object Object]
    try {
      await generateTimeline('test', 10, 'device-1')
    } catch (e: any) {
      expect(e.message).not.toContain('[object Object]')
      expect(e.message).not.toContain('object Object')
    }
  })

  it('handles object error detail with message field', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ 
        detail: { message: "Invalid input" }
      })
    })
    
    await expect(generateTimeline('test', 10, 'device-1'))
      .rejects.toThrow("Invalid input")
  })

  it('handles successful response', async () => {
    const mockResponse = {
      timeline: [{ year: 2027, title: 'Test', description: 'Test desc', impact: 'high', category: 'technology' }],
      summary: 'Test summary',
      subject: 'AI',
      years: 10
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await generateTimeline('AI', 10, 'device-1')
    expect(result.subject).toBe('AI')
    expect(result.timeline).toHaveLength(1)
  })
})

describe('getTokenInfo', () => {
  it('returns token info on success', async () => {
    const mockTokenInfo = {
      tokens_remaining: 3,
      tokens_total: 3,
      tokens_used: 0,
      is_subscription: false,
      subscription_expires_at: null
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTokenInfo)
    })

    const result = await getTokenInfo('device-1')
    expect(result.tokens_remaining).toBe(3)
  })

  it('throws on error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ detail: "Device not found" })
    })

    await expect(getTokenInfo('device-1'))
      .rejects.toThrow("Device not found")
  })
})
