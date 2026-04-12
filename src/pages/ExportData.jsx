import { useState } from 'react'
import { supabase } from '../lib/supabase'

const TABLES = [
  { key: 'users', label: 'Users', description: 'Player and admin profiles' },
  { key: 'sessions', label: 'Sessions', description: 'All game session records' },
  { key: 'achievements', label: 'Achievements', description: 'Master achievement definitions' },
  { key: 'user_achievements', label: 'User Achievements', description: 'Achievement unlock records per user' },
  { key: 'admin_logs', label: 'Admin Logs', description: 'Audit trail of admin actions' },
]

export function toCsv(rows) {
  if (!rows || rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => {
      const val = row[h]
      if (val == null) return ''
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    }).join(','))
  }
  return lines.join('\n')
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportData() {
  const [selected, setSelected] = useState(new Set())
  const [format, setFormat] = useState('csv')
  const [exporting, setExporting] = useState(false)

  function toggleTable(key) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function selectAll() {
    if (selected.size === TABLES.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(TABLES.map((t) => t.key)))
    }
  }

  async function fetchTableData(key) {
    const { data } = await supabase.from(key).select('*')
    return data || []
  }

  async function handleExport() {
    setExporting(true)
    const tables = TABLES.filter((t) => selected.has(t.key))

    for (const table of tables) {
      const rows = await fetchTableData(table.key)
      const ext = format === 'csv' ? 'csv' : 'json'
      const content = format === 'csv' ? toCsv(rows) : JSON.stringify(rows, null, 2)
      const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' })
      downloadBlob(blob, `${table.key}.${ext}`)
    }

    // Log export action
    const user = (await supabase.auth.getUser()).data.user
    if (user) {
      await supabase.from('admin_logs').insert({
        actor_user_id: user.id,
        action: 'Exported data',
        target_kind: 'system',
        details: { tables: [...selected], format },
      })
    }

    setExporting(false)
  }

  async function handleZipExport() {
    setExporting(true)
    const tables = TABLES.filter((t) => selected.has(t.key))

    // Dynamic import of JSZip
    let JSZip
    try {
      JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default
    } catch {
      // Fallback: export individually
      await handleExport()
      return
    }

    const zip = new JSZip()
    for (const table of tables) {
      const rows = await fetchTableData(table.key)
      const ext = format === 'csv' ? 'csv' : 'json'
      const content = format === 'csv' ? toCsv(rows) : JSON.stringify(rows, null, 2)
      zip.file(`${table.key}.${ext}`, content)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    downloadBlob(blob, `fitfusion_export_${new Date().toISOString().slice(0, 10)}.zip`)

    const user = (await supabase.auth.getUser()).data.user
    if (user) {
      await supabase.from('admin_logs').insert({
        actor_user_id: user.id,
        action: 'Exported data (ZIP)',
        target_kind: 'system',
        details: { tables: [...selected], format },
      })
    }

    setExporting(false)
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Export Data</h2>
      <p className="text-sm text-gray-500 mb-6">
        Export tables and schema with current data as CSV or JSON. Optionally bundle as ZIP.
      </p>

      {/* Table Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Select Tables</h3>
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            {selected.size === TABLES.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="space-y-2">
          {TABLES.map((table) => (
            <label
              key={table.key}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.has(table.key)}
                onChange={() => toggleTable(table.key)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">{table.label}</span>
                <span className="text-xs text-gray-400 ml-2">{table.description}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Format + Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Export Format</h3>

        <div className="flex items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="csv"
              checked={format === 'csv'}
              onChange={() => setFormat('csv')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">CSV</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="json"
              checked={format === 'json'}
              onChange={() => setFormat('json')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">JSON</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            disabled={selected.size === 0 || exporting}
            onClick={handleExport}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {exporting ? 'Exporting...' : `Export ${selected.size > 0 ? `(${selected.size} table${selected.size > 1 ? 's' : ''})` : ''}`}
          </button>
          <button
            disabled={selected.size === 0 || exporting}
            onClick={handleZipExport}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {exporting ? 'Bundling...' : 'Bundle as ZIP'}
          </button>
        </div>
      </div>
    </div>
  )
}
