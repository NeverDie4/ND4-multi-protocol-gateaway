'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, RefreshCw, Shield, Trash2, UserCog, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { adminApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { BackendRole, BackendUser } from '@/types'

type NewUserForm = {
  username: string
  password: string
  basePath: string
  role: number[]
}

const initialForm: NewUserForm = {
  username: '',
  password: '',
  basePath: '/',
  role: [],
}

function roleNames(user: BackendUser, roles: BackendRole[]) {
  if (!user.role || user.role.length === 0) return '未分配角色'
  return user.role
    .map((id) => roles.find((role) => role.id === id)?.name ?? `#${id}`)
    .join(', ')
}

function isProtectedUser(user: BackendUser) {
  return user.username === 'admin' || user.username === 'guest'
}

export function UserPermissionManager() {
  const [users, setUsers] = useState<BackendUser[]>([])
  const [roles, setRoles] = useState<BackendRole[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState<NewUserForm>(initialForm)
  const [deleteTarget, setDeleteTarget] = useState<BackendUser | null>(null)

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? users[0] ?? null,
    [selectedUserId, users],
  )

  const load = async () => {
    setLoading(true)
    try {
      const [userResult, roleResult] = await Promise.all([
        adminApi.listUsers(),
        adminApi.listRoles(),
      ])
      const nextUsers = userResult.content ?? []
      const nextRoles = roleResult.content ?? []
      setUsers(nextUsers)
      setRoles(nextRoles)
      setSelectedUserId((current) => current ?? nextUsers[0]?.id ?? null)
      if (newUser.role.length === 0) {
        const defaultRole = nextRoles.find((role) => role.default && role.name !== 'guest' && role.name !== 'admin')
          ?? nextRoles.find((role) => role.name !== 'guest' && role.name !== 'admin')
        if (defaultRole) {
          setNewUser((prev) => ({ ...prev, role: [defaultRole.id] }))
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载用户数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const toggleNewUserRole = (roleId: number, checked: boolean) => {
    setNewUser((prev) => ({
      ...prev,
      role: checked ? [...prev.role, roleId] : prev.role.filter((id) => id !== roleId),
    }))
  }

  const createUser = async () => {
    if (!newUser.username || !newUser.password) {
      toast.error('请填写用户名和密码')
      return
    }
    if (newUser.role.length === 0) {
      toast.error('请至少选择一个角色')
      return
    }
    try {
      await adminApi.createUser({
        username: newUser.username,
        password: newUser.password,
        base_path: newUser.basePath || '/',
        role: newUser.role,
        disabled: false,
        permission: 0,
      })
      toast.success('用户已创建')
      setNewUser(initialForm)
      setShowCreate(false)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建用户失败')
    }
  }

  const toggleUser = async (user: BackendUser, disabled: boolean) => {
    try {
      await adminApi.updateUser({
        ...user,
        disabled,
        password: '',
      } as Partial<BackendUser> & { password: string })
      toast.success(disabled ? '用户已禁用' : '用户已启用')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新用户失败')
    }
  }

  const cancel2FA = async (user: BackendUser) => {
    try {
      await adminApi.cancelUser2FA(user.id)
      toast.success('已取消 2FA')
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '取消 2FA 失败')
    }
  }

  const deleteUser = async () => {
    if (!deleteTarget) return
    try {
      await adminApi.deleteUser(deleteTarget.id)
      toast.success('用户已删除')
      setDeleteTarget(null)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除用户失败')
    }
  }

  const normalRoles = roles.filter((role) => role.name !== 'admin' && role.name !== 'guest')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground mt-1">管理账号、角色绑定和基础安全状态。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            刷新
          </Button>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setShowCreate((value) => !value)}>
            <Plus className="w-4 h-4 mr-1.5" />
            添加用户
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h2 className="font-semibold">新建用户</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">用户名</Label>
              <Input id="new-username" value={newUser.username} onChange={(event) => setNewUser((prev) => ({ ...prev, username: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">密码</Label>
              <Input id="new-password" type="password" value={newUser.password} onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-base-path">基础路径</Label>
              <Input id="new-base-path" value={newUser.basePath} onChange={(event) => setNewUser((prev) => ({ ...prev, basePath: event.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>角色</Label>
            <div className="flex flex-wrap gap-3">
              {normalRoles.map((role) => (
                <label key={role.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <Checkbox
                    checked={newUser.role.includes(role.id)}
                    onCheckedChange={(checked) => toggleNewUserRole(role.id, checked === true)}
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
            <Button onClick={createUser}>创建用户</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">用户列表</p>
              <p className="text-xs text-muted-foreground">共 {users.length} 个用户</p>
            </div>
            <Users className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            {loading && <p className="py-8 text-center text-sm text-muted-foreground">正在加载用户...</p>}
            {!loading && users.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">暂无用户</p>}
            {!loading && users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors',
                  selectedUser?.id === user.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50',
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Shield className="w-3 h-3" />
                      <span>{roleNames(user, roles)}</span>
                    </div>
                  </div>
                  <Badge variant={user.disabled ? 'destructive' : 'default'} className={cn('text-xs', !user.disabled && 'bg-green-100 text-green-700 hover:bg-green-100')}>
                    {user.disabled ? '已禁用' : '启用中'}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-7 space-y-4">
          {selectedUser ? (
            <>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                      {selectedUser.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{selectedUser.username}</p>
                      <p className="text-sm text-muted-foreground">{roleNames(selectedUser, roles)}</p>
                    </div>
                  </div>
                  <Switch
                    checked={!selectedUser.disabled}
                    disabled={selectedUser.username === 'admin'}
                    onCheckedChange={(checked) => void toggleUser(selectedUser, !checked)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                  <div><p className="text-xs text-muted-foreground">用户 ID</p><p className="font-medium">{selectedUser.id}</p></div>
                  <div><p className="text-xs text-muted-foreground">基础路径</p><p className="font-medium">{selectedUser.base_path || '/'}</p></div>
                  <div><p className="text-xs text-muted-foreground">状态</p><p className={cn('font-medium', selectedUser.disabled ? 'text-red-600' : 'text-green-600')}>{selectedUser.disabled ? '已禁用' : '启用中'}</p></div>
                  <div><p className="text-xs text-muted-foreground">2FA</p><p className="font-medium">{selectedUser.otp ? '已启用' : '未启用'}</p></div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <UserCog className="w-4 h-4" />
                  <span className="text-sm font-medium">管理操作</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => void cancel2FA(selectedUser)} disabled={!selectedUser.otp}>
                    取消 2FA
                  </Button>
                  <Button
                    variant="outline"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={isProtectedUser(selectedUser)}
                    onClick={() => setDeleteTarget(selectedUser)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除用户
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold mb-4">可用角色</h3>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div key={role.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{role.name}</p>
                          <p className="text-xs text-muted-foreground">{role.description || '无描述'}</p>
                        </div>
                        {role.default && <Badge variant="secondary">默认</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
              请选择一个用户
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除用户"
        description={`确定要删除用户“${deleteTarget?.username ?? ''}”吗？`}
        confirmText="删除"
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={deleteUser}
      />
    </div>
  )
}
