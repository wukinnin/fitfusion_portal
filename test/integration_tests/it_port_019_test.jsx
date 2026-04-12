import React from 'react'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-019 App achievement events to Portal Achievements', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
    seedTable('achievements', [
      { id: 1, code: 'first_win', title: 'First Win', description: 'Win your first session.' },
      { id: 2, code: 'streak', title: 'Streak', description: 'Chain multiple wins.' },
    ])
    seedTable('user_achievements', [
      { id: 1, achievement_id: 1, user_id: 'player-1' },
      { id: 2, achievement_id: 1, user_id: 'player-2' },
      { id: 3, achievement_id: 2, user_id: 'player-1' },
    ])
  })

  it('updates integrity counts as if the unlocks were written by app-side events', async () => {
    renderPortalApp('/achievements')

    expect(await screen.findByText('First Win')).toBeInTheDocument()
    expect(screen.getByText('2 users')).toBeInTheDocument()
    expect(screen.getByText('1 users')).toBeInTheDocument()
  })
})
