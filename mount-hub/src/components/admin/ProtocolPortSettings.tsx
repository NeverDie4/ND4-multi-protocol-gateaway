'use client'

import { Folder, Globe, Globe2, Info, Key, Lock, RefreshCw, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { logMockAction } from '@/lib/api'
import { mockProtocolPorts } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const iconMap = { globe2: Globe2, lock: Lock, folder: Folder, terminal: Terminal, key: Key, globe: Globe }
const statusColors = { running: 'text-green-600', initializing: 'text-yellow-600', stopped: 'text-red-600' }
const statusLabels = { running: '运行中', initializing: '初始化中', stopped: '已停止' }
const statusDots = { running: 'bg-green-500', initializing: 'bg-yellow-500', stopped: 'bg-red-500' }

export function ProtocolPortSettings() {
  const notify = (action: string, payload?: unknown) => {
    logMockAction(action, payload)
    toast.success(`${action}成功`)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">协议端口</h1><p className="text-muted-foreground mt-1">管理网络访问的活动服务端点和端口绑定。</p></div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border"><h3 className="font-semibold text-lg">活动服务</h3><Button className="bg-primary hover:bg-primary/90" onClick={() => notify('全部重启')}><RefreshCw className="w-4 h-4 mr-1.5" />全部重启</Button></div>
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border"><tr className="text-left text-sm text-muted-foreground"><th className="px-5 py-3 font-medium">服务协议</th><th className="px-5 py-3 font-medium">分配端口</th><th className="px-5 py-3 font-medium">状态</th><th className="px-5 py-3 font-medium text-right">访问控制</th></tr></thead>
          <tbody className="divide-y divide-border">
            {mockProtocolPorts.map((port) => {
              const Icon = iconMap[port.icon as keyof typeof iconMap]
              return (
                <tr key={port.protocol} className="hover:bg-muted/30">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><Icon className="w-5 h-5 text-muted-foreground" /><span className="font-medium">{port.protocol}</span></div></td>
                  <td className="px-5 py-4 text-muted-foreground">{port.port}</td>
                  <td className="px-5 py-4"><div className="flex items-center gap-2"><span className={cn('w-2 h-2 rounded-full', statusDots[port.status])} /><span className={cn('text-sm', statusColors[port.status])}>{statusLabels[port.status]}</span></div></td>
                  <td className="px-5 py-4 text-right"><Switch defaultChecked={port.enabled} onCheckedChange={() => notify('切换协议端口', port)} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-border bg-primary/5 p-5"><div className="flex items-start gap-3"><Info className="w-5 h-5 text-primary mt-0.5" /><div><h4 className="font-semibold">端口分配指南</h4><p className="text-sm text-muted-foreground mt-1 leading-relaxed">请确保指定端口未被外部防火墙阻止。更改默认端口可能需要更新客户端连接配置。</p></div></div></div>
    </div>
  )
}
