import { ADMIN_LOGS } from '../data/dummyData'

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
            {ADMIN_LOGS.map((log) => (
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
