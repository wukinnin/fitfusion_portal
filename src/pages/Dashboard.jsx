import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard({ session }) {
  const [stats, setStats] = useState({ users: 0, sessions: 0, admins: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const [usersRes, sessionsRes, adminsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'player'),
        supabase.from('sessions').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('role', 'admin'),
      ])

      setStats({
        users: usersRes.count ?? 0,
        sessions: sessionsRes.count ?? 0,
        admins: adminsRes.count ?? 0,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

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
    </div>
  )
}
