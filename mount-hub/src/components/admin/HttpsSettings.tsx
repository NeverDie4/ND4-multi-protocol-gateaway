'use client'

import { Copy, FileText, Info, Key, Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StatusBadge } from '@/components/common/StatusBadge'
import { logMockAction } from '@/lib/api'

export function HttpsSettings() {
  const [forceHttps, setForceHttps] = useState(true)
  const notify = (action: string) => {
    logMockAction(action)
    toast.success(`${action}成功`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">安全设置</h1><p className="text-muted-foreground mt-1">配置安全传输协议和证书。</p></div><div className="flex gap-2"><Button variant="outline" onClick={() => notify('放弃 HTTPS 更改')}>放弃更改</Button><Button className="bg-primary hover:bg-primary/90" onClick={() => notify('保存 HTTPS 配置')}>保存配置</Button></div></div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-center gap-2"><Lock className="w-5 h-5 text-muted-foreground" /><h3 className="font-semibold text-lg">HTTPS 配置</h3></div>
          <div className="flex items-center justify-between pb-4 border-b border-border"><div><p className="font-medium">服务状态</p><p className="text-sm text-muted-foreground">HTTPS 监听器的当前状态</p></div><StatusBadge label="运行中 (监听)" tone="success" /></div>
          <div className="flex items-center justify-between pb-4 border-b border-border"><div><p className="font-medium">强制 HTTPS</p><p className="text-sm text-muted-foreground">将所有 HTTP 流量重定向到安全端口</p></div><Switch checked={forceHttps} onCheckedChange={(checked) => { setForceHttps(checked); notify('更新强制 HTTPS') }} /></div>
          <div className="flex items-center justify-between pb-4 border-b border-border"><Label className="font-medium">安全端口</Label><Input defaultValue="443" className="w-24 text-right" /></div>
          <div className="flex items-center justify-between pb-4 border-b border-border"><Label className="font-medium">证书路径</Label><div className="flex items-center gap-2"><div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background"><FileText className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-mono">/etc/ssl/certs/mounthub.crt</span></div><Button variant="outline" size="sm" onClick={() => notify('浏览证书路径')}>浏览</Button></div></div>
          <div className="flex items-center justify-between"><Label className="font-medium">私钥路径</Label><div className="flex items-center gap-2"><div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background"><Key className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-mono">/etc/ssl/private/mounthub.key</span></div><Button variant="outline" size="sm" onClick={() => notify('浏览私钥路径')}>浏览</Button></div></div>
        </div>
        <div className="rounded-xl border border-border bg-primary/5 p-5"><div className="flex items-center gap-2 mb-3"><Info className="w-5 h-5 text-primary" /><h3 className="font-semibold">证书要求</h3></div><p className="text-sm text-muted-foreground leading-relaxed">MountHub 需要 PEM 编码的 X.509 证书。确保运行服务的用户帐户对证书和私钥文件具有读取权限。</p></div>
      </div>
      <div className="space-y-3"><h3 className="font-semibold">生成自签名证书</h3><p className="text-sm text-muted-foreground">如果您没有受信任机构颁发的证书，可以使用 OpenSSL 生成用于测试目的的自签名证书。</p><div className="rounded-xl overflow-hidden border border-border"><div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700"><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="w-3 h-3 rounded-full bg-yellow-500" /><span className="w-3 h-3 rounded-full bg-green-500" /></div><span className="text-sm text-zinc-400">终端</span><Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100" onClick={() => notify('复制证书命令')}><Copy className="w-4 h-4 mr-1" />复制</Button></div><div className="p-4 bg-zinc-900 font-mono text-sm text-zinc-100 overflow-x-auto"><pre className="whitespace-pre-wrap">{`openssl req -x509 -nodes -days 365 -newkey rsa:2048 \\
  -keyout /etc/ssl/private/mounthub.key \\
  -out /etc/ssl/certs/mounthub.crt \\
  -subj "/CN=mounthub.local"`}</pre></div></div></div>
    </div>
  )
}
