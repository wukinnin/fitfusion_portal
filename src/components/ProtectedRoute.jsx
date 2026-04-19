import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ session, children }) {
  const [isAdmin, setIsAdmin] = useState(null)

  useEffect(() => {
    if (!session) return

    async function checkAdmin() {
      const { data, error } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', session.user.id)
        .eq('role', 'admin')
        .single()

      if (error || !data) {
        await supabase.auth.signOut()
        setIsAdmin(false)
      } else {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [session])

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Verifying admin access...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}
