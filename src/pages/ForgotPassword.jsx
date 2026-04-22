import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const RESEND_COOLDOWN_SECONDS = 30

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState('email') // 'email' | 'code' | 'password' | 'success'
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const cooldownTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    }
  }, [])

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_SECONDS)
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    cooldownTimerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownTimerRef.current)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  async function handleRequestCode(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const trimmedEmail = email.trim()

    // Admin gating
    const { data: isAdmin, error: rpcError } = await supabase.rpc('is_email_admin', {
      p_email: trimmedEmail,
    })

    if (rpcError) {
      setError('Could not verify email. Please try again.')
      setLoading(false)
      return
    }

    if (!isAdmin) {
      setError('This email is not registered as an admin.')
      setLoading(false)
      return
    }

    // Send OTP
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(trimmedEmail)

    if (sendError) {
      setError(sendError.message)
      setLoading(false)
      return
    }

    setEmail(trimmedEmail)
    setStep('code')
    setLoading(false)
    startCooldown()
  }

  async function handleResendCode() {
    if (cooldown > 0 || resending) return
    setError('')
    setResending(true)

    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email)

    if (sendError) {
      setError(sendError.message)
      setResending(false)
      return
    }

    setResending(false)
    startCooldown()
  }

  async function handleVerifyCode(e) {
    e.preventDefault()
    setError('')

    const token = code.trim()
    if (token.length < 6) {
      setError('Please enter the 6-digit code.')
      return
    }

    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    })

    if (verifyError) {
      setError(verifyError.message || 'Invalid or expired code.')
      setLoading(false)
      return
    }

    setStep('password')
    setLoading(false)
  }

  async function handleUpdatePassword(e) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setStep('success')

    setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login')
    }, 2000)
  }

  async function handleBackToEmail() {
    setError('')
    setCode('')
    // If an OTP session was established, clear it
    await supabase.auth.signOut()
    setStep('email')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">FitFusion</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {step === 'email' && 'Reset Password'}
            {step === 'code' && 'Enter Verification Code'}
            {step === 'password' && 'Set New Password'}
            {step === 'success' && 'Password Updated'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 'email' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Enter your admin email and we'll send you a 6-digit verification code.
              </p>

              <form onSubmit={handleRequestCode} className="space-y-4">
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
                    autoComplete="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800">
                  Back to login
                </Link>
              </div>
            </>
          )}

          {step === 'code' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>.
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>

              <div className="mt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={cooldown > 0 || resending}
                  className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {resending
                    ? 'Sending...'
                    : cooldown > 0
                    ? `Resend code (${cooldown}s)`
                    : 'Resend code'}
                </button>
              </div>
            </>
          )}

          {step === 'password' && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Enter your new password below.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
              Password updated successfully. Redirecting to login...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
