'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, isReady } = useAuth()

  useEffect(() => {
    if (!isReady) return
    if (isAuthenticated) {
      router.push('/files')
    } else {
      router.push('/login')
    }
  }, [isAuthenticated, isReady, router])

  return null
}
