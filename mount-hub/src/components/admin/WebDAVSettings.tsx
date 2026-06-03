'use client'

import { Apple, Copy, Monitor, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StatusBadge } from '@/components/common/StatusBadge'
import { logMockAction } from '@/lib/api'

export function WebDAVSettings() {
  const [authEnabled, setAuthEnabled] = useState(true)
  const notify = (action: string) => {
    logMockAction(action)
    toast.success(`${action}成功`)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">WebDAV 服务</h1><p className="text-muted-foreground mt-1">配置和管理 WebDAV 访问协议。</p></div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold text-lg">服务状态</h3><p className="text-sm text-muted-foreground">WebDAV 服务器当前正在运行。</p></div><StatusBadge label="运行中" tone="success" /></div>
        <div className="space-y-2"><Label className="text-muted-foreground">服务地址</Label><div className="flex items-center gap-2"><Input value="http://localhost:5244/dav" readOnly className="font-mono bg-muted/30" /><Button variant="outline" size="icon" onClick={() => notify('复制 WebDAV 地址')}><Copy className="w-4 h-4" /></Button></div></div>
        <div className="flex items-center justify-between pt-2 border-t border-border"><div><p className="font-medium">身份验证方式</p><p className="text-sm text-muted-foreground">需要凭据才能访问。</p></div><Switch checked={authEnabled} onCheckedChange={(checked) => { setAuthEnabled(checked); notify('更新 WebDAV 认证') }} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2 mb-4"><Monitor className="w-5 h-5 text-muted-foreground" /><h3 className="font-semibold">Windows 资源管理器</h3></div><ol className="space-y-2 text-sm text-muted-foreground"><li>1. 打开文件资源管理器并选择 <span className="font-medium text-foreground">此电脑</span>。</li><li>2. 点击 <span className="font-medium text-foreground">映射网络驱动器</span>。</li><li>3. 填写服务地址并使用凭据连接。</li></ol></div>
        <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2 mb-4"><Apple className="w-5 h-5 text-muted-foreground" /><h3 className="font-semibold">macOS 访达</h3></div><ol className="space-y-2 text-sm text-muted-foreground"><li>1. 打开访达并选择 <span className="font-medium text-foreground">{"前往 > 连接服务器"}</span>。</li><li>2. 粘贴服务地址。</li><li>3. 选择注册用户并输入凭据。</li></ol></div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">有效权限</h3><Button variant="ghost" size="sm" className="text-primary" onClick={() => notify('管理 WebDAV 访问')}>管理访问</Button></div><div className="space-y-3">{['管理员 - 完全读写权限 - 3 个用户', '标准用户 - 读写权限 - 12 个用户'].map(item => { const [role, desc, count] = item.split(' - '); return <div key={role} className="flex items-center justify-between p-3 rounded-lg bg-muted/30"><div className="flex items-center gap-3"><Users className="w-5 h-5 text-muted-foreground" /><div><p className="font-medium">{role}</p><p className="text-xs text-muted-foreground">{desc}</p></div></div><span className="text-sm text-muted-foreground">{count}</span></div> })}</div></div>
    </div>
  )
}
