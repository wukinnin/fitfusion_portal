import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()

  // Step: 'login' | 'otp' | 'set-password'
  const [step, setStep] = useState('login')

  // Login fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // OTP field
  const [otpToken, setOtpToken] = useState('')

  // Set new password fields
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Step 1: Login with email + temp password
  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Verify the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('id', data.user.id)
      .single()

    if (adminError || !adminData) {
      await supabase.auth.signOut()
      setError('Access denied. This account is not an admin.')
      setLoading(false)
      return
    }

    // Check if email is verified
    const isVerified = !!data.user.email_confirmed_at
    if (!isVerified) {
      // Send OTP for email verification
      const { error: otpError } = await supabase.auth.signInWithOtp({ email })
      if (otpError) {
        setError('Failed to send verification code: ' + otpError.message)
        setLoading(false)
        return
      }
      setStep('otp')
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/')
  }

  // Step 2: Verify OTP code
  async function handleVerifyOtp(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpToken,
      type: 'email',
    })

    if (verifyError) {
      setError('Invalid verification code: ' + verifyError.message)
      setLoading(false)
      return
    }

    setStep('set-password')
    setLoading(false)
  }

  // Step 3: Force set new password (min 10 chars)
  async function handleSetPassword(e) {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.')
      return
    }

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError('Failed to set password: ' + updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">FitFusion</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">

          {/* Step 1: Login */}
          {step === 'login' && (
            <>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Sign In</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {step === 'otp' && (
            <>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Verify Your Email</h2>
              <p className="text-sm text-gray-500 mb-4">
                A verification code has been sent to <span className="font-medium text-gray-900">{email}</span>. Enter it below.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456"
                    autoComplete="one-time-code"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </form>
            </>
          )}

          {/* Step 3: Set New Password */}
          {step === 'set-password' && (
            <>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Set New Password</h2>
              <p className="text-sm text-gray-500 mb-4">
                Your email is verified. Please set a new password (minimum 10 characters).
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSetPassword} className="space-y-4">
                <div>
                  <label htmlFor="newPw" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="newPw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmNewPw" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPw"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    minLength={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Setting password...' : 'Set Password & Continue'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  )
}
