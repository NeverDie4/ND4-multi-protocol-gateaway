'use client'

import { ExternalLink, FileText, Folder, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FileItem } from '@/types'

interface FileDetailDrawerProps {
  file: FileItem | null
  isOpen: boolean
  provider?: string
  onClose: () => void
  onDownload: (file: FileItem) => void
}

function formatFileSize(size?: number) {
  if (!size) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = size
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`
}

export function FileDetailDrawer({ file, isOpen, provider = 'unknown', onClose, onDownload }: FileDetailDrawerProps) {
  if (!isOpen || !file) return null

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-medium text-sm">文件信息</h3>
        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="w-full aspect-[4/3] bg-muted/50 rounded-xl flex items-center justify-center">
          <div className="w-16 h-20 bg-card rounded-lg shadow-sm border border-border flex flex-col items-center justify-center">
            {file.type === 'folder' ? <Folder className="w-8 h-8 text-amber-600" /> : <FileText className="w-8 h-8 text-primary" />}
            <span className="text-[10px] font-medium text-muted-foreground uppercase mt-1">
              {file.type === 'folder' ? 'DIR' : file.extension || 'FILE'}
            </span>
          </div>
        </div>
        <h4 className="font-semibold text-sm mt-4 mb-2 text-balance leading-snug">{file.name}</h4>
        <div className="h-px bg-border my-4" />
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">路径</p>
            <p className="text-sm break-all">{file.path || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">存储驱动</p>
            <p className="text-sm">{provider}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">大小</p>
            <p className="text-sm">{formatFileSize(file.size)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">修改时间</p>
            <p className="text-sm">{file.modified || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">创建时间</p>
            <p className="text-sm">{file.created || '-'}</p>
          </div>
        </div>
      </div>
      {file.type === 'file' && (
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            className="w-full justify-center text-primary border-primary/30 hover:bg-primary/5"
            onClick={() => onDownload(file)}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            下载文件
          </Button>
        </div>
      )}
    </div>
  )
}
