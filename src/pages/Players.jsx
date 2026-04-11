import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const WORKOUT_TYPES = [
  { key: 'squats', label: 'Squats' },
  { key: 'jumping_jacks', label: 'Jumping Jacks' },
  { key: 'side_crunches', label: 'Side Crunches' },
]

export default function Players() {
  const [players, setPlayers] = useState([])
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [modal, setModal] = useState({ type: null, player: null })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => { fetchPlayers() }, [])

  async function fetchPlayers() {
    const { data } = await supabase
      .from('users')
      .select('id, username, email, is_email_verified, created_at')
      .eq('role', 'player')
      .order('created_at', { ascending: false })
    setPlayers(data || [])
    setLoading(false)
  }

  async function handleForceReset(player) {
    setActionLoading(true)
    const { error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: player.email,
    })
    if (!error) {
      await logAdminAction('Force password reset', 'user', player.id)
    }
    setActionLoading(false)
    setModal({ type: null, player: null })
  }

  async function handleDeletePlayer(player) {
    setActionLoading(true)
    const { error } = await supabase.from('users').delete().eq('id', player.id)
    if (!error) {
      await logAdminAction('Deleted player', 'user', player.id, { username: player.username })
      setPlayers((prev) => prev.filter((p) => p.id !== player.id))
    }
    setActionLoading(false)
    setModal({ type: null, player: null })
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

  const filtered = players.filter(
    (p) =>
      (p.username || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <div><h2 className="text-xl font-semibold text-gray-900 mb-6">Players</h2><p className="text-gray-400">Loading...</p></div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Players</h2>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username or email..."
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Username</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Verified</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((player) => (
              <PlayerRow
                key={player.id}
                player={player}
                expanded={expandedId === player.id}
                onToggle={() => setExpandedId(expandedId === player.id ? null : player.id)}
                onAction={(type) => setModal({ type, player })}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No players found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal.type === 'reset' && (
        <Modal
          title="Force Password Reset"
          onClose={() => setModal({ type: null, player: null })}
        >
          <p className="text-sm text-gray-600 mb-4">
            This will require <span className="font-medium">{modal.player.username}</span> ({modal.player.email}) to set a new password on their next login.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModal({ type: null, player: null })}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={actionLoading}
              onClick={() => handleForceReset(modal.player)}
              className="px-4 py-2 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Processing...' : 'Confirm Reset'}
            </button>
          </div>
        </Modal>
      )}

      {modal.type === 'delete' && (
        <Modal
          title="Delete Player"
          onClose={() => setModal({ type: null, player: null })}
        >
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 mb-4">
            This will permanently delete <span className="font-medium">{modal.player.username}</span> and cascade-delete all their sessions and achievements. This cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModal({ type: null, player: null })}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={actionLoading}
              onClick={() => handleDeletePlayer(modal.player)}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Deleting...' : 'Delete Player'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function PlayerRow({ player, expanded, onToggle, onAction }) {
  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50">
        <td className="px-4 py-3 font-medium text-gray-900">{player.username}</td>
        <td className="px-4 py-3 text-gray-600">{player.email}</td>
        <td className="px-4 py-3">
          <span
            className={`inline-block px-2 py-0.5 text-xs rounded-full ${
              player.is_email_verified
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {player.is_email_verified ? 'Verified' : 'Pending'}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500">{new Date(player.created_at).toLocaleDateString()}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {expanded ? 'Hide' : 'View'}
            </button>
            <button
              onClick={() => onAction('reset')}
              className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Reset PW
            </button>
            <button
              onClick={() => onAction('delete')}
              className="text-xs text-red-600 hover:text-red-800 cursor-pointer"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-4 py-4">
            <PlayerDetail player={player} />
          </td>
        </tr>
      )}
    </>
  )
}

function PlayerDetail({ player }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [sessionsRes, lifetimeRes, achievementsRes, allAchievementsRes] = await Promise.all([
        supabase.from('sessions').select('*').eq('user_id', player.id),
        supabase.from('v_user_lifetime_stats').select('*').eq('user_id', player.id).maybeSingle(),
        supabase.from('user_achievements').select('achievement_id, achievements(code, title)').eq('user_id', player.id),
        supabase.from('achievements').select('id, code, title').order('id'),
      ])

      const sessions = sessionsRes.data || []
      const workoutStats = WORKOUT_TYPES.map(({ key, label }) => {
        const ws = sessions.filter((s) => s.workout_type === key)
        const won = ws.filter((s) => s.won)
        const lost = ws.filter((s) => !s.won)
        const times = won.map((s) => Number(s.total_time_seconds))
        const intervals = ws.filter((s) => s.best_rep_interval_seconds != null).map((s) => Number(s.best_rep_interval_seconds))
        const avgIntervals = ws.filter((s) => s.avg_rep_interval_seconds != null).map((s) => Number(s.avg_rep_interval_seconds))
        return {
          label,
          fastestClearTime: times.length > 0 ? formatTime(Math.min(...times)) : '--',
          avgClearTime: times.length >= 2 ? formatTime(times.reduce((a, b) => a + b, 0) / times.length) : '--',
          bestRepInterval: intervals.length > 0 ? `${Math.min(...intervals).toFixed(3)}s` : '--',
          avgRepInterval: avgIntervals.length >= 2 ? `${(avgIntervals.reduce((a, b) => a + b, 0) / avgIntervals.length).toFixed(3)}s` : '--',
          victories: won.length,
          defeats: lost.length,
        }
      })

      const lifetime = lifetimeRes.data
      const unlockedCodes = new Set((achievementsRes.data || []).map((a) => a.achievements?.code).filter(Boolean))
      const allAchievements = allAchievementsRes.data || []

      setDetail({ workoutStats, lifetime, allAchievements, unlockedCodes })
      setLoading(false)
    }
    load()
  }, [player.id])

  if (loading) return <p className="text-xs text-gray-400">Loading details...</p>
  if (!detail) return null

  return (
    <div className="space-y-4">
      {/* Profile */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Profile</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><span className="text-gray-500">UUID:</span> <span className="text-gray-700 font-mono text-xs">{player.id}</span></div>
          <div><span className="text-gray-500">Username:</span> <span className="text-gray-900 font-medium">{player.username}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="text-gray-700">{player.email}</span></div>
          <div><span className="text-gray-500">Created:</span> <span className="text-gray-700">{new Date(player.created_at).toLocaleDateString()}</span></div>
        </div>
      </div>

      {/* Per-workout Stats */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Session Stats</h4>
        <div className="grid grid-cols-3 gap-3">
          {detail.workoutStats.map((ws) => (
            <div key={ws.label} className="bg-white border border-gray-200 rounded p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">{ws.label}</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Fastest Clear Time: <span className={ws.fastestClearTime === '--' ? 'text-gray-400' : 'text-gray-900'}>{ws.fastestClearTime}</span></p>
                <p>Avg Clear Time: <span className={ws.avgClearTime === '--' ? 'text-gray-400' : 'text-gray-900'}>{ws.avgClearTime}</span></p>
                <p>Best Rep Interval: <span className={ws.bestRepInterval === '--' ? 'text-gray-400' : 'text-gray-900'}>{ws.bestRepInterval}</span></p>
                <p>Avg Rep Interval: <span className={ws.avgRepInterval === '--' ? 'text-gray-400' : 'text-gray-900'}>{ws.avgRepInterval}</span></p>
                <p>Victories: <span className="text-gray-900">{ws.victories}</span></p>
                <p>Defeats: <span className="text-gray-900">{ws.defeats}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifetime Stats */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Lifetime Stats</h4>
        <div className="grid grid-cols-4 gap-3 text-sm">
          {[
            { label: 'Total Sessions', value: detail.lifetime?.total_sessions ?? 0 },
            { label: 'Total Reps', value: detail.lifetime?.total_reps ?? 0 },
            { label: 'Total Rounds', value: detail.lifetime?.total_rounds ?? 0 },
            { label: 'Total Victories', value: detail.lifetime?.total_victories ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded p-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Achievements</h4>
        <div className="flex flex-wrap gap-2">
          {detail.allAchievements.map((a) => {
            const unlocked = detail.unlockedCodes.has(a.code)
            return (
              <span
                key={a.code}
                className={`px-2 py-1 text-xs rounded border ${
                  unlocked
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
              >
                {a.title}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`
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
