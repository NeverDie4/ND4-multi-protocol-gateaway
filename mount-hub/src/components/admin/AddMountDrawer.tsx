'use client'

import { useEffect, useMemo, useState } from 'react'
import { Cloud, Database, FolderOpen, Globe, Server } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { adminApi } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { StorageDriver } from '@/types'

interface AddMountDrawerProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: () => void
  driverNames?: string[]
}

const driverOptions: Array<{ id: StorageDriver; name: string; description: string; icon: typeof Server }> = [
  { id: 'Local', name: 'Local', description: '挂载服务器本地目录', icon: FolderOpen },
  { id: 'FTP', name: 'FTP', description: '连接标准 FTP 文件服务', icon: Globe },
  { id: 'WebDav', name: 'WebDAV', description: '连接 WebDAV 远程目录', icon: Cloud },
  { id: 'SFTP', name: 'SFTP', description: '通过 SSH/SFTP 访问远程目录', icon: Server },
  { id: 'S3', name: 'S3', description: '连接 S3 兼容对象存储', icon: Database },
]

type FormState = {
  mountPath: string
  remark: string
  rootFolderPath: string
  address: string
  username: string
  password: string
  bucket: string
  endpoint: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}

const initialForm: FormState = {
  mountPath: '',
  remark: '',
  rootFolderPath: '/',
  address: '',
  username: '',
  password: '',
  bucket: '',
  endpoint: '',
  region: '',
  accessKeyId: '',
  secretAccessKey: '',
}

function normalizeMountPath(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

function buildAddition(driver: StorageDriver, form: FormState) {
  switch (driver) {
    case 'Local':
      return {
        root_folder_path: form.rootFolderPath || '/',
        thumbnail: false,
        use_ffmpeg: false,
        thumb_cache_folder: '',
        thumb_concurrency: '16',
        thumb_pixel: '320',
        video_thumb_pos: '20%',
        show_hidden: true,
        mkdir_perm: '777',
        recycle_bin_path: 'delete permanently',
      }
    case 'FTP':
      return {
        address: form.address,
        encoding: 'utf-8',
        username: form.username,
        password: form.password,
        root_folder_path: form.rootFolderPath || '/',
      }
    case 'WebDav':
      return {
        vendor: 'other',
        address: form.address,
        username: form.username,
        password: form.password,
        root_folder_path: form.rootFolderPath || '/',
      }
    case 'SFTP':
      return {
        address: form.address,
        username: form.username,
        password: form.password,
        private_key: '',
        passphrase: '',
        root_folder_path: form.rootFolderPath || '/',
        ignore_symlink_error: false,
      }
    case 'S3':
      return {
        root_folder_path: form.rootFolderPath || '/',
        bucket: form.bucket,
        endpoint: form.endpoint,
        region: form.region,
        access_key_id: form.accessKeyId,
        secret_access_key: form.secretAccessKey,
        session_token: '',
        custom_host: '',
        enable_custom_host_presign: false,
        sign_url_expire: 4,
        placeholder: '',
        force_path_style: true,
        list_object_version: 'v1',
        use_placeholder: true,
        remove_bucket: false,
        add_filename_to_disposition: false,
        storage_class: '',
      }
  }
}

export function AddMountDrawer({ isOpen, onClose, onCreated, driverNames = [] }: AddMountDrawerProps) {
  const [selectedDriver, setSelectedDriver] = useState<StorageDriver | null>(null)
  const [step, setStep] = useState<'protocol' | 'config'>('protocol')
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const availableDrivers = useMemo(() => {
    if (driverNames.length === 0) return driverOptions
    return driverOptions.filter((item) => driverNames.includes(item.id))
  }, [driverNames])

  useEffect(() => {
    if (!isOpen) {
      setStep('protocol')
      setSelectedDriver(null)
      setForm(initialForm)
      setSubmitting(false)
    }
  }, [isOpen])

  const update = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
  }

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = async () => {
    if (!selectedDriver) return
    const mountPath = normalizeMountPath(form.mountPath)
    if (!mountPath) {
      toast.error('请填写挂载路径')
      return
    }

    setSubmitting(true)
    try {
      await adminApi.createStorage({
        mount_path: mountPath,
        driver: selectedDriver,
        addition: JSON.stringify(buildAddition(selectedDriver, form)),
        order: 0,
        cache_expiration: 30,
        remark: form.remark,
        disabled: false,
        web_proxy: false,
        webdav_policy: 'native_proxy',
        proxy_range: true,
      })
      toast.success('挂载已创建')
      onCreated?.()
      handleClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建挂载失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-[480px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle>{step === 'protocol' ? '添加挂载空间' : '配置连接'}</SheetTitle>
          <SheetDescription>{step === 'protocol' ? '选择要连接的存储驱动' : `配置 ${selectedDriver} 的连接参数`}</SheetDescription>
        </SheetHeader>

        {step === 'protocol' ? (
          <div className="space-y-2">
            {availableDrivers.map((driver) => {
              const Icon = driver.icon
              return (
                <button
                  key={driver.id}
                  onClick={() => {
                    setSelectedDriver(driver.id)
                    setStep('config')
                  }}
                  className={cn('w-full p-4 rounded-xl border border-border bg-card flex items-center gap-4 text-left hover:border-primary/50 hover:bg-secondary/50 transition-all')}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                  <div><p className="font-medium text-sm">{driver.name}</p><p className="text-xs text-muted-foreground">{driver.description}</p></div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mount-path">挂载路径</Label>
              <Input id="mount-path" placeholder="/local" value={form.mountPath} onChange={update('mountPath')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remark">备注</Label>
              <Input id="remark" placeholder="可选" value={form.remark} onChange={update('remark')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="root">根目录</Label>
              <Input id="root" placeholder="/" value={form.rootFolderPath} onChange={update('rootFolderPath')} />
            </div>

            {selectedDriver !== 'Local' && selectedDriver !== 'S3' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="address">服务地址</Label>
                  <Input id="address" placeholder="host:port 或 https://example.com/dav" value={form.address} onChange={update('address')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">用户名</Label>
                    <Input id="username" value={form.username} onChange={update('username')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input id="password" type="password" value={form.password} onChange={update('password')} />
                  </div>
                </div>
              </>
            )}

            {selectedDriver === 'S3' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bucket">Bucket</Label>
                  <Input id="bucket" value={form.bucket} onChange={update('bucket')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint</Label>
                  <Input id="endpoint" placeholder="https://s3.example.com" value={form.endpoint} onChange={update('endpoint')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" value={form.region} onChange={update('region')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="access-key">Access Key ID</Label>
                    <Input id="access-key" value={form.accessKeyId} onChange={update('accessKeyId')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secret-key">Secret Access Key</Label>
                    <Input id="secret-key" type="password" value={form.secretAccessKey} onChange={update('secretAccessKey')} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <SheetFooter className="mt-6 pt-4 border-t border-border">
          {step === 'config' && <Button variant="outline" onClick={() => { setStep('protocol'); setSelectedDriver(null) }}>返回</Button>}
          <Button variant="outline" onClick={handleClose}>取消</Button>
          {step === 'config' && <Button onClick={handleSubmit} disabled={submitting}>{submitting ? '创建中...' : '创建挂载'}</Button>}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
