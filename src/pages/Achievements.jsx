const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', description: 'Complete your first session (win or lose)', unlockCount: 0 },
  { id: 'iron_will', name: 'Iron Will', description: 'Complete 30 total sessions', unlockCount: 0 },
  { id: 'blood_pumper', name: 'Blood Pumper', description: 'Reach 300 lifetime reps', unlockCount: 0 },
  { id: 'survivor', name: 'Survivor', description: 'Complete 100 total rounds', unlockCount: 0 },
  { id: 'halfway_hero', name: 'Halfway Hero', description: 'Reach 5 rounds in a single session', unlockCount: 0 },
  { id: 'monster_hunter', name: 'Monster Hunter', description: 'Win a full 10-round session', unlockCount: 0 },
  { id: 'triple_crown', name: 'Triple Crown', description: 'Win at least one session in all 3 workout types', unlockCount: 0 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Best rep interval under 1.8 seconds', unlockCount: 0 },
  { id: 'blinding_steel', name: 'Blinding Steel', description: 'Win with average rep interval under 2.3 seconds', unlockCount: 0 },
  { id: 'untouchable', name: 'Untouchable', description: 'Win with 0 lives lost', unlockCount: 0 },
  { id: 'last_stand', name: 'Last Stand', description: 'Win with exactly 2 lives lost', unlockCount: 0 },
]

export default function Achievements() {
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
            {ACHIEVEMENTS.map((a, i) => (
              <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                <td className="px-4 py-3 text-gray-600">{a.description}</td>
                <td className="px-4 py-3 text-right">
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-500">
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
