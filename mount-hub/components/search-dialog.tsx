'use client'

import { Search, FileText, Folder, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

interface SearchDialogProps {
  isOpen: boolean
  onClose: () => void
}

const recentSearches = [
  { id: '1', text: '产品规划', type: 'search' },
  { id: '2', text: '季度报表.xlsx', type: 'file' },
  { id: '3', text: '设计稿', type: 'folder' },
]

export function SearchDialog({ isOpen, onClose }: SearchDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[540px] p-0 gap-0">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="搜索文件、文件夹..."
            className="border-0 h-14 text-base focus-visible:ring-0 px-0"
            autoFocus
          />
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            最近搜索
          </p>
          <div className="space-y-1">
            {recentSearches.map((item) => (
              <button
                key={item.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
              >
                {item.type === 'search' && <Clock className="w-4 h-4 text-muted-foreground" />}
                {item.type === 'file' && <FileText className="w-4 h-4 text-primary" />}
                {item.type === 'folder' && <Folder className="w-4 h-4 text-yellow-500" />}
                <span className="text-sm">{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            按 <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">ESC</kbd> 关闭
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
