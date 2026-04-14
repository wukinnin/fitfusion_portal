import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Admins() {
  const [admins, setAdmins] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ type: null, admin: null })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { fetchAdmins() }, [])

  async function fetchAdmins() {
    const { data } = await supabase
      .from('v_admin_users')
      .select('*')
      .order('created_at', { ascending: false })
    setAdmins(data || [])
    setLoading(false)
  }

  async function logAdminAction(action, targetKind, targetUserId, details) {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return
    await supabase.from('admin_logs').insert({
      actor_user_id: user.id,
      action,
      target_kind: targetKind,
      target_user_id: targetUserId || null,
      details: details ? details : null,
    })
  }

  async function handleForceReset(admin) {
    setActionLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(admin.email)
    if (!error) {
      await logAdminAction('Force password reset (admin)', 'user', admin.id)
    }
    setActionLoading(false)
    setModal({ type: null, admin: null })
  }

  async function handleDeleteAdmin(admin) {
    setActionLoading(true)
    const { data, error } = await supabase.functions.invoke('delete-admin', {
      body: { user_id: admin.id },
    })
    if (!error && !data?.error) {
      await logAdminAction('Deleted admin', 'user', admin.id, { email: admin.email })
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id))
    }
    setActionLoading(false)
    setModal({ type: null, admin: null })
  }

  const filtered = admins.filter((a) =>
    (a.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.username || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div><h2 className="text-xl font-semibold text-gray-900 mb-6">Admins</h2><p className="text-gray-400">Loading...</p></div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Admins</h2>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or username..."
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Username</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Verified</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">UUID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((admin) => (
              <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{admin.email}</td>
                <td className="px-4 py-3 text-gray-600">{admin.username || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      admin.is_email_verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {admin.is_email_verified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(admin.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{admin.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setModal({ type: 'reset', admin })}
                      className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
                    >
                      Reset PW
                    </button>
                    <button
                      onClick={() => setModal({ type: 'delete', admin })}
                      className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No admins found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Force Password Reset Modal */}
      {modal.type === 'reset' && (
        <Modal title="Force Password Reset" onClose={() => setModal({ type: null, admin: null })}>
          <p className="text-sm text-gray-600 mb-4">
            This will require <span className="font-medium">{modal.admin.email}</span> to set a new password on their next login.
          </p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal({ type: null, admin: null })} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button disabled={actionLoading} onClick={() => handleForceReset(modal.admin)} className="px-4 py-2 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 disabled:opacity-50 cursor-pointer">
              {actionLoading ? 'Processing...' : 'Confirm Reset'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Admin Modal */}
      {modal.type === 'delete' && (
        <Modal title="Delete Admin" onClose={() => setModal({ type: null, admin: null })}>
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">
            This will permanently delete the admin account for <span className="font-medium">{modal.admin.email}</span>. This cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModal({ type: null, admin: null })} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button disabled={actionLoading} onClick={() => handleDeleteAdmin(modal.admin)} className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer">
              {actionLoading ? 'Deleting...' : 'Delete Admin'}
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
