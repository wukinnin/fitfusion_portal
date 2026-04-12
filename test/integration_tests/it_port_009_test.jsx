import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-009 Login to Dashboard', () => {
  beforeEach(() => {
    resetIntegrationState()
    seedTable('users', [
      { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      { id: 'player-1', role: 'player', email: 'player@example.com' },
      { id: 'player-2', role: 'player', email: 'player2@example.com' },
    ])
    seedTable('sessions', [{ id: 'session-1' }, { id: 'session-2' }])
  })

  it('routes a verified admin from login into the protected dashboard', async () => {
    renderPortalApp('/login')

    expect(await screen.findByRole('heading', { name: 'Sign In' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(screen.getAllByText('admin@example.com').length).toBeGreaterThan(0)

    await waitFor(() => {
      expect(screen.getByText('Total Players')).toBeInTheDocument()
      expect(screen.getByText('Total Sessions')).toBeInTheDocument()
      expect(screen.getByText('Admin Users')).toBeInTheDocument()
      expect(screen.getAllByText('2')).toHaveLength(2)
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })
})
