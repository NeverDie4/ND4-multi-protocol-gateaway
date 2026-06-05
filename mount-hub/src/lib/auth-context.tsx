'use client'

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { authApi, clearAuthStorage, getToken, onAuthExpired, setToken } from '@/lib/api'
import type { AuthUser, BackendUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isReady: boolean
  login: (username: string, password: string, otpCode?: string) => Promise<boolean>
  logout: () => Promise<void>
  register: (username: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function toAuthUser(user: BackendUser): AuthUser {
  const isAdmin = user.role_names?.includes('admin') || user.role?.includes(1)
  return {
    id: String(user.id),
    name: user.username,
    username: user.username,
    email: user.username,
    isAdmin,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isReady, setIsReady] = useState(false)

  const clearSession = () => {
    clearAuthStorage()
    setUser(null)
  }

  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      const token = getToken()
      if (!token) {
        setIsReady(true)
        return
      }

      try {
        const current = await authApi.currentUser()
        if (!cancelled) {
          setUser(toAuthUser(current))
        }
      } catch {
        clearAuthStorage()
        if (!cancelled) {
          setUser(null)
        }
      } finally {
        if (!cancelled) {
          setIsReady(true)
        }
      }
    }

    restoreSession()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => onAuthExpired(clearSession), [])

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isReady,
      async login(username, password, otpCode) {
        const result = await authApi.login(username, password, otpCode)
        setToken(result.token)
        const current = await authApi.currentUser()
        setUser(toAuthUser(current))
        return true
      },
      async logout() {
        try {
          await authApi.logout()
        } finally {
          clearSession()
        }
      },
      async register(username, password) {
        await authApi.register(username, password)
      },
    }),
    [isReady, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
