import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const WORKOUT_TYPES = [
  { key: 'squats', label: 'Squats' },
  { key: 'jumping_jacks', label: 'Jumping Jacks' },
  { key: 'side_crunches', label: 'Side Crunches' },
]

function formatValue(value, isTime) {
  if (value == null) return '--'
  const n = Number(value)
  if (isTime) {
    const minutes = Math.floor(n / 60)
    const secs = n % 60
    return `${String(minutes).padStart(2, '0')}:${secs.toFixed(2).padStart(5, '0')}`
  }
  if (Number.isInteger(n)) return String(n)
  return `${n.toFixed(3)}s`
}

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState('workout')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({})

  useEffect(() => {
    async function fetchAll() {
      const [ctRes, riRes, repsRes, vicRes] = await Promise.all([
        supabase.from('v_top10_clear_time').select('*'),
        supabase.from('v_top10_best_rep_interval').select('*'),
        supabase.from('v_top10_lifetime_reps').select('*'),
        supabase.from('v_top10_lifetime_victories').select('*'),
      ])

      const result = {}
      for (const { key } of WORKOUT_TYPES) {
        result[`${key}_ct`] = (ctRes.data || []).filter((r) => r.workout_type === key).sort((a, b) => a.rank - b.rank)
        result[`${key}_ri`] = (riRes.data || []).filter((r) => r.workout_type === key).sort((a, b) => a.rank - b.rank)
      }
      result.lifetime_reps = (repsRes.data || []).sort((a, b) => a.rank - b.rank)
      result.lifetime_victories = (vicRes.data || []).sort((a, b) => a.rank - b.rank)

      setData(result)
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) {
    return <div><h2 className="text-xl font-semibold text-gray-900 mb-6">Leaderboards</h2><p className="text-gray-400">Loading...</p></div>
  }

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
          {WORKOUT_TYPES.map(({ key, label }) => (
            <div key={key}>
              <h3 className="text-base font-medium text-gray-900 mb-3">{label}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <LeaderboardTable title="Fastest Clear Time" rows={data[`${key}_ct`] || []} isTime />
                <LeaderboardTable title="Best Rep Interval" rows={data[`${key}_ri`] || []} isTime={false} />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'lifetime' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LeaderboardTable title="Total Reps" rows={data.lifetime_reps || []} isTime={false} />
          <LeaderboardTable title="Total Victories" rows={data.lifetime_victories || []} isTime={false} />
        </div>
      )}
    </div>
  )
}

function LeaderboardTable({ title, rows, isTime }) {
  const displayRows = rows.length > 0 ? rows : Array.from({ length: 10 }, (_, i) => ({ rank: i + 1, username: '--', value: null }))

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
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
          {displayRows.map((row, i) => {
            const hasData = row.value != null
            return (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-500">#{row.rank}</td>
                <td className={`px-4 py-2 ${hasData ? 'text-gray-900' : 'text-gray-400'}`}>{row.username || '--'}</td>
                <td className={`px-4 py-2 text-right ${hasData ? 'text-gray-900' : 'text-gray-400'}`}>{formatValue(row.value, isTime)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
