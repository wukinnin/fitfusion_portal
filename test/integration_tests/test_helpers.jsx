import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { vi } from 'vitest'

import App from '../../src/App'
import { setNavigateMode, supabase } from '../unit_tests/test_helpers'

let authCallbacks = []
let currentSession = null
let tableState = {}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value))
}

function getRows(table) {
  return clone(tableState[table] || [])
}

function setRows(table, rows) {
  tableState[table] = clone(rows)
}

function matchesFilters(row, filters) {
  return filters.every(({ field, value }) => row?.[field] === value)
}

function sortRows(rows, orderBy) {
  if (!orderBy) return rows
  const { field, ascending } = orderBy
  return [...rows].sort((a, b) => {
    if (a?.[field] === b?.[field]) return 0
    if (a?.[field] == null) return 1
    if (b?.[field] == null) return -1
    if (a[field] < b[field]) return ascending ? -1 : 1
    return ascending ? 1 : -1
  })
}

function evaluateTable(table, state) {
  const rows = sortRows(
    getRows(table).filter((row) => matchesFilters(row, state.filters)),
    state.orderBy
  )

  if (state.action === 'insert') {
    const payloads = (Array.isArray(state.payload) ? state.payload : [state.payload]).map((row, index) => ({
      id: row?.id ?? `${table}-${Date.now()}-${index}`,
      created_at: row?.created_at ?? '2026-04-12T00:00:00Z',
      ...row,
    }))
    setRows(table, [...getRows(table), ...payloads])
    return { data: payloads, error: null }
  }

  if (state.action === 'delete') {
    const remaining = getRows(table).filter((row) => !matchesFilters(row, state.filters))
    setRows(table, remaining)
    return { data: [], error: null }
  }

  if (state.selectOptions?.count === 'exact' && state.selectOptions?.head) {
    return { count: rows.length, data: null, error: null }
  }

  if (state.mode === 'single') {
    return rows.length > 0
      ? { data: rows[0], error: null }
      : { data: null, error: { message: 'No rows found' } }
  }

  if (state.mode === 'maybeSingle') {
    return { data: rows[0] || null, error: null }
  }

  return { data: rows, error: null }
}

function createTableBuilder(table) {
  const state = {
    filters: [],
    orderBy: null,
    selectOptions: null,
    action: 'select',
    payload: null,
    mode: 'many',
  }

  const resolve = () => Promise.resolve(evaluateTable(table, state))

  const builder = {
    select: vi.fn((_fields, options) => {
      state.action = 'select'
      state.selectOptions = options || null
      return builder
    }),
    eq: vi.fn((field, value) => {
      state.filters.push({ field, value })
      return builder
    }),
    order: vi.fn((field, options = {}) => {
      state.orderBy = { field, ascending: options.ascending !== false }
      return builder
    }),
    single: vi.fn(() => {
      state.mode = 'single'
      return resolve()
    }),
    maybeSingle: vi.fn(() => {
      state.mode = 'maybeSingle'
      return resolve()
    }),
    delete: vi.fn(() => {
      state.action = 'delete'
      return builder
    }),
    insert: vi.fn((payload) => {
      state.action = 'insert'
      state.payload = payload
      return resolve()
    }),
    update: vi.fn((payload) => {
      state.action = 'update'
      state.payload = payload
      return builder
    }),
    then: (resolveThen, rejectThen) => resolve().then(resolveThen, rejectThen),
    catch: (rejectThen) => resolve().catch(rejectThen),
  }

  return builder
}

function makeSession(userOverrides = {}) {
  return {
    access_token: 'token',
    refresh_token: 'refresh',
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      email_confirmed_at: '2026-04-12T00:00:00Z',
      ...userOverrides,
    },
  }
}

export function resetIntegrationState() {
  setNavigateMode('actual')
  authCallbacks = []
  currentSession = null
  tableState = {}

  supabase.from.mockReset()
  supabase.auth.signInWithPassword.mockReset()
  supabase.auth.signOut.mockReset()
  supabase.auth.resetPasswordForEmail.mockReset()
  supabase.auth.updateUser.mockReset()
  supabase.auth.getUser.mockReset()
  supabase.auth.getSession.mockReset()
  supabase.auth.onAuthStateChange.mockReset()
  supabase.auth.admin.generateLink.mockReset()
  supabase.functions.invoke.mockReset()

  supabase.from.mockImplementation((table) => createTableBuilder(table))
  supabase.auth.getSession.mockImplementation(async () => ({
    data: { session: currentSession },
  }))
  supabase.auth.getUser.mockImplementation(async () => ({
    data: { user: currentSession?.user || null },
  }))
  supabase.auth.onAuthStateChange.mockImplementation((callback) => {
    authCallbacks.push(callback)
    return {
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    }
  })
  supabase.auth.signOut.mockImplementation(async () => {
    dispatchAuthChange('SIGNED_OUT', null)
    return { error: null }
  })
  supabase.auth.signInWithPassword.mockImplementation(async ({ email }) => {
    const session = makeSession({ email })
    dispatchAuthChange('SIGNED_IN', session)
    return {
      data: { user: session.user },
      error: null,
    }
  })
  supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })
  supabase.auth.updateUser.mockResolvedValue({ error: null })
  supabase.auth.admin.generateLink.mockResolvedValue({ data: {}, error: null })
  supabase.functions.invoke.mockResolvedValue({ data: {}, error: null })
}

export function dispatchAuthChange(event, session) {
  currentSession = session
  authCallbacks.forEach((callback) => callback(event, session))
}

export function bootstrapAdminSession(userOverrides = {}) {
  currentSession = makeSession(userOverrides)
  return currentSession
}

export function seedTable(table, rows) {
  setRows(table, rows)
}

export function readTable(table) {
  return getRows(table)
}

export function renderPortalApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  )
}
