import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Settings({ session }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const currentEmail = session?.user?.email || ''

  // Change email state
  const [emailCurrentPw, setEmailCurrentPw] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' })
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailStep, setEmailStep] = useState('form') // 'form' | 'otp'
  const [otpCode, setOtpCode] = useState('')

  useEffect(() => {
    async function fetchUsername() {
      if (!session?.user?.id) return
      const { data } = await supabase
        .from('users')
        .select('username')
        .eq('id', session.user.id)
        .single()
      if (data) {
        setUsername(data.username)
      }
    }
    fetchUsername()
  }, [session?.user?.id])

  // Change password state
  const [pwCurrentPw, setPwCurrentPw] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })
  const [pwLoading, setPwLoading] = useState(false)

  // Delete account state
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteMsg, setDeleteMsg] = useState({ type: '', text: '' })
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Re-authenticate by signing in with current password
  async function reAuth(password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password,
    })
    return error
  }

  async function logAdminAction(action, details) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Fetch snapshot for actor to ensure log immutability
    const snapshots = { _actor: { email: user.email } }
    
    // Get actor username from our users table
    const { data: actorData } = await supabase.from('users').select('username').eq('id', user.id).single()
    if (actorData) snapshots._actor.username = actorData.username

    await supabase.from('admin_logs').insert({
      actor_user_id: user.id,
      action,
      target_kind: 'user',
      target_user_id: null, // Self-action, no target user ID
      details: { ...details, ...snapshots },
    })
  }

  async function handleChangeEmail(e) {
    e.preventDefault()
    setEmailMsg({ type: '', text: '' })

    if (newEmail !== confirmEmail) {
      setEmailMsg({ type: 'error', text: 'Emails do not match.' })
      return
    }

    setEmailLoading(true)

    // Verify current password
    const reAuthError = await reAuth(emailCurrentPw)
    if (reAuthError) {
      setEmailMsg({ type: 'error', text: 'Current password is incorrect.' })
      setEmailLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail })

    if (error) {
      setEmailMsg({ type: 'error', text: error.message })
    } else {
      setEmailStep('otp')
      setEmailMsg({
        type: 'success',
        text: 'A 6-digit verification code has been sent to your new email address.',
      })
    }

    setEmailLoading(false)
  }

  async function handleVerifyEmailOtp(e) {
    e.preventDefault()
    setEmailMsg({ type: '', text: '' })
    
    if (otpCode.length < 6) {
      setEmailMsg({ type: 'error', text: 'Please enter the 6-digit code.' })
      return
    }

    setEmailLoading(true)

    const { error } = await supabase.auth.verifyOtp({
      email: newEmail,
      token: otpCode,
      type: 'email_change',
    })

    if (error) {
      setEmailMsg({ type: 'error', text: error.message || 'Invalid or expired code.' })
      setEmailLoading(false)
      return
    }

    await logAdminAction('Changed own email', { old_email: currentEmail, new_email: newEmail })

    setEmailMsg({ type: 'success', text: 'Email updated successfully. Logging out...' })
    
    setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login')
    }, 2000)
  }

  async function handleResendEmailOtp() {
    setEmailMsg({ type: '', text: '' })
    setEmailLoading(true)

    const { error } = await supabase.auth.updateUser({ email: newEmail })

    if (error) {
      setEmailMsg({ type: 'error', text: error.message })
    } else {
      setEmailMsg({ type: 'success', text: 'A new verification code has been sent.' })
    }

    setEmailLoading(false)
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwMsg({ type: '', text: '' })

    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    if (newPassword.length < 10) {
      setPwMsg({ type: 'error', text: 'Password must be at least 10 characters.' })
      return
    }

    setPwLoading(true)

    // Verify current password
    const reAuthError = await reAuth(pwCurrentPw)
    if (reAuthError) {
      setPwMsg({ type: 'error', text: 'Current password is incorrect.' })
      setPwLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPwMsg({ type: 'error', text: error.message })
    } else {
      await logAdminAction('Changed own password')
      setPwMsg({ type: 'success', text: 'Password updated successfully.' })
      setPwCurrentPw('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setPwLoading(false)
  }

  async function handleDeleteAccount(e) {
    e.preventDefault()
    setDeleteMsg({ type: '', text: '' })
    setDeleteLoading(true)

    // Verify current password
    const reAuthError = await reAuth(deletePassword)
    if (reAuthError) {
      setDeleteMsg({ type: 'error', text: 'Current password is incorrect.' })
      setDeleteLoading(false)
      return
    }

    await logAdminAction('Deleted own account', { email: currentEmail })

    // Call delete-admin RPC
    const { data, error } = await supabase.rpc('rpc_delete_user', {
      target_user_id: session.user.id,
    })

    // Sign out and redirect to login
    await supabase.auth.signOut()
    navigate('/login')
  }

  function MessageBox({ msg }) {
    if (!msg.text) return null
    const isError = msg.type === 'error'
    return (
      <div
        className={`mb-4 p-3 rounded text-sm border ${
          isError
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}
      >
        {msg.text}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-sm font-bold text-gray-900 mb-1">
          {username || 'Admin'}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          Current email: <span className="font-medium text-gray-900">{currentEmail}</span>
        </p>
        <p className="text-xs text-gray-400">
          User ID: {session?.user?.id}
        </p>
      </div>

      {/* Change Email */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Change Email</h3>
        <MessageBox msg={emailMsg} />

        {emailStep === 'form' ? (
          <form onSubmit={handleChangeEmail} className="space-y-3">
            <div>
              <label htmlFor="emailCurrentPw" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                id="emailCurrentPw"
                type="password"
                value={emailCurrentPw}
                onChange={(e) => setEmailCurrentPw(e.target.value)}
                required
                className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                New Email
              </label>
              <input
                id="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="new@example.com"
              />
            </div>
            <div>
              <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Email
              </label>
              <input
                id="confirmEmail"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
                className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="new@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={emailLoading}
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {emailLoading ? 'Updating...' : 'Update Email'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              We sent a 6-digit code to <span className="font-medium text-gray-900">{newEmail}</span>.
            </p>

            <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
              <div>
                <label htmlFor="otpCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  id="otpCode"
                  type="text"
                  inputMode="numeric"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000000"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {emailLoading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailStep('form')
                    setEmailMsg({ type: '', text: '' })
                    setOtpCode('')
                  }}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleResendEmailOtp}
                disabled={emailLoading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                Resend code
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-base font-medium text-gray-900 mb-4">Change Password</h3>
        <MessageBox msg={pwMsg} />

        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label htmlFor="pwCurrentPw" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              id="pwCurrentPw"
              type="password"
              value={pwCurrentPw}
              onChange={(e) => setPwCurrentPw(e.target.value)}
              required
              className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={10}
              className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPw" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={10}
              className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={pwLoading}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <h3 className="text-base font-medium text-red-700 mb-1">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete your admin account. This disassociates your email and cannot be undone.
        </p>

        <MessageBox msg={deleteMsg} />

        <form onSubmit={handleDeleteAccount} className="space-y-3">
          <div>
            <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
              className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            ARE YOU SURE YOU WANT TO DELETE YOUR ACCOUNT? THIS DISASSOCIATES YOUR EMAIL. THIS CANNOT BE UNDONE.
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setDeletePassword('')
                setDeleteMsg({ type: '', text: '' })
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleteLoading}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
