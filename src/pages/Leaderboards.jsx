import { useState } from 'react'

const WORKOUT_TYPES = ['Squats', 'Jumping Jacks', 'Side Crunches']
const WORKOUT_METRICS = ['Fastest Clear Time', 'Best Rep Interval']
const LIFETIME_METRICS = ['Total Reps', 'Total Victories']

function generateDummyRows(count) {
  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    username: '--',
    value: '--',
  }))
}

const DUMMY_ROWS = generateDummyRows(20)

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState('workout')

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Leaderboards</h2>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('workout')}
          className={`px-4 py-2 text-sm font-medium rounded cursor-pointer ${
            activeTab === 'workout'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Per-Workout (6)
        </button>
        <button
          onClick={() => setActiveTab('lifetime')}
          className={`px-4 py-2 text-sm font-medium rounded cursor-pointer ${
            activeTab === 'lifetime'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Lifetime (2)
        </button>
      </div>

      {activeTab === 'workout' && (
        <div className="space-y-8">
          {WORKOUT_TYPES.map((type) => (
            <div key={type}>
              <h3 className="text-base font-medium text-gray-900 mb-3">{type}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {WORKOUT_METRICS.map((metric) => (
                  <LeaderboardTable
                    key={`${type}-${metric}`}
                    title={metric}
                    rows={DUMMY_ROWS}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'lifetime' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {LIFETIME_METRICS.map((metric) => (
            <LeaderboardTable
              key={metric}
              title={metric}
              rows={DUMMY_ROWS}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardTable({ title, rows }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left px-4 py-2 font-medium text-gray-400 w-16">Rank</th>
            <th className="text-left px-4 py-2 font-medium text-gray-400">Username</th>
            <th className="text-right px-4 py-2 font-medium text-gray-400">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.rank} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-2 text-gray-500">#{row.rank}</td>
              <td className="px-4 py-2 text-gray-400">{row.username}</td>
              <td className="px-4 py-2 text-right text-gray-400">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
