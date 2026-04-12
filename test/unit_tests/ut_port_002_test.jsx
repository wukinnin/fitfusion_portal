import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import Dashboard from '../../src/pages/Dashboard'
import { createQueryBuilder, renderWithRouter, resetSupabaseMocks, supabase } from './test_helpers'

describe('UT-PORT-002 Dashboard', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('renders KPI cards and signed-in identity', async () => {
    let call = 0
    const results = [
      { count: 25, data: null, error: null },
      { count: 120, data: null, error: null },
      { count: 4, data: null, error: null },
    ]

    supabase.from.mockImplementation(() => createQueryBuilder(results[call++]))

    renderWithRouter(<Dashboard session={{ user: { email: 'admin@example.com' } }} />)

    expect(screen.getByText('Signed in as')).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument()
      expect(screen.getByText('120')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })
  })
})
