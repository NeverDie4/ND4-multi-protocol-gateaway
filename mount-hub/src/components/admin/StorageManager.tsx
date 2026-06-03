'use client'

import { useEffect, useMemo, useState } from 'react'
import { Edit, HardDrive, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { adminApi } from '@/lib/api'
import type { BackendStorage } from '@/types'

interface StorageManagerProps {
  onAddMount: () => void
  refreshSignal?: number
}

function statusLabel(storage: BackendStorage) {
  if (storage.disabled) return 'Disabled'
  return storage.status || 'Unknown'
}

function statusColor(storage: BackendStorage) {
  if (storage.disabled) return 'bg-gray-400'
  const status = storage.status?.toLowerCase() ?? ''
  if (status.includes('work') || status.includes('success') || status.includes('online')) return 'bg-green-500'
  if (status.includes('error') || status.includes('fail')) return 'bg-red-500'
  return 'bg-amber-500'
}

export function StorageManager({ onAddMount, refreshSignal = 0 }: StorageManagerProps) {
  const [storages, setStorages] = useState<BackendStorage[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BackendStorage | null>(null)

  const stats = useMemo(() => {
    const enabled = storages.filter((item) => !item.disabled).length
    const disabled = storages.length - enabled
    const drivers = new Set(storages.map((item) => item.driver)).size
    return { total: storages.length, enabled, disabled, drivers }
  }, [storages])

  const loadStorages = async () => {
    setLoading(true)
    try {
      const result = await adminApi.listStorages()
      setStorages(result.content ?? [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '加载挂载列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStorages()
  }, [refreshSignal])

  const toggleStorage = async (storage: BackendStorage, enabled: boolean) => {
    try {
      if (enabled) {
        await adminApi.enableStorage(storage.id)
      } else {
        await adminApi.disableStorage(storage.id)
      }
      toast.success(enabled ? '挂载已启用' : '挂载已禁用')
      await loadStorages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '更新挂载状态失败')
    }
  }

  const deleteStorage = async () => {
    if (!deleteTarget) return
    try {
      await adminApi.deleteStorage(deleteTarget.id)
      toast.success('挂载已删除')
      setDeleteTarget(null)
      await loadStorages()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除挂载失败')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">挂载管理</h1>
          <p className="text-muted-foreground mt-1">配置和监控 Local、FTP、WebDAV、SFTP、S3 等存储挂载。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadStorages()} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-1.5" />
            刷新
          </Button>
          <Button onClick={onAddMount} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1.5" />
            添加挂载
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border"><p className="text-sm text-muted-foreground">总挂载数</p><p className="text-3xl font-semibold mt-1">{stats.total}</p></div>
        <div className="p-4 rounded-xl bg-card border border-border"><p className="text-sm text-muted-foreground">已启用</p><p className="text-3xl font-semibold mt-1">{stats.enabled}</p></div>
        <div className="p-4 rounded-xl bg-card border border-border"><p className="text-sm text-muted-foreground">已禁用</p><p className="text-3xl font-semibold mt-1">{stats.disabled}</p></div>
        <div className="p-4 rounded-xl bg-card border border-border"><p className="text-sm text-muted-foreground">驱动类型</p><p className="text-3xl font-semibold mt-1">{stats.drivers}</p></div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">挂载路径</th>
              <th className="px-4 py-3 font-medium">驱动</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">缓存</th>
              <th className="px-4 py-3 font-medium">启用</th>
              <th className="px-4 py-3 font-medium w-24">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && (
              <tr><td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>正在加载挂载...</td></tr>
            )}
            {!loading && storages.length === 0 && (
              <tr><td className="px-4 py-10 text-center text-muted-foreground" colSpan={6}>暂无挂载配置</td></tr>
            )}
            {!loading && storages.map((storage) => (
              <tr key={storage.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <HardDrive className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{storage.mount_path}</p>
                      {storage.remark && <p className="text-xs text-muted-foreground">{storage.remark}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{storage.driver}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusColor(storage)}`} />
                    <span className="text-sm">{statusLabel(storage)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{storage.cache_expiration} 分钟</td>
                <td className="px-4 py-3">
                  <Switch checked={!storage.disabled} onCheckedChange={(checked) => void toggleStorage(storage, checked)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground" disabled>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => setDeleteTarget(storage)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除挂载"
        description={`确定要删除挂载“${deleteTarget?.mount_path ?? ''}”吗？`}
        confirmText="删除"
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={deleteStorage}
      />
    </div>
  )
}
