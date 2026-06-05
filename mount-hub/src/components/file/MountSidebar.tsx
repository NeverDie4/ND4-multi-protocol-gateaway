'use client'

import { Folder, HardDrive, Home, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { FileItem } from '@/types'

interface MountSidebarProps {
  currentPath: string
  directories: FileItem[]
  provider: string
  onNavigate: (path: string) => void
  onAddMount: () => void
}

export function MountSidebar({ currentPath, directories, provider, onNavigate, onAddMount }: MountSidebarProps) {
  return (
    <aside className="w-56 h-full min-h-0 overflow-hidden border-r border-border bg-card flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">文件工作台</h2>
        <p className="text-xs text-muted-foreground">{provider}</p>
      </div>

      <ScrollArea className="flex-1 min-h-0 overflow-hidden">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-medium text-muted-foreground">挂载入口</h3>
            <Button variant="ghost" size="icon" className="w-5 h-5" onClick={onAddMount}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <button
            onClick={() => onNavigate('/')}
            className={cn('w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors', currentPath === '/' ? 'bg-primary/10 text-primary' : 'hover:bg-muted')}
          >
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1 text-sm font-medium">根目录</span>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </button>
        </div>

        <div className="p-3 pt-0">
          <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">当前目录</h3>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-muted" onClick={() => onNavigate('/')}>
            <Home className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">/</span>
          </button>
          <div className="mt-2 space-y-0.5">
            {directories.map((dir) => (
              <button
                key={dir.id}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-muted"
                onClick={() => dir.path && onNavigate(dir.path)}
              >
                <Folder className="w-4 h-4 text-amber-600" />
                <span className="text-sm truncate">{dir.name}</span>
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" size="sm" disabled>
          <Settings className="w-4 h-4 mr-2" />
          设置
        </Button>
      </div>
    </aside>
  )
}
