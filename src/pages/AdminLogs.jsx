import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState(null)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })

  useEffect(() => {
    async function fetchLogs() {
      const { data } = await supabase
        .from('admin_logs')
        .select(`
          id, 
          action, 
          target_kind, 
          target_user_id, 
          target_session_id, 
          details, 
          created_at, 
          actor_user_id, 
          actor:users!admin_logs_actor_user_id_fkey(username, email),
          target:users!admin_logs_target_user_id_fkey(username, email, role)
        `)
        .order('created_at', { ascending: false })
      setLogs(data || [])
      setLoading(false)
    }
    fetchLogs()
  }, [])

  function handleSort(key) {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const processedLogs = logs.map(log => {
    const hasTargetUser = !!(log.target?.username || log.target_user_id)
    const hasTargetSession = !!log.target_session_id
    const isSystemAction = log.target_kind === 'system'
    
    return {
      ...log,
      admin_username: log.actor?.username || '—',
      admin_email: log.actor?.email || '—',
      admin_uuid: log.actor_user_id || '—',
      target_username: (hasTargetUser || hasTargetSession) ? (log.target?.username || log.target_user_id || log.target_session_id) : '—',
      target_email: hasTargetUser ? (log.target?.email || '—') : '—',
      target_role: hasTargetUser ? (log.target?.role || '—') : (isSystemAction ? 'system' : '—'),
      target_uuid: hasTargetUser ? (log.target_user_id || '—') : '—',
    }
  })

  const sortedLogs = [...processedLogs].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    let aVal, bVal

    if (sortConfig.key === 'admin_username') { aVal = a.admin_username; bVal = b.admin_username; }
    else if (sortConfig.key === 'admin_email') { aVal = a.admin_email; bVal = b.admin_email; }
    else if (sortConfig.key === 'admin_uuid') { aVal = a.admin_uuid; bVal = b.admin_uuid; }
    else if (sortConfig.key === 'target_username') { aVal = a.target_username; bVal = b.target_username; }
    else if (sortConfig.key === 'target_email') { aVal = a.target_email; bVal = b.target_email; }
    else if (sortConfig.key === 'target_role') { aVal = a.target_role; bVal = b.target_role; }
    else if (sortConfig.key === 'target_uuid') { aVal = a.target_uuid; bVal = b.target_uuid; }
    else { aVal = a[sortConfig.key]; bVal = b[sortConfig.key]; }

    if (sortConfig.key === 'created_at') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    } else {
      aVal = String(aVal || '').toLowerCase()
      bVal = String(bVal || '').toLowerCase()
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  const filtered = sortedLogs.filter((log) => {
    const s = search.toLowerCase()
    return (
      log.action.toLowerCase().includes(s) ||
      log.admin_username.toLowerCase().includes(s) ||
      log.admin_email.toLowerCase().includes(s) ||
      log.admin_uuid.toLowerCase().includes(s) ||
      log.target_username.toLowerCase().includes(s) ||
      log.target_email.toLowerCase().includes(s) ||
      log.target_uuid.toLowerCase().includes(s) ||
      log.target_role.toLowerCase().includes(s) ||
      new Date(log.created_at).toLocaleString().toLowerCase().includes(s)
    )
  })

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <span className="ml-1 text-gray-300 opacity-0 group-hover:opacity-100">↕</span>
    return <span className="ml-1 text-blue-600">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
  }

  function handleExportTxt() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const lines = filtered.map((log) => {
      const ts = new Date(log.created_at).toLocaleString()
      const details = log.details ? JSON.stringify(log.details, null, 2) : ''
      const targetStr = log.target_username !== '—' 
        ? `TARGET: ${log.target_username} (${log.target_email}) [UUID: ${log.target_uuid}] [ROLE: ${log.target_role}]`
        : `TARGET: N/A`
      return `[${ts}] ADMIN: ${log.admin_username} (${log.admin_email}) [${log.admin_uuid}] | ACTION: ${log.action} | ${targetStr}${details ? ` | DETAILS: ${details.replace(/\n/g, ' ')}` : ''}`
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admin_logs_${timestamp}.txt`
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
          disabled={filtered.length === 0}
          className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
        >
          Export as TXT
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by admin (user/email/uuid), target (user/email/uuid/role), action, or date..."
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm text-gray-600">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th onClick={() => handleSort('created_at')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100 whitespace-nowrap">
                Timestamp <SortIcon columnKey="created_at" />
              </th>
              <th onClick={() => handleSort('admin_username')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100">
                Admin Username <SortIcon columnKey="admin_username" />
              </th>
              <th onClick={() => handleSort('admin_email')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100">
                Admin Email <SortIcon columnKey="admin_email" />
              </th>
              <th onClick={() => handleSort('admin_uuid')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100">
                Admin UUID <SortIcon columnKey="admin_uuid" />
              </th>
              <th onClick={() => handleSort('action')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100">
                Action <SortIcon columnKey="action" />
              </th>
              <th onClick={() => handleSort('target_role')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100">
                Target Role <SortIcon columnKey="target_role" />
              </th>
              <th onClick={() => handleSort('target_username')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100">
                Target Username <SortIcon columnKey="target_username" />
              </th>
              <th onClick={() => handleSort('target_email')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100">
                Target Email <SortIcon columnKey="target_email" />
              </th>
              <th onClick={() => handleSort('target_uuid')} className="text-left px-4 py-3 font-medium text-gray-500 cursor-pointer group hover:bg-gray-100">
                Target UUID <SortIcon columnKey="target_uuid" />
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 text-xs">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-900 font-medium">
                  {log.admin_username}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {log.admin_email}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">
                  {log.actor_user_id}
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {log.action}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${
                    log.target_role === 'admin' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    log.target_role === 'player' ? 'bg-green-50 text-green-700 border border-green-100' :
                    'bg-gray-50 text-gray-600 border border-gray-100'
                  }`}>
                    {log.target_role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900">
                  {log.target_username}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {log.target_email}
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">
                  {log.target_uuid}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-[100px] font-mono text-[10px] text-gray-400">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </span>
                    {log.details && (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        View
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {selectedLog && (
        <Modal
          title="Log Details"
          onClose={() => setSelectedLog(null)}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Action</p>
              <p className="text-sm text-gray-900 font-medium">{selectedLog.action}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Target</p>
              <p className="text-sm text-gray-900">{selectedLog.target?.username || selectedLog.target_user_id || selectedLog.target_session_id || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Timestamp</p>
              <p className="text-sm text-gray-900">{new Date(selectedLog.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Raw Details</p>
              <pre className="bg-gray-50 border border-gray-200 rounded p-3 text-xs font-mono overflow-auto max-h-[300px]">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setSelectedLog(null)}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-lg p-6 w-full max-w-md">
        <h3 className="text-base font-medium text-gray-900 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  )
}

