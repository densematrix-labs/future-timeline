import { create } from 'zustand'
import { getTokenInfo } from './api'
import { getDeviceId } from './fingerprint'

interface TokenState {
  tokensRemaining: number
  tokensTotal: number
  isSubscription: boolean
  isLoading: boolean
  error: string | null
  fetchTokens: () => Promise<void>
  decrementToken: () => void
}

export const useTokenStore = create<TokenState>((set) => ({
  tokensRemaining: 3,
  tokensTotal: 3,
  isSubscription: false,
  isLoading: false,
  error: null,

  fetchTokens: async () => {
    set({ isLoading: true, error: null })
    try {
      const deviceId = await getDeviceId()
      const info = await getTokenInfo(deviceId)
      set({
        tokensRemaining: info.tokens_remaining,
        tokensTotal: info.tokens_total,
        isSubscription: info.is_subscription,
        isLoading: false
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tokens',
        isLoading: false 
      })
    }
  },

  decrementToken: () => {
    set((state) => ({
      tokensRemaining: Math.max(0, state.tokensRemaining - 1)
    }))
  }
}))
