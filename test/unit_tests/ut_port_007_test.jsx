import React from 'react'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import Achievements from '../../src/pages/Achievements'
import { createQueryBuilder, renderWithRouter, resetSupabaseMocks, supabase } from './test_helpers'

describe('UT-PORT-007 Achievements', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('renders achievement rows with aggregated unlock counts', async () => {
    let call = 0
    const responses = [
      {
        data: [
          { id: 1, code: 'first_blood', title: 'First Blood', description: 'Complete your first session.' },
          { id: 2, code: 'monster_hunter', title: 'Monster Hunter', description: 'Win a full 10-round session.' },
        ],
      },
      {
        data: [
          { achievement_id: 1 },
          { achievement_id: 1 },
          { achievement_id: 2 },
        ],
      },
    ]

    supabase.from.mockImplementation(() => createQueryBuilder(responses[call++]))

    renderWithRouter(<Achievements />)

    expect(await screen.findByText('First Blood')).toBeInTheDocument()
    expect(screen.getByText('Monster Hunter')).toBeInTheDocument()
    expect(screen.getByText('2 users')).toBeInTheDocument()
    expect(screen.getByText('1 users')).toBeInTheDocument()
  })
})
