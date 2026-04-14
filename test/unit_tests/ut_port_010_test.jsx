import React from 'react'
import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import AdminLogs from '../../src/pages/AdminLogs'
import { createQueryBuilder, renderWithRouter, resetSupabaseMocks, supabase } from './test_helpers'

describe('UT-PORT-010 Admin Logs Ordering & Metadata', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('validates newest-first ordering and metadata visibility', async () => {
    const logs = [
      {
        id: 'log-1',
        action: 'Exported data',
        target_kind: 'system',
        target_session_id: null,
        target_user_id: null,
        details: { tables: ['users'], format: 'csv' },
        created_at: '2026-04-08T09:00:00Z',
        actor_user_id: 'admin-1',
        users: { email: 'admin@example.com' },
      },
      {
        id: 'log-2',
        action: 'Deleted player',
        target_kind: 'user',
        target_user_id: 'player-1',
        target_session_id: null,
        details: { username: 'runner1' },
        created_at: '2026-04-09T10:00:00Z',
        actor_user_id: 'admin-1',
        users: { email: 'admin@example.com' },
      },
    ]

    supabase.from.mockImplementation((table) => {
      if (table === 'admin_logs') {
        return createQueryBuilder({ data: logs, error: null })
      }
      return createQueryBuilder({ data: [], error: null })
    })

    renderWithRouter(<AdminLogs />)

    expect(await screen.findByText('Admin Logs')).toBeInTheDocument()
    expect(await screen.findByText('Exported data')).toBeInTheDocument()
    expect(screen.getByText('Deleted player')).toBeInTheDocument()
    expect(screen.getAllByText('admin@example.com').length).toBeGreaterThan(0)

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]

    expect(within(firstDataRow).getByText('Deleted player')).toBeInTheDocument()
    expect(within(firstDataRow).getByText('player-1')).toBeInTheDocument()
    expect(within(firstDataRow).getByText('admin@example.com')).toBeInTheDocument()
    expect(within(firstDataRow).getByText(JSON.stringify({ username: 'runner1' }))).toBeInTheDocument()
  })
})
