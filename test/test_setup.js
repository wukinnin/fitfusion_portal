import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

export const mockNavigate = vi.fn()

export const supabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    admin: {
      generateLink: vi.fn(),
    },
  },
  functions: {
    invoke: vi.fn(),
  },
  from: vi.fn(),
}

globalThis.__portalMockNavigate = mockNavigate
globalThis.__portalSupabase = supabase
globalThis.__portalNavigateMode = 'mock'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () =>
      globalThis.__portalNavigateMode === 'actual'
        ? actual.useNavigate()
        : mockNavigate,
  }
})

vi.mock('../src/lib/supabase.js', () => ({
  supabase,
}))

beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  global.URL.revokeObjectURL = vi.fn()

  const originalCreateElement = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
    const element = originalCreateElement(tagName)
    if (tagName === 'a') {
      element.click = vi.fn()
    }
    return element
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
