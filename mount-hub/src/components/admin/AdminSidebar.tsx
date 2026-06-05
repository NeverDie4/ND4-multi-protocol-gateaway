'use client'

import { Code2, FileText, Gauge, Globe, HardDrive, Shield, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockAdminCategories } from '@/lib/mock-data'
import type { AdminCategoryId } from '@/types'

const iconMap = {
  'hard-drive': HardDrive,
  users: Users,
  globe: Globe,
  shield: Shield,
  gauge: Gauge,
  network: Code2,
}

interface AdminSidebarProps {
  activeCategory: AdminCategoryId
  onCategoryChange: (category: AdminCategoryId) => void
}

export function AdminSidebar({ activeCategory, onCategoryChange }: AdminSidebarProps) {
  return (
    <aside className="w-56 border-r border-sidebar-border bg-sidebar flex flex-col">
      <div className="p-4 pb-2">
        <h2 className="font-semibold">管理中心</h2>
        <p className="text-xs text-muted-foreground">系统配置</p>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {mockAdminCategories.filter(c => c.id !== 'webdav' && c.id !== 'https').map((category) => {
          const Icon = iconMap[category.icon as keyof typeof iconMap]
          const isActive = activeCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors', isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground')}
            >
              <Icon className="w-4.5 h-4.5" />
              <span className="text-sm">{category.name}</span>
            </button>
          )
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors">
          <FileText className="w-4.5 h-4.5" />
          <span className="text-sm">文档</span>
        </button>
      </div>
    </aside>
  )
}
