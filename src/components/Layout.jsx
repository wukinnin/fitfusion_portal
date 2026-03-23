import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Layout({ session }) {
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded text-sm ${
      isActive
        ? 'bg-gray-200 text-gray-900 font-medium'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">FitFusion</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>

          {/* Placeholder links for future pages */}
          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Management
            </p>
            <span className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
              Users
            </span>
            <span className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
              Sessions
            </span>
            <span className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
              Leaderboards
            </span>
            <span className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed">
              Achievements
            </span>
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-gray-200">
          <p className="px-4 text-xs text-gray-500 truncate mb-2">
            {session?.user?.email}
          </p>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded text-left cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
