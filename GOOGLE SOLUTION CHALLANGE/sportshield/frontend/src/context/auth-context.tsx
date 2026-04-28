'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  role: string
  walletAddress?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, displayName: string, role: string, walletAddress?: string) => Promise<void>
  logout: () => void
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // On mount, check if we have a stored token and try to get user profile
    const token = localStorage.getItem('ath_token')
    if (token) {
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.uid) {
            setUser({
              uid: data.uid,
              email: data.email,
              displayName: data.display_name,
              role: data.role,
              walletAddress: data.wallet_address,
            })
          } else {
            localStorage.removeItem('ath_token')
          }
        })
        .catch(() => {
          localStorage.removeItem('ath_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Login failed')
    if (data.uid) {
      const token = `demo_${data.uid}`
      localStorage.setItem('ath_token', token)
      setUser({
        uid: data.uid,
        email: data.email,
        displayName: data.display_name,
        role: data.role,
      })
    }
  }

  const signup = async (
    email: string,
    password: string,
    displayName: string,
    role: string,
    walletAddress?: string
  ) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        display_name: displayName,
        role,
        wallet_address: walletAddress,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || 'Signup failed')
  }

  const logout = () => {
    localStorage.removeItem('ath_token')
    setUser(null)
  }

  const getToken = () => {
    return localStorage.getItem('ath_token')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
