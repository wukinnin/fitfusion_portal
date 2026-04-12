import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-013 Dashboard to Achievements', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
    seedTable('achievements', [
      { id: 1, code: 'first_win', title: 'First Win', description: 'Win your first session.' },
      { id: 2, code: 'rep_master', title: 'Rep Master', description: 'Reach a rep milestone.' },
    ])
    seedTable('user_achievements', [
      { id: 1, achievement_id: 1 },
      { id: 2, achievement_id: 1 },
      { id: 3, achievement_id: 2 },
    ])
  })

  it('opens the achievements integrity module and renders connected unlock counts', async () => {
    renderPortalApp('/')

    fireEvent.click(await screen.findByRole('link', { name: 'Achievements' }))

    expect(await screen.findByText('Achievement Integrity')).toBeInTheDocument()
    expect(screen.getByText('First Win')).toBeInTheDocument()
    expect(screen.getByText('2 users')).toBeInTheDocument()
    expect(screen.getByText('1 users')).toBeInTheDocument()
  })
})
