import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { bootstrapAdminSession, renderPortalApp, resetIntegrationState, seedTable } from './test_helpers'

describe('IT-012 Dashboard to Leaderboards', () => {
  beforeEach(() => {
    resetIntegrationState()
    bootstrapAdminSession()
    seedTable('users', [{ id: 'admin-1', role: 'admin', email: 'admin@example.com' }])
    seedTable('v_top10_clear_time', [
      { workout_type: 'squats', rank: 1, username: 'Alice', value: 75.5 },
      { workout_type: 'jumping_jacks', rank: 1, username: 'Bob', value: 61.2 },
    ])
    seedTable('v_top10_best_rep_interval', [
      { workout_type: 'squats', rank: 1, username: 'Alice', value: 1.8 },
      { workout_type: 'jumping_jacks', rank: 1, username: 'Bob', value: 1.4 },
    ])
    seedTable('v_top10_lifetime_reps', [{ rank: 1, username: 'Alice', value: 300 }])
    seedTable('v_top10_lifetime_victories', [{ rank: 1, username: 'Bob', value: 9 }])
  })

  it('loads per-workout and lifetime leaderboard views from connected data feeds', async () => {
    renderPortalApp('/')

    fireEvent.click(await screen.findByRole('link', { name: 'Leaderboards' }))

    expect(await screen.findByRole('heading', { name: 'Leaderboards' })).toBeInTheDocument()
    expect(screen.getAllByText('Fastest Clear Time').length).toBeGreaterThan(0)
    expect(screen.getByText('01:15.50')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Lifetime (2)' }))

    expect(await screen.findByText('Total Reps')).toBeInTheDocument()
    expect(screen.getByText('Total Victories')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
  })
})
