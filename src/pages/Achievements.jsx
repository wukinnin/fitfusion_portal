import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Achievements() {
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [achRes, countsRes] = await Promise.all([
        supabase.from('achievements').select('id, code, title, description').order('id'),
        supabase.from('user_achievements').select('achievement_id'),
      ])

      const countMap = {}
      for (const row of (countsRes.data || [])) {
        countMap[row.achievement_id] = (countMap[row.achievement_id] || 0) + 1
      }

      const list = (achRes.data || []).map((a) => ({
        ...a,
        unlockCount: countMap[a.id] || 0,
      }))

      setAchievements(list)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div><h2 className="text-xl font-semibold text-gray-900 mb-2">Achievement Integrity</h2><p className="text-gray-400">Loading...</p></div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Achievement Integrity</h2>
      <p className="text-sm text-gray-500 mb-6">
        Overview of all 11 achievements and how many users have unlocked each one.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-500 w-10">#</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Achievement</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Description</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Unlocked By</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map((a, i) => (
              <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                <td className="px-4 py-3 text-gray-600">{a.description}</td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                    a.unlockCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {a.unlockCount} users
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
