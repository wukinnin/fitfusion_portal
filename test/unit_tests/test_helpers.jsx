import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { vi } from 'vitest'

export const mockNavigate = globalThis.__portalMockNavigate
export const supabase = globalThis.__portalSupabase

export function setNavigateMode(mode) {
  globalThis.__portalNavigateMode = mode
}

export function createQueryBuilder(result) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    delete: vi.fn(() => builder),
    insert: vi.fn(() => Promise.resolve(result)),
    update: vi.fn(() => builder),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
    catch: (reject) => Promise.resolve(result).catch(reject),
  }
  return builder
}

export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

export function resetSupabaseMocks() {
  setNavigateMode('mock')
  mockNavigate.mockReset()
  supabase.from.mockReset()
  supabase.auth.signInWithPassword.mockReset()
  supabase.auth.signOut.mockReset()
  supabase.auth.resetPasswordForEmail.mockReset()
  supabase.auth.updateUser.mockReset()
  supabase.auth.getUser.mockReset()
  supabase.auth.getSession.mockReset()
  supabase.auth.onAuthStateChange.mockReset()
  supabase.auth.admin.generateLink.mockReset()
  supabase.functions.invoke.mockReset()
}
