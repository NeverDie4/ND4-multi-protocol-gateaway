'use client'

import { Download, Eye, File, FileSpreadsheet, FileText, Folder, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { FileItem } from '@/types'

interface FileTableProps {
  files: FileItem[]
  selectedFileId: string | null
  loading?: boolean
  onSelect: (id: string) => void
  onOpen: (file: FileItem) => void
  onPreview: (file: FileItem) => void
  onDownload: (file: FileItem) => void
  onRename: (file: FileItem) => void
  onDelete: (file: FileItem) => void
}

function FileIcon({ file }: { file: FileItem }) {
  const iconClass = 'w-5 h-5'
  if (file.type === 'folder') {
    return <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center"><Folder className={cn(iconClass, 'text-amber-600')} /></div>
  }
  switch (file.extension) {
    case 'pdf':
      return <div className="w-7 h-7 rounded-md bg-red-100 flex items-center justify-center"><FileText className={cn(iconClass, 'text-red-600')} /></div>
    case 'xlsx':
    case 'xls':
      return <div className="w-7 h-7 rounded-md bg-green-100 flex items-center justify-center"><FileSpreadsheet className={cn(iconClass, 'text-green-600')} /></div>
    case 'doc':
    case 'docx':
      return <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center"><FileText className={cn(iconClass, 'text-blue-600')} /></div>
    default:
      return <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center"><File className={cn(iconClass, 'text-gray-500')} /></div>
  }
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

export function FileTable({
  files,
  selectedFileId,
  loading,
  onSelect,
  onOpen,
  onPreview,
  onDownload,
  onRename,
  onDelete,
}: FileTableProps) {
  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-card border-b border-border">
          <tr className="text-left text-xs text-muted-foreground">
            <th className="py-2.5 px-4 font-medium">名称</th>
            <th className="py-2.5 px-4 font-medium">类型</th>
            <th className="py-2.5 px-4 font-medium">大小</th>
            <th className="py-2.5 px-4 font-medium">修改时间</th>
            <th className="py-2.5 px-4 font-medium">操作</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {loading && (
            <tr>
              <td className="py-10 text-center text-sm text-muted-foreground" colSpan={5}>正在加载文件...</td>
            </tr>
          )}
          {!loading && files.length === 0 && (
            <tr>
              <td className="py-10 text-center text-sm text-muted-foreground" colSpan={5}>当前目录为空</td>
            </tr>
          )}
          {!loading && files.map((file) => (
            <tr
              key={file.id}
              className={cn(
                'group border-b border-border last:border-0 cursor-pointer transition-colors',
                selectedFileId === file.id ? 'bg-primary/5' : 'hover:bg-muted/50',
              )}
              onClick={() => {
                onSelect(file.id)
                onOpen(file)
              }}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <FileIcon file={file} />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">{file.fileType || '-'}</td>
              <td className="py-3 px-4 text-sm text-muted-foreground">{formatFileSize(file.size)}</td>
              <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">{file.modified}</td>
              <td className="py-3 px-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onSelect(file.id)}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onPreview(file)}>
                      <Eye className="w-4 h-4 mr-2" />
                      详情
                    </DropdownMenuItem>
                    {file.type === 'file' && (
                      <DropdownMenuItem onClick={() => onDownload(file)}>
                        <Download className="w-4 h-4 mr-2" />
                        下载
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onRename(file)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      重命名
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(file)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
