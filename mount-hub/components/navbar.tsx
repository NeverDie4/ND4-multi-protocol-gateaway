'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ArrowUpDown, User, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

interface NavbarProps {
  onSearchClick?: () => void
  onTransferClick?: () => void
}

export function Navbar({ onSearchClick, onTransferClick }: NavbarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const navItems = [
    { href: '/workspace', label: '文件工作台' },
    { href: '/admin', label: '管理中心' },
  ]

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo 区域 */}
        <div className="flex items-center gap-8">
          <Link href="/workspace" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <HardDrive className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-base text-foreground">MountHub</span>
          </Link>

          {/* 导航项 */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 右侧工具区 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-lg"
            onClick={onSearchClick}
          >
            <Search className="w-4.5 h-4.5 text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 rounded-lg relative"
            onClick={onTransferClick}
          >
            <ArrowUpDown className="w-4.5 h-4.5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                个人设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
