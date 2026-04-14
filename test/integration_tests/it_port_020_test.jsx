import React from 'react'
import { screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-020 App Achievement Unlock Events to Portal Achievements', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
    seedTable('achievements', [
      {
        id: 1,
        code: 'first_win',
        title: 'First Win',
        description: 'Win your first workout battle.',
      },
      {
        id: 2,
        code: 'combo_starter',
        title: 'Combo Starter',
        description: 'Complete a short rep streak.',
      },
      {
        id: 3,
        code: 'marathon_mode',
        title: 'Marathon Mode',
        description: 'Finish an extended session.',
      },
    ])
    seedTable('user_achievements', [
      { id: 1, achievement_id: 1, user_id: 'player-1' },
      { id: 2, achievement_id: 1, user_id: 'player-2' },
      { id: 3, achievement_id: 2, user_id: 'player-1' },
    ])
  })

  it('reflects app-side unlock events in portal achievement integrity counts', async () => {
    renderPortalApp('/achievements')

    expect(await screen.findByText('Achievement Integrity')).toBeInTheDocument()

    const firstWinRow = (await screen.findByText('First Win')).closest('tr')
    const comboStarterRow = screen.getByText('Combo Starter').closest('tr')
    const marathonModeRow = screen.getByText('Marathon Mode').closest('tr')

    expect(firstWinRow).not.toBeNull()
    expect(comboStarterRow).not.toBeNull()
    expect(marathonModeRow).not.toBeNull()

    expect(within(firstWinRow).getByText('2 users')).toBeInTheDocument()
    expect(within(comboStarterRow).getByText('1 users')).toBeInTheDocument()
    expect(within(marathonModeRow).getByText('0 users')).toBeInTheDocument()
  })
})
