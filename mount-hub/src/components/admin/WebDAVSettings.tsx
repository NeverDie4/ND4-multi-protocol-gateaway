'use client'

import { Apple, Copy, Monitor, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { StatusBadge } from '@/components/common/StatusBadge'
import { adminApi } from '@/lib/api'
import type { BackendRole, BackendUser } from '@/types'

const PERM_WEBDAV_READ = 8
const PERM_WEBDAV_MANAGE = 9

function hasPermission(permission: number, bit: number) {
  return ((permission >> bit) & 1) === 1
}

function webdavPermissionLabel(role: BackendRole) {
  const permissions = role.permission_scopes ?? []
  const canManage = permissions.some((entry) => hasPermission(entry.permission, PERM_WEBDAV_MANAGE))
  const canRead = permissions.some((entry) => hasPermission(entry.permission, PERM_WEBDAV_READ))
  if (canManage) return '管理与读写权限'
  if (canRead) return '读取权限'
  return ''
}

export function WebDAVSettings() {
  const [authEnabled, setAuthEnabled] = useState(true)
  const [users, setUsers] = useState<BackendUser[]>([])
  const [roles, setRoles] = useState<BackendRole[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const webdavUrl = 'http://localhost:5244/dav'

  const loadPermissions = async () => {
    setLoadingPermissions(true)
    try {
      const [userResult, roleResult] = await Promise.all([
        adminApi.listUsers(),
        adminApi.listRoles(),
      ])
      setUsers(userResult.content ?? [])
      setRoles(roleResult.content ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载 WebDAV 权限失败')
    } finally {
      setLoadingPermissions(false)
    }
  }

  useEffect(() => {
    void loadPermissions()
  }, [])

  const effectiveRoles = useMemo(() => {
    return roles
      .map((role) => {
        const label = webdavPermissionLabel(role)
        const count = users.filter((user) => user.role?.includes(role.id)).length
        return { role, label, count }
      })
      .filter((item) => item.label)
  }, [roles, users])

  const copyWebDAVUrl = async () => {
    try {
      await navigator.clipboard.writeText(webdavUrl)
      toast.success('WebDAV 地址已复制')
    } catch {
      toast.error('复制 WebDAV 地址失败')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">WebDAV 服务</h1>
        <p className="text-muted-foreground mt-1">配置和管理 WebDAV 访问协议。</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">服务状态</h3>
            <p className="text-sm text-muted-foreground">WebDAV 随 HTTP/HTTPS 主服务提供访问。</p>
          </div>
          <StatusBadge label="跟随主服务" tone="success" />
        </div>
        <div className="space-y-2">
          <Label className="text-muted-foreground">服务地址</Label>
          <div className="flex items-center gap-2">
            <Input value={webdavUrl} readOnly className="font-mono bg-muted/30" />
            <Button variant="outline" size="icon" onClick={() => void copyWebDAVUrl()}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div>
            <p className="font-medium">身份验证方式</p>
            <p className="text-sm text-muted-foreground">WebDAV 使用账号和角色权限控制访问。</p>
          </div>
          <Switch checked={authEnabled} onCheckedChange={setAuthEnabled} disabled />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Windows 资源管理器</h3>
          </div>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. 打开文件资源管理器并选择 <span className="font-medium text-foreground">此电脑</span>。</li>
            <li>2. 点击 <span className="font-medium text-foreground">映射网络驱动器</span>。</li>
            <li>3. 填写服务地址并使用账号凭据连接。</li>
          </ol>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Apple className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">macOS 访达</h3>
          </div>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. 打开访达并选择 <span className="font-medium text-foreground">前往 &gt; 连接服务器</span>。</li>
            <li>2. 粘贴服务地址。</li>
            <li>3. 选择注册用户并输入凭据。</li>
          </ol>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">有效权限</h3>
          <Button variant="ghost" size="sm" className="text-primary" onClick={() => void loadPermissions()} disabled={loadingPermissions}>
            刷新权限
          </Button>
        </div>
        <div className="space-y-3">
          {loadingPermissions && effectiveRoles.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">正在加载权限...</p>}
          {!loadingPermissions && effectiveRoles.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">暂无角色具备 WebDAV 权限</p>}
          {effectiveRoles.map(({ role, label, count }) => (
            <div key={role.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{role.name}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{count} 个用户</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
