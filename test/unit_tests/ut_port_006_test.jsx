import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import Admins from '../../src/pages/Admins'
import { createQueryBuilder, renderWithRouter, resetSupabaseMocks, supabase } from './test_helpers'

describe('UT-PORT-006 Admins', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('renders admin listing from the admin view', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'v_admin_users') {
        return createQueryBuilder({
          data: [
            { id: 'admin-1', email: 'admin@example.com', username: 'chiefadmin', is_email_verified: true, created_at: '2026-04-12T00:00:00Z' },
          ],
        })
      }
      return createQueryBuilder({ data: [] })
    })

    renderWithRouter(<Admins />)

    expect(await screen.findByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('chiefadmin')).toBeInTheDocument()
  })

  it('filters the admin list and exposes management actions', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'v_admin_users') {
        return createQueryBuilder({
          data: [
            { id: 'admin-1', email: 'admin@example.com', username: 'chiefadmin', is_email_verified: true, created_at: '2026-04-12T00:00:00Z' },
            { id: 'admin-2', email: 'ops@example.com', username: 'opsadmin', is_email_verified: true, created_at: '2026-04-11T00:00:00Z' },
          ],
        })
      }
      return createQueryBuilder({ data: [] })
    })

    renderWithRouter(<Admins />)
    expect(await screen.findByText('admin@example.com')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Search by email or username...'), {
      target: { value: 'ops' },
    })

    expect(screen.queryByText('admin@example.com')).not.toBeInTheDocument()
    expect(screen.getByText('ops@example.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset PW' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })
})
