import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import Settings from '../../src/pages/Settings'
import { renderWithRouter, resetSupabaseMocks, supabase } from './test_helpers'

describe('UT-PORT-003 Settings', () => {
  beforeEach(() => {
    resetSupabaseMocks()
    supabase.functions.invoke.mockResolvedValue({ data: {}, error: null })
  })

  it('shows error for mismatched emails', async () => {
    renderWithRouter(<Settings session={{ user: { id: 'admin-1', email: 'admin@example.com' } }} />)

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

  it('shows error for invalid current password during password update', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })

    renderWithRouter(<Settings session={{ user: { id: 'admin-1', email: 'admin@example.com' } }} />)

    fireEvent.change(screen.getByLabelText('Current Password', { selector: '#pwCurrentPw' }), {
      target: { value: 'wrong-password' },
    })
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'newpassword123' },
    })
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'newpassword123' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }))

    expect(await screen.findByText('Current password is incorrect.')).toBeInTheDocument()
  })

  it('shows success state when password update succeeds', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null })
    supabase.auth.updateUser.mockResolvedValue({ error: null })

    renderWithRouter(<Settings session={{ user: { id: 'admin-1', email: 'admin@example.com' } }} />)

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
  })
})
