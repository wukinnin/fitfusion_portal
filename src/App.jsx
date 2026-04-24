import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Admins from './pages/Admins'
import Leaderboards from './pages/Leaderboards'
import Achievements from './pages/Achievements'
import ExportData from './pages/ExportData'
import AdminLogs from './pages/AdminLogs'
import Settings from './pages/Settings'
import ForceResetPassword from './pages/ForceResetPassword'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  // Handle force password reset redirect
  const forceReset = session?.user?.user_metadata?.force_password_reset === true
  if (session && forceReset && location.pathname !== '/force-reset-password') {
    return <Navigate to="/force-reset-password" replace />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <Login />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/force-reset-password"
        element={
          session ? (
            <ForceResetPassword session={session} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        element={
          <ProtectedRoute session={session}>
            <Layout session={session} />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard session={session} />} />
        <Route path="/players" element={<Players />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/export" element={<ExportData />} />
        <Route path="/admin-logs" element={<AdminLogs />} />
        <Route path="/settings" element={<Settings session={session} />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
