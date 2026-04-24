import { useState } from 'react'
import { supabase } from '../lib/supabase'

const TABLES = [
  { key: 'users', label: 'Users', description: 'Player and admin profiles' },
  { key: 'sessions', label: 'Sessions', description: 'All game session records' },
  { key: 'achievements', label: 'Achievements', description: 'Master achievement definitions' },
  { key: 'user_achievements', label: 'User Achievements', description: 'Achievement unlock records per user' },
  { key: 'admin_logs', label: 'Admin Logs', description: 'Audit trail of admin actions' },
]

function toCsv(rows) {
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
    if (key === 'sessions') {
      const { data } = await supabase
        .from('sessions')
        .select('*, users(username, email)')
      return (data || []).map(row => ({
        ...row,
        username: row.users?.username || '—',
        email: row.users?.email || '—'
      }))
    }
    if (key === 'user_achievements') {
      const { data } = await supabase
        .from('user_achievements')
        .select('*, users(username, email), achievements(code, title)')
      return (data || []).map(row => ({
        ...row,
        username: row.users?.username || '—',
        email: row.users?.email || '—',
        achievement_code: row.achievements?.code || '—',
        achievement_title: row.achievements?.title || '—'
      }))
    }
    if (key === 'admin_logs') {
      const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false })
      return (data || []).map(row => {
        const actor = row.details?._actor || {}
        const target = row.details?._target || {}
        return {
          ...row,
          actor_username: actor.username || '—',
          actor_email: actor.email || '—',
          target_username: row.target_user_id ? (target.username || '—') : '',
          target_email: row.target_user_id ? (target.email || '—') : '',
          target_role: row.target_user_id ? (target.role || '—') : (row.target_kind === 'system' ? 'system' : '')
        }
      })
    }
    const { data } = await supabase.from(key).select('*')
    return data || []
  }

  function toTxt(tableKey, rows) {
    if (!rows || rows.length === 0) return `No data for ${tableKey}`
    
    const timestamp = new Date().toLocaleString()
    let content = `FitFusion Export: ${tableKey.toUpperCase()}\nExported at: ${timestamp}\n${'='.repeat(50)}\n\n`

    rows.forEach((row, i) => {
      content += `[Record #${i + 1}]\n`
      Object.entries(row).forEach(([k, v]) => {
        if (k === 'users' || k === 'achievements') return // Skip join objects
        const val = v === null ? 'NULL' : (typeof v === 'object' ? JSON.stringify(v) : String(v))
        content += `${k.padEnd(20)}: ${val}\n`
      })
      content += `\n`
    })
    return content
  }

  async function handleExport() {
    if (selected.size === 0) return
    setExporting(true)
    
    const tables = TABLES.filter((t) => selected.has(t.key))
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    let ext = format === 'csv' ? 'csv' : (format === 'json' ? 'json' : 'txt')

    try {
      if (selected.size >= 2) {
        // ZIP Export
        let JSZip
        try {
          JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default
        } catch (e) {
          console.error('JSZip import failed', e)
          throw new Error('Failed to load ZIP library. Try exporting fewer tables individually.')
        }

        const zip = new JSZip()
        for (const table of tables) {
          const rows = await fetchTableData(table.key)
          let content
          if (format === 'csv') content = toCsv(rows)
          else if (format === 'json') content = JSON.stringify(rows, null, 2)
          else content = toTxt(table.key, rows)
          
          zip.file(`${table.key}.${ext}`, content)
        }

        const blob = await zip.generateAsync({ type: 'blob' })
        downloadBlob(blob, `fitfusion_export_${timestamp}.zip`)
      } else {
        // Individual Export (1 table)
        const table = tables[0]
        const rows = await fetchTableData(table.key)
        let content
        let mimeType
        if (format === 'csv') {
          content = toCsv(rows)
          mimeType = 'text/csv'
        } else if (format === 'json') {
          content = JSON.stringify(rows, null, 2)
          mimeType = 'application/json'
        } else {
          content = toTxt(table.key, rows)
          mimeType = 'text/plain'
        }
        
        const blob = new Blob([content], { type: mimeType })
        downloadBlob(blob, `${table.key}_${timestamp}.${ext}`)
      }

      // Log export action
      const user = (await supabase.auth.getUser()).data.user
      if (user) {
        await supabase.from('admin_logs').insert({
          actor_user_id: user.id,
          action: selected.size >= 2 ? 'Exported data (ZIP)' : 'Exported data',
          target_kind: 'system',
          details: { tables: [...selected], format, timestamp },
        })
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Export Data</h2>
      <p className="text-sm text-gray-500 mb-6">
        Export tables and schema with current data as CSV or JSON. Automatically bundles as ZIP if multiple tables are selected.
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="format"
              value="txt"
              checked={format === 'txt'}
              onChange={() => setFormat('txt')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">TXT (Human Readable)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            disabled={selected.size === 0 || exporting}
            onClick={handleExport}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {exporting ? 'Processing...' : `Export ${selected.size > 0 ? `(${selected.size})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
