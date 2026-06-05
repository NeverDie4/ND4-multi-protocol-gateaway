'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Folder, Globe, Globe2, Info, Key, Lock, RefreshCw, Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { getClientId, getToken } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ApiEnvelope, ProtocolPort } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''

const iconMap = { globe2: Globe2, lock: Lock, folder: Folder, terminal: Terminal, key: Key, globe: Globe }
const statusColors = { running: 'text-green-600', initializing: 'text-yellow-600', stopped: 'text-red-600' }
const statusLabels = { running: '运行中', initializing: '初始化中', stopped: '已停止' }
const statusDots = { running: 'bg-green-500', initializing: 'bg-yellow-500', stopped: 'bg-red-500' }
const PROTOCOL_PORTS_ERROR_TOAST_ID = 'protocol-ports-load-error'

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`
}

async function fetchProtocolPorts() {
  const headers = new Headers()
  const token = getToken()
  const clientId = getClientId()
  if (token) headers.set('Authorization', token)
  if (clientId) headers.set('Client-Id', clientId)

  const response = await fetch(buildUrl('/api/admin/setting/protocol_ports'), { headers })
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error('协议端口接口未返回 JSON，请确认后端已重启并且 /api 代理指向 Go 服务')
  }
  const envelope = (await response.json()) as ApiEnvelope<ProtocolPort[]>
  if (!response.ok || envelope.code !== 200) {
    throw new Error(envelope.message || response.statusText || '加载协议端口失败')
  }
  return envelope.data
}

export function ProtocolPortSettings() {
  const [ports, setPorts] = useState<ProtocolPort[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setPorts(await fetchProtocolPorts())
      setError('')
      toast.dismiss(PROTOCOL_PORTS_ERROR_TOAST_ID)
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载协议端口失败'
      setPorts([])
      setError(message)
      toast.error(message, { id: PROTOCOL_PORTS_ERROR_TOAST_ID })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">协议端口</h1>
        <p className="text-muted-foreground mt-1">按当前后端配置显示网络访问服务和端口绑定。</p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">活动服务</h3>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            刷新
          </Button>
        </div>
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="px-5 py-3 font-medium">服务协议</th>
              <th className="px-5 py-3 font-medium">配置端口</th>
              <th className="px-5 py-3 font-medium">状态</th>
              <th className="px-5 py-3 font-medium text-right">配置启用</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && ports.length === 0 && (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-muted-foreground" colSpan={4}>正在加载协议端口...</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td className="px-5 py-10" colSpan={4}>
                  <div className="mx-auto flex max-w-xl items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-left">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                    <div>
                      <p className="text-sm font-medium text-destructive">协议端口加载失败</p>
                      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!loading && !error && ports.length === 0 && (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-muted-foreground" colSpan={4}>暂无协议端口配置</td>
              </tr>
            )}
            {ports.map((port) => {
              const Icon = iconMap[port.icon as keyof typeof iconMap] ?? Globe
              return (
                <tr key={port.protocol} className="hover:bg-muted/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{port.protocol}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{port.port === -1 ? '未配置' : port.port}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', statusDots[port.status])} />
                      <span className={cn('text-sm', statusColors[port.status])}>{statusLabels[port.status]}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Switch checked={port.enabled} disabled aria-label={`${port.protocol} 配置启用状态`} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="rounded-xl border border-border bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold">端口状态说明</h4>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              此处展示的是当前后端配置。HTTP/WebDAV 共享主 HTTP/HTTPS 服务端口；FTP、SFTP、S3 API 需要在配置中启用并重启服务后才会监听。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
