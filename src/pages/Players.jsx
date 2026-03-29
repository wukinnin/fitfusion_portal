import { useState } from 'react'

const DUMMY_PLAYERS = [
  { id: 'a1b2c3d4-0001', username: 'DragonSlayer', email: 'dragon@example.com', verified: true, created: '2025-12-01' },
  { id: 'a1b2c3d4-0002', username: 'IronFist', email: 'iron@example.com', verified: true, created: '2025-12-05' },
  { id: 'a1b2c3d4-0003', username: 'ShadowRep', email: 'shadow@example.com', verified: false, created: '2025-12-10' },
  { id: 'a1b2c3d4-0004', username: 'FlameRunner', email: 'flame@example.com', verified: true, created: '2026-01-02' },
  { id: 'a1b2c3d4-0005', username: 'RepMachine', email: 'rep@example.com', verified: true, created: '2026-01-15' },
]

const ACHIEVEMENTS = [
  'First Blood', 'Iron Will', 'Blood Pumper', 'Survivor', 'Halfway Hero',
  'Monster Hunter', 'Triple Crown', 'Speed Demon', 'Blinding Steel', 'Untouchable', 'Last Stand',
]

export default function Players() {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [modal, setModal] = useState({ type: null, player: null })

  const filtered = DUMMY_PLAYERS.filter(
    (p) =>
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  )

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
            <button className="px-4 py-2 text-sm text-white bg-gray-900 rounded hover:bg-gray-800 cursor-pointer">
              Confirm Reset
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
            This will permanently delete <span className="font-medium">{modal.player.username}</span> and cascade-delete all their sessions, stats, achievements, and leaderboard entries. This cannot be undone.
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setModal({ type: null, player: null })}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer">
              Delete Player
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
              player.verified
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {player.verified ? 'Verified' : 'Pending'}
          </span>
        </td>
        <td className="px-4 py-3 text-gray-500">{player.created}</td>
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
  return (
    <div className="space-y-4">
      {/* Profile */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Profile</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><span className="text-gray-500">UUID:</span> <span className="text-gray-700 font-mono text-xs">{player.id}</span></div>
          <div><span className="text-gray-500">Username:</span> <span className="text-gray-900 font-medium">{player.username}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="text-gray-700">{player.email}</span></div>
          <div><span className="text-gray-500">Created:</span> <span className="text-gray-700">{player.created}</span></div>
        </div>
      </div>

      {/* Per-workout Stats */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Session Stats</h4>
        <div className="grid grid-cols-3 gap-3">
          {['Squats', 'Jumping Jacks', 'Side Crunches'].map((type) => (
            <div key={type} className="bg-white border border-gray-200 rounded p-3">
              <p className="text-xs font-medium text-gray-500 mb-2">{type}</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Fastest Clear Time: <span className="text-gray-400">--</span></p>
                <p>Avg Clear Time: <span className="text-gray-400">--</span></p>
                <p>Best Rep Interval: <span className="text-gray-400">--</span></p>
                <p>Avg Rep Interval: <span className="text-gray-400">--</span></p>
                <p>Victories: <span className="text-gray-400">0</span></p>
                <p>Defeats: <span className="text-gray-400">0</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lifetime Stats */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Lifetime Stats</h4>
        <div className="grid grid-cols-4 gap-3 text-sm">
          {['Total Sessions', 'Total Reps', 'Total Rounds', 'Total Victories'].map((label) => (
            <div key={label} className="bg-white border border-gray-200 rounded p-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">0</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Achievements</h4>
        <div className="flex flex-wrap gap-2">
          {ACHIEVEMENTS.map((name) => (
            <span
              key={name}
              className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-400 border border-gray-200"
            >
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* Leaderboard Standings */}
      <div>
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Leaderboard Standings</h4>
        <p className="text-xs text-gray-400">No leaderboard entries.</p>
      </div>
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
