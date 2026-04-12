import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import Players from '../../src/pages/Players'
import { createQueryBuilder, renderWithRouter, resetSupabaseMocks, supabase } from './test_helpers'

describe('UT-PORT-005 Players', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('filters players by username or email', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return createQueryBuilder({
          data: [
            { id: '1', username: 'alice', email: 'alice@example.com', is_email_verified: true, created_at: '2026-04-12T00:00:00Z' },
            { id: '2', username: 'bruno', email: 'bruno@example.com', is_email_verified: false, created_at: '2026-04-11T00:00:00Z' },
          ],
        })
      }
      return createQueryBuilder({ data: [] })
    })

    renderWithRouter(<Players />)
    expect(await screen.findByText('alice')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Search by username or email...'), {
      target: { value: 'bruno' },
    })

    expect(screen.queryByText('alice')).not.toBeInTheDocument()
    expect(screen.getByText('bruno')).toBeInTheDocument()
  })

  it('opens the reset password modal from row actions', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'users') {
        return createQueryBuilder({
          data: [
            { id: '1', username: 'alice', email: 'alice@example.com', is_email_verified: true, created_at: '2026-04-12T00:00:00Z' },
          ],
        })
      }
      return createQueryBuilder({ data: [] })
    })

    renderWithRouter(<Players />)
    expect(await screen.findByText('alice')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset PW' }))
    await waitFor(() => {
      expect(screen.getByText('Force Password Reset')).toBeInTheDocument()
    })
  })
})
