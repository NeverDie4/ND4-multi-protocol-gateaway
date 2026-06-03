'use client'

import { X, Upload, Download, Pause, Play, Trash2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { mockTransfers, formatFileSize, type TransferItem } from '@/lib/mock-data'

interface TransferDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function TransferItemRow({ item }: { item: TransferItem }) {
  return (
    <div className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          item.type === 'upload' ? 'bg-primary/10 text-primary' : 'bg-green-500/10 text-green-600'
        }`}>
          {item.type === 'upload' ? <Upload className="w-4 h-4" /> : <Download className="w-4 h-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-sm font-medium truncate">{item.name}</p>
            {item.status === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
            ) : (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-6 h-6">
                  {item.status === 'transferring' ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" className="w-6 h-6 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(item.size)}</span>
            <span>•</span>
            <span>{item.progress}%</span>
          </div>

          {item.status !== 'completed' && (
            <Progress value={item.progress} className="h-1 mt-2" />
          )}
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
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              清除已完成
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {activeTransfers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                正在传输 ({activeTransfers.length})
              </h4>
              <div className="space-y-2">
                {activeTransfers.map(item => (
                  <TransferItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {completedTransfers.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                已完成 ({completedTransfers.length})
              </h4>
              <div className="space-y-2">
                {completedTransfers.map(item => (
                  <TransferItemRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}

          {mockTransfers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Upload className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">暂无传输任务</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
