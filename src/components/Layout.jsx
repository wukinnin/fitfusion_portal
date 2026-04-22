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
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">FitFusion</h1>
          <p className="text-xs text-gray-500 mt-0.5">Admin Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Overview
          </p>
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              Data Management
            </p>
            <NavLink to="/players" className={linkClass}>
              Players
            </NavLink>
            <NavLink to="/admins" className={linkClass}>
              Admins
            </NavLink>
            <NavLink to="/leaderboards" className={linkClass}>
              Leaderboards
            </NavLink>
            <NavLink to="/achievements" className={linkClass}>
              Achievements
            </NavLink>
            <NavLink to="/export" className={linkClass}>
              Export Data
            </NavLink>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <NavLink to="/admin-logs" className={linkClass}>
              Admin Logs
            </NavLink>
          </div>

          <div className="pt-4 mt-4 border-t border-gray-200">
            <NavLink to="/settings" className={linkClass}>
              Settings
            </NavLink>
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
      <main className="flex-1 p-8 overflow-x-auto min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
