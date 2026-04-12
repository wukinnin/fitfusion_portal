import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-011 Dashboard to Admins', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
    seedTable('sessions', [])
    seedTable('v_admin_users', [
      { id: 'admin-1', email: 'admin@example.com', username: 'chiefadmin', is_email_verified: true, created_at: '2026-04-12T00:00:00Z' },
      { id: 'admin-2', email: 'ops@example.com', username: 'opsadmin', is_email_verified: true, created_at: '2026-04-11T00:00:00Z' },
    ])
  })

  it('loads the admins module with rendered accounts and controls', async () => {
    renderPortalApp('/')

    fireEvent.click(await screen.findByRole('link', { name: 'Admins' }))

    expect(await screen.findByRole('heading', { name: 'Admins' })).toBeInTheDocument()
    expect(screen.getAllByText('admin@example.com').length).toBeGreaterThan(0)
    expect(screen.getByText('ops@example.com')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Reset PW' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: 'Delete' }).length).toBeGreaterThan(0)
  })
})
