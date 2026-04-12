import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import Login from '../../src/pages/Login'
import {
  createQueryBuilder,
  mockNavigate,
  renderWithRouter,
  resetSupabaseMocks,
  supabase,
} from './test_helpers'

describe('UT-PORT-001 Login', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('authenticates a verified admin and routes to dashboard', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'admin-1', email_confirmed_at: '2026-04-12' } },
      error: null,
    })
    supabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return createQueryBuilder({
          data: { id: 'admin-1', role: 'admin' },
          error: null,
        })
      }
      return createQueryBuilder({ data: null, error: null })
    })

    renderWithRouter(<Login />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('rejects non-admin accounts', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'user-1', email_confirmed_at: '2026-04-12' } },
      error: null,
    })
    supabase.auth.signOut.mockResolvedValue({ error: null })
    supabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return createQueryBuilder({
          data: null,
          error: { message: 'No admin role' },
        })
      }
      return createQueryBuilder({ data: null, error: null })
    })

    renderWithRouter(<Login />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'player@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Access denied. This account is not an admin.')).toBeInTheDocument()
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('rejects unverified admin accounts', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'admin-1', email_confirmed_at: null } },
      error: null,
    })
    supabase.auth.signOut.mockResolvedValue({ error: null })
    supabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return createQueryBuilder({
          data: { id: 'admin-1', role: 'admin' },
          error: null,
        })
      }
      return createQueryBuilder({ data: null, error: null })
    })

    renderWithRouter(<Login />)

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByText('Your email is not yet verified. Please check your inbox for the invite link.')).toBeInTheDocument()
  })
})
