import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ session }) {
  const [stats, setStats] = useState({ users: 0, sessions: 0, admins: 0 })
  const [loading, setLoading] = useState(true)

  // Register admin state
  const [adminEmail, setAdminEmail] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regMsg, setRegMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    const [usersRes, sessionsRes, adminsRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('sessions').select('id', { count: 'exact', head: true }),
      supabase.from('admin_users').select('id', { count: 'exact', head: true }),
    ])

    setStats({
      users: usersRes.count ?? 0,
      sessions: sessionsRes.count ?? 0,
      admins: adminsRes.count ?? 0,
    })
    setLoading(false)
  }

  async function handleRegisterAdmin(e) {
    e.preventDefault()
    setRegMsg({ type: '', text: '' })

    if (!adminEmail.trim()) {
      setRegMsg({ type: 'error', text: 'Email is required.' })
      return
    }

    setRegLoading(true)

    const { data, error } = await supabase.functions.invoke('register-admin', {
      body: { email: adminEmail.trim() },
    })

    if (error) {
      setRegMsg({ type: 'error', text: error.message || 'Failed to register admin.' })
      setRegLoading(false)
      return
    }

    if (data?.error) {
      setRegMsg({ type: 'error', text: data.error })
      setRegLoading(false)
      return
    }

    setRegMsg({
      type: 'success',
      text: `Admin registered successfully. Temporary password: ${data.temp_password}`,
    })
    setAdminEmail('')
    setRegLoading(false)

    // Refresh stats to reflect new admin count
    fetchStats()
  }

  function MessageBox({ msg }) {
    if (!msg.text) return null
    const isError = msg.type === 'error'
    return (
      <div
        className={`mb-4 p-3 rounded text-sm border ${
          isError
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}
      >
        {msg.text}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-600">
          Signed in as <span className="font-medium text-gray-900">{session?.user?.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Players</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {loading ? '—' : stats.users}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sessions</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {loading ? '—' : stats.sessions}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Users</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {loading ? '—' : stats.admins}
          </p>
        </div>
      </div>

      {/* Register Admin */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-base font-medium text-gray-900 mb-1">Register Admin</h3>
        <p className="text-sm text-gray-500 mb-4">
          Send an invite to a new admin. They will receive a temporary password via email and be prompted to verify and set a new password on first login.
        </p>

        <MessageBox msg={regMsg} />

        <form onSubmit={handleRegisterAdmin} className="flex items-end gap-3">
          <div className="flex-1 max-w-sm">
            <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="adminEmail"
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="newadmin@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={regLoading}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {regLoading ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>
    </div>
  )
}
