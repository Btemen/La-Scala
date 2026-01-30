'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { data, error } = await signUp(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="mb-10">
            <Link href="/" className="font-serif text-3xl font-light tracking-[8px] uppercase text-charcoal">
              La Scala
            </Link>
          </div>
          <div className="bg-white border border-light-gray p-8">
            <div className="w-16 h-16 bg-soft-green rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green text-2xl">✓</span>
            </div>
            <h2 className="font-serif text-2xl mb-4">Check your email</h2>
            <p className="text-warm-gray text-sm mb-6">
              We've sent a confirmation link to <strong>{email}</strong>. 
              Click the link to activate your account.
            </p>
            <Link 
              href="/signin"
              className="inline-block px-8 py-3 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl font-light tracking-[8px] uppercase text-charcoal">
            La Scala
          </Link>
          <p className="text-warm-gray mt-4 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-light-gray p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-xs tracking-wide uppercase text-warm-gray mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-light-gray focus:border-charcoal outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs tracking-wide uppercase text-warm-gray mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-light-gray focus:border-charcoal outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="mb-8">
            <label className="block text-xs tracking-wide uppercase text-warm-gray mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-light-gray focus:border-charcoal outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-[11px] text-warm-gray mt-4 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </form>

        <p className="text-center mt-6 text-sm text-warm-gray">
          Already have an account?{' '}
          <Link href="/signin" className="text-charcoal underline hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}