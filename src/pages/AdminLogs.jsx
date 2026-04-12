import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function buildAdminLogText(logs) {
  return logs.map((log) => {
    const ts = new Date(log.created_at).toISOString()
    const email = log.users?.email || log.actor_user_id
    const target = log.target_user_id || log.target_session_id || '—'
    const details = log.details ? JSON.stringify(log.details) : ''
    return `[${ts}] ${email} | ${log.action} | target: ${target} | ${details}`
  })
}

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('admin_logs')
        .select('id, action, target_kind, target_user_id, target_session_id, details, created_at, actor_user_id, users!admin_logs_actor_user_id_fkey(email)')
        .order('created_at', { ascending: false })
      setLogs(data || [])
      setLoading(false)
    }
    fetchLogs()
  }, [])

  function handleExportTxt() {
    const lines = buildAdminLogText(logs)
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin_logs_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div><h2 className="text-xl font-semibold text-gray-900">Admin Logs</h2><p className="text-gray-400 mt-4">Loading...</p></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Admin Logs</h2>
          <p className="text-sm text-gray-500 mt-1">
            Audit trail of significant actions performed in the portal.
          </p>
        </div>
        <button
          onClick={handleExportTxt}
          disabled={logs.length === 0}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          Export as TXT
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Timestamp</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Admin</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Target</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{log.users?.email || '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                  {log.target_user_id || log.target_session_id || '—'}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs font-mono max-w-xs truncate">
                  {log.details ? JSON.stringify(log.details) : '—'}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No logs recorded.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
