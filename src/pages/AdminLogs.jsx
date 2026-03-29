const DUMMY_LOGS = [
  { id: 1, adminEmail: 'admin@fitfusion.com', action: 'Deleted player', targetId: 'a1b2c3d4-0003', details: '{ "username": "ShadowRep" }', timestamp: '2026-01-20 14:32:05' },
  { id: 2, adminEmail: 'admin@fitfusion.com', action: 'Force password reset', targetId: 'a1b2c3d4-0002', details: '{ "username": "IronFist" }', timestamp: '2026-01-19 09:15:22' },
  { id: 3, adminEmail: 'moderator@fitfusion.com', action: 'Registered admin', targetId: 'f1e2d3c4-0003', details: '{ "email": "newadmin@fitfusion.com" }', timestamp: '2026-01-18 16:45:10' },
  { id: 4, adminEmail: 'admin@fitfusion.com', action: 'Exported data', targetId: null, details: '{ "tables": ["users", "sessions"], "format": "csv" }', timestamp: '2026-01-17 11:20:00' },
  { id: 5, adminEmail: 'admin@fitfusion.com', action: 'Deleted player', targetId: 'a1b2c3d4-0005', details: '{ "username": "RepMachine" }', timestamp: '2026-01-15 08:05:33' },
]

export default function AdminLogs() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Admin Logs</h2>
          <p className="text-sm text-gray-500 mt-1">
            Audit trail of significant actions performed in the portal.
          </p>
        </div>
        <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 cursor-pointer">
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
              <th className="text-left px-4 py-3 font-medium text-gray-500">Target ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody>
            {DUMMY_LOGS.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-3 text-gray-900 font-medium">{log.adminEmail}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                  {log.targetId || '—'}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs font-mono max-w-xs truncate">
                  {log.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
