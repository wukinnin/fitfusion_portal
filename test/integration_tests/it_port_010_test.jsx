import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-010 Dashboard to Players', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [
      { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      { id: 'player-1', role: 'player', username: 'alice', email: 'alice@example.com', is_email_verified: true, created_at: '2026-04-12T00:00:00Z' },
      { id: 'player-2', role: 'player', username: 'bob', email: 'bob@example.com', is_email_verified: false, created_at: '2026-04-11T00:00:00Z' },
    ])
    seedTable('sessions', [])
  })

  it('navigates from the dashboard sidebar into the searchable players page', async () => {
    renderPortalApp('/')

    fireEvent.click(await screen.findByRole('link', { name: 'Players' }))

    expect(await screen.findByRole('heading', { name: 'Players' })).toBeInTheDocument()
    expect(await screen.findByText('alice@example.com')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Search by username or email...'), {
      target: { value: 'bob' },
    })

    expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })
})
