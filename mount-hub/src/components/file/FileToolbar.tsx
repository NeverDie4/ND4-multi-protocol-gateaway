'use client'

import { ChevronRight, FolderPlus, Grid2X2, List, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileToolbarProps {
  breadcrumbPath: Array<{ label: string; path: string }>
  viewMode: 'list' | 'grid'
  writable: boolean
  onNavigate: (path: string) => void
  onViewModeChange: (mode: 'list' | 'grid') => void
  onRefresh: () => void
  onCreateFolder: () => void
  onUpload: () => void
}

export function FileToolbar({
  breadcrumbPath,
  viewMode,
  writable,
  onNavigate,
  onViewModeChange,
  onRefresh,
  onCreateFolder,
  onUpload,
}: FileToolbarProps) {
  return (
    <div className="px-4 py-3 border-b border-border bg-card">
      <nav className="flex items-center gap-1 text-sm mb-3">
        {breadcrumbPath.map((item, index) => (
          <div key={item.path} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <button
              className={cn(
                'px-1.5 py-0.5 rounded hover:bg-muted transition-colors',
                index === breadcrumbPath.length - 1 ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
              onClick={() => onNavigate(item.path)}
            >
              {item.label}
            </button>
          </div>
        ))}
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={onUpload} disabled={!writable}>
            <Upload className="w-4 h-4 mr-1.5" />
            上传
          </Button>
          <Button variant="outline" size="sm" onClick={onCreateFolder} disabled={!writable}>
            <FolderPlus className="w-4 h-4 mr-1.5" />
            新建文件夹
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <div className="w-px h-5 bg-border mx-1" />
          <div className="flex items-center border border-border rounded-lg p-0.5">
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="w-7 h-7" onClick={() => onViewModeChange('list')}>
              <List className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="w-7 h-7" onClick={() => onViewModeChange('grid')}>
              <Grid2X2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
