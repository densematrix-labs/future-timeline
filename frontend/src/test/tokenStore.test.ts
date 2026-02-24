import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTokenStore } from '../lib/tokenStore'
import * as api from '../lib/api'

vi.mock('../lib/api')
vi.mock('../lib/fingerprint', () => ({
  getDeviceId: vi.fn().mockResolvedValue('test-device')
}))

describe('tokenStore', () => {
  beforeEach(() => {
    useTokenStore.setState({
      tokensRemaining: 3,
      tokensTotal: 3,
      isSubscription: false,
      isLoading: false,
      error: null
    })
  })

  it('has default state', () => {
    const state = useTokenStore.getState()
    expect(state.tokensRemaining).toBe(3)
    expect(state.tokensTotal).toBe(3)
    expect(state.isSubscription).toBe(false)
  })

  it('decrements token', () => {
    const { decrementToken } = useTokenStore.getState()
    decrementToken()
    
    const state = useTokenStore.getState()
    expect(state.tokensRemaining).toBe(2)
  })

  it('does not go below 0', () => {
    useTokenStore.setState({ tokensRemaining: 0 })
    
    const { decrementToken } = useTokenStore.getState()
    decrementToken()
    
    const state = useTokenStore.getState()
    expect(state.tokensRemaining).toBe(0)
  })

  it('fetches tokens successfully', async () => {
    vi.mocked(api.getTokenInfo).mockResolvedValue({
      tokens_remaining: 10,
      tokens_total: 30,
      tokens_used: 20,
      is_subscription: false,
      subscription_expires_at: null
    })

    const { fetchTokens } = useTokenStore.getState()
    await fetchTokens()

    const state = useTokenStore.getState()
    expect(state.tokensRemaining).toBe(10)
    expect(state.tokensTotal).toBe(30)
    expect(state.isLoading).toBe(false)
  })

  it('handles fetch error', async () => {
    vi.mocked(api.getTokenInfo).mockRejectedValue(new Error('Network error'))

    const { fetchTokens } = useTokenStore.getState()
    await fetchTokens()

    const state = useTokenStore.getState()
    expect(state.error).toBe('Network error')
    expect(state.isLoading).toBe(false)
  })
})
