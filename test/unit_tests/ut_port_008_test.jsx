import React from 'react'
import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import ExportData, { toCsv } from '../../src/pages/ExportData'
import { renderWithRouter, resetSupabaseMocks } from './test_helpers'

describe('UT-PORT-008 Export Data', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  it('supports table selection, select all, and format toggles', () => {
    renderWithRouter(<ExportData />)

    expect(screen.getByRole('button', { name: 'Export' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Select All' }))
    expect(screen.getByRole('button', { name: 'Export (5 tables)' })).toBeEnabled()

    fireEvent.click(screen.getByLabelText('JSON'))
    expect(screen.getByLabelText('JSON')).toBeChecked()
  })

  it('formats CSV export content correctly', () => {
    expect(
      toCsv([
        { id: 1, username: 'alice', details: 'ok' },
        { id: 2, username: 'bob', details: 'needs,quotes' },
      ])
    ).toContain('id,username,details')
  })
})
