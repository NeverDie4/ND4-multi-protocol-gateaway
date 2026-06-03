'use client'

import { Cloud } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface TransferBarProps {
  onExpand: () => void
}

export function TransferBar({ onExpand }: TransferBarProps) {
  // Mock 数据：当前有传输任务
  const uploadCount = 2
  const downloadCount = 1

  return (
    <button
      onClick={onExpand}
      className="h-10 border-t border-border bg-card px-4 flex items-center gap-4 w-full hover:bg-muted/50 transition-colors"
    >
      <Cloud className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        正在上传 {uploadCount} 个文件，下载 {downloadCount} 个文件
      </span>
      
      <div className="flex-1 flex justify-center">
        <Progress value={45} className="h-1 w-24" />
      </div>
    </button>
  )
}
