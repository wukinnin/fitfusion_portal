import { PLAYERS, ADMINS, PLAYER_STATS } from '../data/dummyData'

const totalSessions = Object.values(PLAYER_STATS).reduce((sum, s) => sum + s.lifetime.sessions, 0)

export default function Dashboard({ session }) {
  const stats = { users: PLAYERS.length, sessions: totalSessions, admins: ADMINS.length }
  const loading = false

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
