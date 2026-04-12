import React from 'react'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-018 App session data to Portal Leaderboards', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
    seedTable('v_top10_clear_time', [
      { workout_type: 'squats', rank: 1, username: 'RunnerA', value: 55.25 },
      { workout_type: 'jumping_jacks', rank: 1, username: 'RunnerB', value: 62.75 },
      { workout_type: 'side_crunches', rank: 1, username: 'RunnerC', value: 48.0 },
    ])
    seedTable('v_top10_best_rep_interval', [
      { workout_type: 'squats', rank: 1, username: 'RunnerA', value: 1.222 },
      { workout_type: 'jumping_jacks', rank: 1, username: 'RunnerB', value: 1.444 },
      { workout_type: 'side_crunches', rank: 1, username: 'RunnerC', value: 1.666 },
    ])
    seedTable('v_top10_lifetime_reps', [
      { rank: 1, username: 'RunnerA', value: 900 },
      { rank: 2, username: 'RunnerB', value: 850 },
    ])
    seedTable('v_top10_lifetime_victories', [
      { rank: 1, username: 'RunnerC', value: 21 },
    ])
  })

  it('renders portal leaderboard values as if they were derived from app-written sessions', async () => {
    renderPortalApp('/leaderboards')

    expect(await screen.findByRole('heading', { name: 'Leaderboards' })).toBeInTheDocument()
    expect((await screen.findAllByText('RunnerA')).length).toBeGreaterThan(0)
    expect(await screen.findByText('00:55.25')).toBeInTheDocument()
    expect(await screen.findByText('1.222s')).toBeInTheDocument()
  })
})
