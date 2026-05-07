import { useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  renderAchievementsSection,
  renderSessionsSection,
  renderUserAchievementsSection,
  renderUsersSection,
  saveExportDataPdf,
} from '../lib/pdfReports'

const TABLES = [
  { key: 'users', label: 'Users', description: 'Player and admin profiles', renderPdf: renderUsersSection },
  { key: 'sessions', label: 'Sessions', description: 'All game session records', renderPdf: renderSessionsSection },
  { key: 'achievements', label: 'Achievements', description: 'Master achievement definitions', renderPdf: renderAchievementsSection },
  { key: 'user_achievements', label: 'User Achievements', description: 'Achievement unlock records per user', renderPdf: renderUserAchievementsSection },
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
  const [generatingReport, setGeneratingReport] = useState(false)

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
    const { data } = await supabase.from(key).select('*')
    return data || []
  }

  async function buildTableReports(tables) {
    const tableReports = []
    for (const table of tables) {
      const rows = await fetchTableData(table.key)
      tableReports.push({
        key: table.key,
        label: table.label,
        rows,
        render: table.renderPdf,
      })
    }
    return tableReports
  }

  async function handleGenerateReport() {
    if (selected.size === 0) return
    setGeneratingReport(true)

    const tables = TABLES.filter((t) => selected.has(t.key))
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)

    try {
      const tableReports = await buildTableReports(tables)
      await saveExportDataPdf(tableReports, `fitfusion_report_${timestamp}.pdf`)

      const user = (await supabase.auth.getUser()).data.user
      if (user) {
        await supabase.from('admin_logs').insert({
          actor_user_id: user.id,
          action: 'Generated PDF report',
          target_kind: 'system',
          details: { tables: [...selected], format: 'pdf', timestamp },
        })
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setGeneratingReport(false)
    }
  }

  async function handleRawExport() {
    if (selected.size === 0) return
    setExporting(true)

    const tables = TABLES.filter((t) => selected.has(t.key))
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    let ext = format === 'csv' ? 'csv' : 'json'

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
          else content = JSON.stringify(rows, null, 2)
          
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
        } else {
          content = JSON.stringify(rows, null, 2)
          mimeType = 'application/json'
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
        Generate standard PDF reports or export selected raw tables as CSV or JSON.
      </p>

      {/* Report Generation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
              Generate Reports
            </p>
            <h3 className="text-sm font-semibold text-gray-900">System metrics report</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-2xl">
              Create a summary-only PDF with metric tables, factual bullets, and restrained charts for the selected data sections.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {selected.size === 0
                ? 'Select at least one table below to enable report generation.'
                : `${selected.size} report section${selected.size === 1 ? '' : 's'} selected.`}
            </p>
          </div>
          <button
            disabled={selected.size === 0 || generatingReport}
            onClick={handleGenerateReport}
            className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {generatingReport ? 'Generating...' : 'Export as PDF'}
          </button>
        </div>
      </div>

      {/* Report Scope */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Report Data Scope</h3>
            <p className="text-xs text-gray-500 mt-1">
              The PDF report analyzes only the tables selected here.
            </p>
          </div>
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

      {/* Raw Export */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-1">Raw Data Export</h3>
        <p className="text-xs text-gray-500 mb-4">
          Download table records as CSV or JSON. Multiple selected tables are bundled as a ZIP archive.
        </p>

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
            onClick={handleRawExport}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {exporting ? 'Processing...' : `Export ${format.toUpperCase()} ${selected.size > 0 ? `(${selected.size})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )
}
