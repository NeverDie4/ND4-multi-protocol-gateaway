'use client'

import { X, FileText, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FileItem } from '@/types'
import { formatFileSize } from '@/lib/mock-data'

interface FileDetailDrawerProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
}

// 文件预览图标
function FilePreviewIcon({ extension }: { extension?: string }) {
  const getIconColor = () => {
    switch (extension) {
      case 'pdf': return 'text-red-500'
      case 'xlsx':
      case 'xls': return 'text-green-600'
      case 'doc':
      case 'docx': return 'text-blue-600'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="w-full aspect-[4/3] bg-muted/50 rounded-xl flex items-center justify-center">
      <div className="w-16 h-20 bg-card rounded-lg shadow-sm border border-border flex flex-col items-center justify-center">
        <FileText className={`w-8 h-8 ${getIconColor()}`} />
        {extension && (
          <span className="text-[10px] font-medium text-muted-foreground uppercase mt-1">
            {extension}
          </span>
        )}
      </div>
    </div>
  )
}

export function FileDetailDrawer({ file, isOpen, onClose }: FileDetailDrawerProps) {
  if (!isOpen || !file) return null

  const getFileTypeLabel = () => {
    switch (file.extension) {
      case 'pdf': return 'PDF 文档'
      case 'xlsx':
      case 'xls': return '电子表格'
      case 'doc':
      case 'docx': return 'Word 文档'
      default: return '文件'
    }
  }

  return (
    <div className="w-72 border-l border-border bg-card flex flex-col h-full">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-medium text-sm">文件信息</h3>
        <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 文件预览区 */}
        <FilePreviewIcon extension={file.extension} />

        {/* 文件名 */}
        <h4 className="font-semibold text-sm mt-4 mb-2 text-balance leading-snug">
          {file.name}
        </h4>
        
        {/* 文件类型标签 */}
        <Badge variant="secondary" className="text-xs font-normal">
          {getFileTypeLabel()} • {formatFileSize(file.size)}
        </Badge>

        {/* 分隔线 */}
        <div className="h-px bg-border my-4" />

        {/* 详细信息 */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">路径</p>
            <p className="text-sm break-all">{file.path || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">协议</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">Local</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">权限</p>
            <code className="text-sm bg-muted px-1.5 py-0.5 rounded font-mono">
              {file.permissions || 'rw-r--r--'}
            </code>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">创建时间</p>
            <p className="text-sm">{file.created || '-'}</p>
          </div>
        </div>
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full justify-center text-primary border-primary/30 hover:bg-primary/5"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          在外部打开
        </Button>
      </div>
    </div>
  )
}
