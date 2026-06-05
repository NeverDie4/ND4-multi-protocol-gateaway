'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Cloud, Download, Pause, Play, RefreshCw, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { EmptyState } from '@/components/common/EmptyState'
import { fileApi } from '@/lib/api'
import { formatFileSize } from '@/lib/mock-data'
import type { TransferItem } from '@/types'

const TRANSFERS_CHANGED_EVENT = 'mounthub:transfers-changed'

interface TransferDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function useTransfers(polling = true) {
  const [transfers, setTransfers] = useState<TransferItem[]>([])
  const [loading, setLoading] = useState(false)
  const requestSeqRef = useRef(0)

  const showLocalTransfers = useCallback(() => {
    const localTransfers = fileApi.listLocalTransfers()
    if (localTransfers.length === 0) return
    setTransfers((current) => {
      const byId = new Map(current.map((item) => [item.id, item]))
      for (const item of localTransfers) {
        byId.set(item.id, item)
      }
      return Array.from(byId.values())
    })
  }, [])

  const loadTransfers = useCallback(async () => {
    const requestSeq = ++requestSeqRef.current
    setLoading(true)
    try {
      const next = await fileApi.listTransfers()
      if (requestSeq === requestSeqRef.current) {
        setTransfers(next)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载传输任务失败')
    } finally {
      if (requestSeq === requestSeqRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    void loadTransfers()
    if (!polling) return
    const timer = window.setInterval(() => void loadTransfers(), 1000)
    return () => window.clearInterval(timer)
  }, [loadTransfers, polling])

  useEffect(() => {
    const refresh = () => {
      showLocalTransfers()
      void loadTransfers()
    }
    window.addEventListener(TRANSFERS_CHANGED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(TRANSFERS_CHANGED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [loadTransfers, showLocalTransfers])

  return { transfers, loading, loadTransfers }
}

function TransferItemRow({ item, onChanged }: { item: TransferItem; onChanged: () => void }) {
  const runAction = async (action: () => Promise<void>, message: string) => {
    try {
      await action()
      toast.success(message)
      onChanged()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败')
    }
  }

  return (
    <div className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'upload' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-600'}`}>
          {item.type === 'upload' ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium truncate" title={item.name}>{item.name}</p>
            {item.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <div className="flex items-center gap-1">
                {item.status === 'error' ? (
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => runAction(() => fileApi.retryTransfer(item.id), '已重试传输任务')}>
                    <Play className="w-3 h-3" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => runAction(() => fileApi.cancelTransfer(item.id), '已取消传输任务')}>
                    <Pause className="w-3 h-3" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-destructive" onClick={() => runAction(() => fileApi.deleteTransfer(item.id), '已删除传输任务')}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(item.size)}</span>
            <span>-</span>
            <span>{Math.round(item.progress)}%</span>
          </div>
          {item.status !== 'completed' && <Progress value={item.progress} className="h-1 mt-2" />}
        </div>
      </div>
    </div>
  )
}

export function TransferDrawer({ isOpen, onClose }: TransferDrawerProps) {
  const { transfers, loading, loadTransfers } = useTransfers(isOpen)
  const activeTransfers = transfers.filter((item) => item.status === 'transferring' || item.status === 'pending' || item.status === 'error')
  const completedTransfers = transfers.filter((item) => item.status === 'completed')

  const clearDone = async () => {
    try {
      await fileApi.clearDoneTransfers()
      toast.success('已清除完成任务')
      await loadTransfers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '清除完成任务失败')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      if (!open) onClose()
    }}>
      <SheetContent className="w-[400px] sm:w-[450px] overflow-y-auto">
        <SheetHeader className="pb-4 pr-10">
          <SheetTitle>传输列表</SheetTitle>
          <div className="mt-2 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => void loadTransfers()} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-1.5" />
              刷新
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => void clearDone()} disabled={completedTransfers.length === 0}>
              清除完成
            </Button>
          </div>
        </SheetHeader>
        <div className="space-y-6">
          {activeTransfers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">正在传输 ({activeTransfers.length})</h4>
              <div className="space-y-2">{activeTransfers.map((item) => <TransferItemRow key={`active-${item.type}-${item.id}-${item.status}`} item={item} onChanged={() => void loadTransfers()} />)}</div>
            </div>
          )}
          {completedTransfers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">已完成 ({completedTransfers.length})</h4>
              <div className="space-y-2">{completedTransfers.map((item) => <TransferItemRow key={`completed-${item.type}-${item.id}-${item.status}`} item={item} onChanged={() => void loadTransfers()} />)}</div>
            </div>
          )}
          {!loading && transfers.length === 0 && <EmptyState title="暂无传输任务" icon={<Upload className="w-8 h-8 text-muted-foreground/50" />} />}
          {loading && transfers.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">正在加载传输任务...</div>}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function TransferBar({ onExpand }: { onExpand: () => void }) {
  const { transfers } = useTransfers(true)
  const activeTransfers = transfers.filter((item) => item.status === 'transferring' || item.status === 'pending')
  const uploadCount = activeTransfers.filter((item) => item.type === 'upload').length
  const downloadCount = activeTransfers.filter((item) => item.type === 'download').length
  const averageProgress = useMemo(() => {
    if (activeTransfers.length === 0) return 0
    return activeTransfers.reduce((total, item) => total + item.progress, 0) / activeTransfers.length
  }, [activeTransfers])

  return (
    <button onClick={onExpand} className="h-10 border-t border-border bg-card px-4 flex items-center gap-4 w-full hover:bg-muted/50 transition-colors">
      <Cloud className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">正在传输：上传 {uploadCount} 个，下载 {downloadCount} 个</span>
      <div className="flex-1 flex justify-center"><Progress value={averageProgress} className="h-1 w-24" /></div>
    </button>
  )
}
