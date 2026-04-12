import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, readTable, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-016 Export to Admin Logs', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
    seedTable('sessions', [{ id: 'session-1', user_id: 'player-1' }])
    seedTable('admin_logs', [])
  })

  it('writes export metadata into admin logs and surfaces it in the audit module', async () => {
    const view = renderPortalApp('/export')

    fireEvent.click(await screen.findByRole('button', { name: 'Select All' }))
    fireEvent.click(screen.getByRole('button', { name: 'Export (5 tables)' }))

    await waitFor(() => {
      expect(readTable('admin_logs').some((row) => row.action === 'Exported data')).toBe(true)
    })

    view.unmount()
    renderPortalApp('/admin-logs')

    expect(await screen.findByRole('heading', { name: 'Admin Logs' })).toBeInTheDocument()
    expect(await screen.findByText('Exported data')).toBeInTheDocument()
  })
})
