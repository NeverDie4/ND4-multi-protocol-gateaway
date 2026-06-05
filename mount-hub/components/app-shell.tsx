'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { SearchDialog } from '@/components/search-dialog'
import { TransferDrawer } from '@/components/transfer-drawer'
import { useAuth } from '@/lib/auth-context'

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  // 路由保护
  useEffect(() => {
    const publicPaths = ['/login', '/register']
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.push('/login')
    }
  }, [isAuthenticated, pathname, router])

  // 登录页和注册页不显示导航栏
  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>
  }

  // 未登录时显示空白
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onSearchClick={() => setIsSearchOpen(true)}
        onTransferClick={() => setIsTransferOpen(true)}
      />
      {children}
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <TransferDrawer isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
    </div>
  )
}
