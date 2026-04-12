import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, readTable, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-017 Management actions to Admin Logs', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [
      { id: 'admin-1', role: 'admin', email: 'admin@example.com' },
      { id: 'player-1', role: 'player', username: 'alice', email: 'alice@example.com', is_email_verified: true, created_at: '2026-04-12T00:00:00Z' },
      { id: 'admin-2', role: 'admin', username: 'opsadmin', email: 'ops@example.com', is_email_verified: true, created_at: '2026-04-11T00:00:00Z' },
    ])
    seedTable('v_admin_users', [
      { id: 'admin-1', email: 'admin@example.com', username: 'chiefadmin', is_email_verified: true, created_at: '2026-04-12T00:00:00Z' },
      { id: 'admin-2', email: 'ops@example.com', username: 'opsadmin', is_email_verified: true, created_at: '2026-04-11T00:00:00Z' },
    ])
    seedTable('admin_logs', [])
  })

  it('captures player and admin management actions in the audit trail', async () => {
    const view = renderPortalApp('/players')

    expect(await screen.findByText('alice@example.com')).toBeInTheDocument()
    fireEvent.click((await screen.findAllByRole('button', { name: 'Delete' }))[0])
    fireEvent.click(screen.getByRole('button', { name: 'Delete Player' }))

    await waitFor(() => {
      expect(readTable('admin_logs').some((row) => row.action === 'Deleted player')).toBe(true)
    })

    fireEvent.click(screen.getByRole('link', { name: 'Admins' }))
    expect(await screen.findByRole('heading', { name: 'Admins' })).toBeInTheDocument()
    expect(await screen.findByText('ops@example.com')).toBeInTheDocument()
    fireEvent.click((await screen.findAllByRole('button', { name: 'Delete' }))[1])
    fireEvent.click(screen.getByRole('button', { name: 'Delete Admin' }))

    await waitFor(() => {
      expect(readTable('admin_logs').some((row) => row.action === 'Deleted admin')).toBe(true)
    })

    view.unmount()
    renderPortalApp('/admin-logs')

    expect(await screen.findByRole('heading', { name: 'Admin Logs' })).toBeInTheDocument()
    expect(await screen.findByText('Deleted player')).toBeInTheDocument()
    expect(screen.getByText('Deleted admin')).toBeInTheDocument()
  })
})
