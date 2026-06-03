'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppHeader } from '@/components/common/AppHeader'
import { SearchDialog } from '@/components/search-dialog'
import { TransferDrawer } from '@/components/file/TransferDrawer'
import { useAuth } from '@/lib/auth-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, isReady } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  useEffect(() => {
    if (isReady && !isAuthenticated && pathname !== '/login') {
      router.push('/login')
    }
    if (isReady && isAuthenticated && (pathname === '/admin' || pathname.startsWith('/admin/')) && !user?.isAdmin) {
      router.replace('/files')
    }
  }, [isAuthenticated, isReady, pathname, router, user?.isAdmin])

  if (pathname === '/login') {
    return <>{children}</>
  }

  if (!isReady || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        onSearchClick={() => setIsSearchOpen(true)}
        onTransferClick={() => setIsTransferOpen(true)}
      />
      {children}
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <TransferDrawer isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
    </div>
  )
}
