import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import AdminLogs, { buildAdminLogText } from '../../src/pages/AdminLogs'
import { createQueryBuilder, renderWithRouter, resetSupabaseMocks, supabase } from './test_helpers'

describe('UT-PORT-009 Admin Logs', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('renders admin log metadata in the table', async () => {
    supabase.from.mockImplementation(() =>
      createQueryBuilder({
        data: [
          {
            id: 1,
            action: 'Deleted player',
            target_kind: 'user',
            target_user_id: 'player-1',
            target_session_id: null,
            details: { username: 'alice' },
            created_at: '2026-04-12T00:00:00Z',
            actor_user_id: 'admin-1',
            users: { email: 'admin@example.com' },
          },
        ],
      })
    )

    renderWithRouter(<AdminLogs />)

    expect(await screen.findByText('Deleted player')).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('player-1')).toBeInTheDocument()
  })

  it('builds TXT export lines with expected metadata structure', () => {
    const text = buildAdminLogText([
      {
        action: 'Deleted player',
        target_user_id: 'player-1',
        target_session_id: null,
        details: { username: 'alice' },
        created_at: '2026-04-12T00:00:00Z',
        actor_user_id: 'admin-1',
        users: { email: 'admin@example.com' },
      },
    ])

    expect(text[0]).toContain('admin@example.com')
    expect(text[0]).toContain('Deleted player')
    expect(text[0]).toContain('player-1')
  })

  it('keeps export action available when logs exist', async () => {
    supabase.from.mockImplementation(() =>
      createQueryBuilder({
        data: [
          {
            id: 1,
            action: 'Deleted player',
            target_kind: 'user',
            target_user_id: 'player-1',
            target_session_id: null,
            details: null,
            created_at: '2026-04-12T00:00:00Z',
            actor_user_id: 'admin-1',
            users: { email: 'admin@example.com' },
          },
        ],
      })
    )

    renderWithRouter(<AdminLogs />)
    expect(await screen.findByText('Deleted player')).toBeInTheDocument()

    const button = screen.getByRole('button', { name: 'Export as TXT' })
    expect(button).toBeEnabled()
    fireEvent.click(button)
  })
})
