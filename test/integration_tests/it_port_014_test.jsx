import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-014 Settings security flows', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
  })

  it('renders all linked security forms and blocks mismatched email updates', async () => {
    renderPortalApp('/settings')

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByText('Change Email')).toBeInTheDocument()
    expect(screen.getByText('Change Password')).toBeInTheDocument()
    expect(screen.getByText('Danger Zone')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Current Password', { selector: '#emailCurrentPw' }), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('New Email'), {
      target: { value: 'new@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Confirm New Email'), {
      target: { value: 'other@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update Email' }))

    expect(await screen.findByText('Emails do not match.')).toBeInTheDocument()
  })

  it('handles password success and delete-account logout flow', async () => {
    renderPortalApp('/settings')
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Current Password', { selector: '#pwCurrentPw' }), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))

    expect(await screen.findByText('Password updated successfully.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Current Password', { selector: '#deletePassword' }), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }))

    expect(await screen.findByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
  })
})
