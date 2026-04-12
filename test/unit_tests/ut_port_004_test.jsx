import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import Leaderboards, { formatValue } from '../../src/pages/Leaderboards'
import { createQueryBuilder, renderWithRouter, resetSupabaseMocks, supabase } from './test_helpers'

describe('UT-PORT-004 Leaderboards', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('switches between per-workout and lifetime leaderboard views', async () => {
    let call = 0
    const responses = [
      { data: [{ workout_type: 'squats', rank: 1, username: 'Alice', value: 75.5 }] },
      { data: [{ workout_type: 'squats', rank: 1, username: 'Alice', value: 1.8 }] },
      { data: [{ rank: 1, username: 'Bob', value: 300 }] },
      { data: [{ rank: 1, username: 'Bob', value: 9 }] },
    ]
    supabase.from.mockImplementation(() => createQueryBuilder(responses[call++]))

    renderWithRouter(<Leaderboards />)

    expect((await screen.findAllByText('Fastest Clear Time')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Best Rep Interval').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole('button', { name: 'Lifetime (2)' }))
    await waitFor(() => {
      expect(screen.getByText('Total Reps')).toBeInTheDocument()
      expect(screen.getByText('Total Victories')).toBeInTheDocument()
    })
  })

  it('formats time and numeric ranking values correctly', () => {
    expect(formatValue(75.5, true)).toBe('01:15.50')
    expect(formatValue(1.8234, false)).toBe('1.823s')
    expect(formatValue(42, false)).toBe('42')
  })
})
