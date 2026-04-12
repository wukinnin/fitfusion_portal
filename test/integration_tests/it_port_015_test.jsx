import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-015 Dashboard to Export Data', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
  })

  it('opens the export module and enables export after dataset selection', async () => {
    renderPortalApp('/')

    fireEvent.click(await screen.findByRole('link', { name: 'Export Data' }))

    expect(await screen.findByRole('heading', { name: 'Export Data' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Select All' }))

    expect(screen.getByRole('button', { name: 'Export (5 tables)' })).toBeEnabled()
    fireEvent.click(screen.getByLabelText('JSON'))
    expect(screen.getByLabelText('JSON')).toBeChecked()
  })
})
