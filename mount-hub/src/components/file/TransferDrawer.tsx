'use client'

import { CheckCircle2, Cloud, Download, Pause, Play, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState } from '@/components/common/EmptyState'
import { logMockAction } from '@/lib/api'
import { formatFileSize, mockTransfers } from '@/lib/mock-data'
import type { TransferItem } from '@/types'

interface TransferDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function notify(action: string, item?: TransferItem) {
  logMockAction(action, item)
  toast.success(`${action}成功`)
}

function TransferItemRow({ item }: { item: TransferItem }) {
  return (
    <div className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'upload' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-600'}`}>
          {item.type === 'upload' ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium truncate">{item.name}</p>
            {item.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => notify(item.status === 'transferring' ? '暂停传输' : '继续传输', item)}>
                  {item.status === 'transferring' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-destructive" onClick={() => notify('删除传输任务', item)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{formatFileSize(item.size)}</span><span>•</span><span>{item.progress}%</span></div>
          {item.status !== 'completed' && <Progress value={item.progress} className="h-1 mt-2" />}
        </div>
      </div>
    </div>
  )
}

export function TransferDrawer({ isOpen, onClose }: TransferDrawerProps) {
  const activeTransfers = mockTransfers.filter(t => t.status === 'transferring' || t.status === 'pending')
  const completedTransfers = mockTransfers.filter(t => t.status === 'completed')

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[450px]">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <span>传输列表</span>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => notify('清除已完成')}>
              清除已完成
            </Button>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          {activeTransfers.length > 0 && <div><h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">正在传输 ({activeTransfers.length})</h4><div className="space-y-2">{activeTransfers.map(item => <TransferItemRow key={item.id} item={item} />)}</div></div>}
          {completedTransfers.length > 0 && <div><h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">已完成 ({completedTransfers.length})</h4><div className="space-y-2">{completedTransfers.map(item => <TransferItemRow key={item.id} item={item} />)}</div></div>}
          {mockTransfers.length === 0 && <EmptyState title="暂无传输任务" icon={<Upload className="w-8 h-8 text-muted-foreground/50" />} />}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function TransferBar({ onExpand }: { onExpand: () => void }) {
  const uploadCount = mockTransfers.filter((item) => item.type === 'upload' && item.status === 'transferring').length
  const downloadCount = mockTransfers.filter((item) => item.type === 'download' && item.status === 'transferring').length

  return (
    <button onClick={onExpand} className="h-10 border-t border-border bg-card px-4 flex items-center gap-4 w-full hover:bg-muted/50 transition-colors">
      <Cloud className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">正在上传 {uploadCount} 个文件，下载 {downloadCount} 个文件</span>
      <div className="flex-1 flex justify-center"><Progress value={45} className="h-1 w-24" /></div>
    </button>
  )
}
