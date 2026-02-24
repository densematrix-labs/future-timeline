import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn()
  }
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: (props: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => {
      const { children, ...rest } = props
      return React.createElement('div', rest, children)
    },
    span: (props: React.HTMLAttributes<HTMLSpanElement> & { children?: React.ReactNode }) => {
      const { children, ...rest } = props
      return React.createElement('span', rest, children)
    }
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}))

// Mock fingerprint
vi.mock('../lib/fingerprint', () => ({
  getDeviceId: vi.fn().mockResolvedValue('test-device-id')
}))
