'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { AddMountDrawer } from '@/components/admin/AddMountDrawer'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FileDetailDrawer } from '@/components/file/FileDetailDrawer'
import { FileTable } from '@/components/file/FileTable'
import { FileToolbar } from '@/components/file/FileToolbar'
import { MountSidebar } from '@/components/file/MountSidebar'
import { TransferBar, TransferDrawer } from '@/components/file/TransferDrawer'
import { ApiError, fileApi } from '@/lib/api'
import type { FileItem } from '@/types'

function dirname(path: string) {
  if (path === '/') return '/'
  const parts = path.split('/').filter(Boolean)
  parts.pop()
  return parts.length ? `/${parts.join('/')}` : '/'
}

function joinPath(dir: string, name: string) {
  const base = dir === '/' ? '' : dir.replace(/\/$/, '')
  return `${base}/${name}`.replace(/\/+/g, '/')
}

function breadcrumb(path: string) {
  const parts = path.split('/').filter(Boolean)
  const items = [{ label: '根目录', path: '/' }]
  let current = ''
  for (const part of parts) {
    current += `/${part}`
    items.push({ label: part, path: current })
  }
  return items
}

function isStorageNotFoundError(err: unknown) {
  return err instanceof ApiError && /storage not found/i.test(err.message)
}

export default function FilesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [files, setFiles] = useState<FileItem[]>([])
  const [provider, setProvider] = useState('unknown')
  const [writable, setWritable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [detailFile, setDetailFile] = useState<FileItem | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddMountOpen, setIsAddMountOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FileItem | null>(null)
  const [hasNoStorage, setHasNoStorage] = useState(false)

  const directories = useMemo(() => files.filter((file) => file.type === 'folder'), [files])
  const breadcrumbPath = useMemo(() => breadcrumb(currentPath), [currentPath])

  const loadFiles = async (path = currentPath, forceRefresh = false) => {
    setLoading(true)
    try {
      const result = await fileApi.list(path, forceRefresh)
      setFiles(result.files)
      setProvider(result.provider)
      setWritable(result.writable)
      setCurrentPath(result.path)
      setSelectedFileId(null)
      setDetailFile(null)
      setIsDetailOpen(false)
      setHasNoStorage(false)
    } catch (err) {
      if (isStorageNotFoundError(err)) {
        setFiles([])
        setProvider('unknown')
        setWritable(false)
        setCurrentPath(path)
        setSelectedFileId(null)
        setDetailFile(null)
        setIsDetailOpen(false)
        setHasNoStorage(true)
        return
      }
      toast.error(err instanceof Error ? err.message : '加载文件列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadFiles('/')
  }, [])

  const handleOpen = (file: FileItem) => {
    if (file.type === 'folder' && file.path) {
      void loadFiles(file.path)
      return
    }
    setDetailFile(file)
    setIsDetailOpen(true)
  }

  const handlePreview = async (file: FileItem) => {
    setSelectedFileId(file.id)
    setDetailFile(file)
    setIsDetailOpen(true)
  }

  const handleDownload = async (file: FileItem) => {
    if (!file.path || file.type !== 'file') return
    try {
      const detail = await fileApi.get(file.path)
      await fileApi.startDownloadTransfer(file.path, file.name, detail.sign, file.size ?? detail.size ?? 0)
      toast.success('下载任务已创建')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建下载任务失败')
    }
  }

  const handleCreateFolder = async () => {
    const name = window.prompt('请输入文件夹名称')
    if (!name) return
    try {
      await fileApi.mkdir(joinPath(currentPath, name))
      toast.success('文件夹已创建')
      await loadFiles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '创建文件夹失败')
    }
  }

  const handleRename = async (file: FileItem) => {
    if (!file.path) return
    const name = window.prompt('请输入新名称', file.name)
    if (!name || name === file.name) return
    try {
      await fileApi.rename(file.path, name)
      toast.success('重命名成功')
      await loadFiles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '重命名失败')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await fileApi.remove(dirname(deleteTarget.path || currentPath), [deleteTarget.name])
      toast.success('删除成功')
      setDeleteTarget(null)
      await loadFiles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (selected.length === 0) return
    try {
      for (const file of selected) {
        await fileApi.upload(currentPath, file)
      }
      window.dispatchEvent(new CustomEvent('mounthub:transfer-created'))
      toast.success('上传任务已创建')
      await loadFiles()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '上传失败')
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden">
      <MountSidebar
        currentPath={currentPath}
        directories={directories}
        provider={provider}
        onNavigate={(path) => void loadFiles(path)}
        onAddMount={() => setIsAddMountOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden bg-background">
        <FileToolbar
          breadcrumbPath={breadcrumbPath}
          viewMode={viewMode}
          writable={writable}
          onNavigate={(path) => void loadFiles(path)}
          onViewModeChange={setViewMode}
          onRefresh={() => void loadFiles(currentPath, true)}
          onCreateFolder={handleCreateFolder}
          onUpload={() => fileInputRef.current?.click()}
        />
        <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleUpload} />
        <div className="flex-1 flex min-h-0">
          {hasNoStorage ? (
            <div className="flex-1 flex items-center justify-center bg-card">
              <div className="text-center">
                <p className="font-medium">暂无挂载空间</p>
                <p className="text-sm text-muted-foreground mt-1">请先在管理中心或左侧添加挂载入口。</p>
              </div>
            </div>
          ) : (
            <FileTable
              files={files}
              viewMode={viewMode}
              selectedFileId={selectedFileId}
              loading={loading}
              onSelect={setSelectedFileId}
              onOpen={handleOpen}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onRename={handleRename}
              onDelete={setDeleteTarget}
            />
          )}
          <FileDetailDrawer
            file={detailFile}
            provider={provider}
            isOpen={isDetailOpen}
            onDownload={handleDownload}
            onClose={() => {
              setIsDetailOpen(false)
              setSelectedFileId(null)
            }}
          />
        </div>
        <TransferBar onExpand={() => setIsTransferOpen(true)} />
      </main>

      <AddMountDrawer
        isOpen={isAddMountOpen}
        onClose={() => setIsAddMountOpen(false)}
        onCreated={() => void loadFiles('/')}
      />
      <TransferDrawer isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除文件"
        description={`确定要删除“${deleteTarget?.name ?? ''}”吗？此操作不可撤销。`}
        confirmText="删除"
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
