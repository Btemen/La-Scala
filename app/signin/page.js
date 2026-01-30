'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-serif text-3xl font-light tracking-[8px] uppercase text-charcoal">
            La Scala
          </Link>
          <p className="text-warm-gray mt-4 text-sm">Sign in to your account</p>
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

          <div className="mb-8">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-charcoal text-white text-xs tracking-[2px] uppercase hover:bg-charcoal/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-warm-gray">
          Don't have an account?{' '}
          <Link href="/signup" className="text-charcoal underline hover:no-underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  )
}