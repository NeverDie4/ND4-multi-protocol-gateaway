'use client'

import { GitBranch, Info, Layers } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { logMockAction } from '@/lib/api'

export function TransferLimitSettings() {
  const notify = (action: string) => {
    logMockAction(action)
    toast.success(`${action}成功`)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">传输限速</h1><p className="text-muted-foreground mt-1">配置服务质量 (QoS) 带宽限制以优化网络性能。</p></div>
      <div className="space-y-3">
        <h3 className="font-semibold">全局配置</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {['最大下载速率:1000:用户限制：500 MB/s', '最大上传速率:500:用户限制：250 MB/s'].map((item) => {
            const [label, value, hint] = item.split(':')
            return <div key={label} className="flex items-center justify-between p-4"><div><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground flex items-center gap-1"><Info className="w-3.5 h-3.5" />{hint}</p></div><div className="flex items-center gap-2"><Input type="number" defaultValue={value} className="w-24 text-right" /><span className="text-sm text-muted-foreground w-12">MB/s</span></div></div>
          })}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-semibold">本地服务器节点限制</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {['节点下载速率:250:适用于入站复制流量。', '节点上传速率:100:适用于出站复制流量。'].map((item) => {
            const [label, value, hint] = item.split(':')
            return <div key={label} className="flex items-center justify-between p-4"><div><p className="font-medium">{label}</p><p className="text-sm text-muted-foreground">{hint}</p></div><div className="flex items-center gap-2"><Input type="number" defaultValue={value} className="w-24 text-right" /><span className="text-sm text-muted-foreground w-12">MB/s</span></div></div>
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => notify('还原限速配置')}>还原</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => notify('保存限速配置')}>保存更改</Button></div>
      <div className="space-y-3">
        <h3 className="text-sm text-muted-foreground">协议行为</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><Layers className="w-5 h-5 text-muted-foreground" /></div><h4 className="font-semibold">范围请求</h4></div><p className="text-sm text-muted-foreground leading-relaxed">启用后，范围下载允许检索部分文件，从而可以在不重新启动的情况下恢复中断的传输。</p></div>
          <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><GitBranch className="w-5 h-5 text-muted-foreground" /></div><h4 className="font-semibold">分块传输</h4></div><p className="text-sm text-muted-foreground leading-relaxed">数据动态分段传输。QoS 限制可限制块之间的管道，确保整体带宽合规性。</p></div>
        </div>
      </div>
    </div>
  )
}
