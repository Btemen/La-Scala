'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import { useState } from 'react'

export default function Header() {
  const { user, loading, signOut } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setShowDropdown(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-12 py-5 bg-cream/97 backdrop-blur-md border-b border-light-gray">
      <div className="max-w-[1600px] mx-auto flex justify-between items-center">
        <Link href="/" className="font-serif text-2xl font-light tracking-[6px] uppercase text-charcoal">
          La Scala
        </Link>
        <div className="flex items-center gap-9">
          <ul className="flex gap-9">
            {['Collections', 'Houses', 'Pre-Owned', 'Journal'].map((item) => (
              <li key={item}>
                <Link 
                  href="#" 
                  className="text-[11px] font-normal tracking-[1.5px] uppercase text-charcoal hover:opacity-60 transition-opacity"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          
          {loading ? (
            <div className="w-20 h-4 bg-light-gray animate-pulse"></div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 text-[11px] font-normal tracking-[1.5px] uppercase text-charcoal hover:opacity-60 transition-opacity"
              >
                <span className="w-8 h-8 bg-charcoal text-white rounded-full flex items-center justify-center text-xs">
                  {user.email?.[0]?.toUpperCase()}
                </span>
                Account
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-light-gray shadow-lg">
                  <div className="px-4 py-3 border-b border-light-gray">
                    <p className="text-xs text-warm-gray truncate">{user.email}</p>
                  </div>
                  <Link 
                    href="/account"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-sm hover:bg-cream transition-colors"
                  >
                    My Account
                  </Link>
                  <Link 
                    href="/account/listings"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-sm hover:bg-cream transition-colors"
                  >
                    My Listings
                  </Link>
                  <Link 
                    href="/sell"
                    onClick={() => setShowDropdown(false)}
                    className="block px-4 py-3 text-sm hover:bg-cream transition-colors"
                  >
                    Sell an Item
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-cream transition-colors border-t border-light-gray"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/signin"
              className="text-[11px] font-normal tracking-[1.5px] uppercase text-charcoal hover:opacity-60 transition-opacity"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}