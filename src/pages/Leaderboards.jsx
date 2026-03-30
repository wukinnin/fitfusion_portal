import { useState } from 'react'
import { LEADERBOARDS } from '../data/dummyData'

const WORKOUT_BOARDS = [
  { type: 'Squats', boards: [
    { title: 'Fastest Clear Time', key: 'squats_clear_time' },
    { title: 'Best Rep Interval', key: 'squats_best_interval' },
  ]},
  { type: 'Jumping Jacks', boards: [
    { title: 'Fastest Clear Time', key: 'jacks_clear_time' },
    { title: 'Best Rep Interval', key: 'jacks_best_interval' },
  ]},
  { type: 'Side Crunches', boards: [
    { title: 'Fastest Clear Time', key: 'crunches_clear_time' },
    { title: 'Best Rep Interval', key: 'crunches_best_interval' },
  ]},
]

const LIFETIME_BOARDS = [
  { title: 'Total Reps', key: 'lifetime_reps' },
  { title: 'Total Victories', key: 'lifetime_victories' },
]

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
          {WORKOUT_BOARDS.map(({ type, boards }) => (
            <div key={type}>
              <h3 className="text-base font-medium text-gray-900 mb-3">{type}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {boards.map(({ title, key }) => (
                  <LeaderboardTable
                    key={key}
                    title={title}
                    rows={LEADERBOARDS[key]}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'lifetime' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {LIFETIME_BOARDS.map(({ title, key }) => (
            <LeaderboardTable
              key={key}
              title={title}
              rows={LEADERBOARDS[key]}
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
