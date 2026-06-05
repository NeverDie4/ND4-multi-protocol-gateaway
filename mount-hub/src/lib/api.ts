import {
  mockFiles,
  mockFolderTree,
  mockMountSpaces,
  mockProtocolPorts,
  mockStorageMounts,
  mockUsers,
} from '@/lib/mock-data'
import type {
  AdminUser,
  ApiEnvelope,
  ApiResult,
  BackendPageResp,
  BackendStorage,
  BackendUser,
  BackendRole,
  BackendFsObj,
  BackendFsGetResponse,
  BackendFsListResponse,
  FileItem,
  FileListResult,
  FolderNode,
  LoginResponse,
  MountSpace,
  ProtocolPort,
  StorageMount,
  TransferItem,
} from '@/types'

const TOKEN_KEY = 'mounthub.token'
const CLIENT_ID_KEY = 'mounthub.client_id'
const STATIC_HASH_SALT = 'https://github.com/alist-org/alist'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''
const AUTH_EXPIRED_EVENT = 'mounthub:auth-expired'
const TRANSFER_CREATED_EVENT = 'mounthub:transfer-created'
const TRANSFERS_CHANGED_EVENT = 'mounthub:transfers-changed'
const DOWNLOAD_TASKS_KEY = 'mounthub.download_tasks'
const UPLOAD_TASKS_KEY = 'mounthub.upload_tasks'
const DOWNLOAD_TASK_PREFIX = 'download:'
const UPLOAD_TASK_PREFIX = 'upload:'

export class ApiError extends Error {
  code: number
  data: unknown

  constructor(message: string, code: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

function getBrowserStorage() {
  if (typeof window === 'undefined') {
    return null
  }
  return window.localStorage
}

export function getToken() {
  return getBrowserStorage()?.getItem(TOKEN_KEY) ?? ''
}

export function setToken(token: string) {
  const storage = getBrowserStorage()
  if (!storage) return
  if (token) {
    storage.setItem(TOKEN_KEY, token)
  } else {
    storage.removeItem(TOKEN_KEY)
  }
}

export function clearAuthStorage() {
  setToken('')
}

export function notifyAuthExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT))
  }
}

export function onAuthExpired(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }
  window.addEventListener(AUTH_EXPIRED_EVENT, callback)
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, callback)
}

export function getClientId() {
  const storage = getBrowserStorage()
  if (!storage) {
    return ''
  }
  const existing = storage.getItem(CLIENT_ID_KEY)
  if (existing) {
    return existing
  }
  const next = crypto.randomUUID()
  storage.setItem(CLIENT_ID_KEY, next)
  return next
}

async function sha256Hex(input: string) {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((item) => item.toString(16).padStart(2, '0'))
    .join('')
}

async function staticHashPassword(password: string) {
  return sha256Hex(`${password}-${STATIC_HASH_SALT}`)
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuthExpired?: boolean
}

interface BackendTaskInfo {
  id: string
  name: string
  state: number
  status: string
  progress: number
  total_bytes: number
  error?: string
}

interface LocalDownloadTask extends TransferItem {
  path: string
  sign?: string
  url: string
  error?: string
  createdAt: number
  updatedAt: number
}

interface LocalUploadTask extends TransferItem {
  dir: string
  path: string
  error?: string
  createdAt: number
  updatedAt: number
}

export interface BackendSettingItem {
  key: string
  value: string
  type?: string
  options?: string
  group?: number
  flag?: number
  index?: number
}

function buildUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

function notifyTransfersChanged(created = false) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(TRANSFERS_CHANGED_EVENT))
  if (created) {
    window.dispatchEvent(new CustomEvent(TRANSFER_CREATED_EVENT))
  }
}

function readDownloadTasks() {
  const storage = getBrowserStorage()
  if (!storage) return []
  try {
    return JSON.parse(storage.getItem(DOWNLOAD_TASKS_KEY) || '[]') as LocalDownloadTask[]
  } catch {
    return []
  }
}

function readUploadTasks() {
  const storage = getBrowserStorage()
  if (!storage) return []
  try {
    return JSON.parse(storage.getItem(UPLOAD_TASKS_KEY) || '[]') as LocalUploadTask[]
  } catch {
    return []
  }
}

function writeDownloadTasks(tasks: LocalDownloadTask[]) {
  const storage = getBrowserStorage()
  if (!storage) return
  storage.setItem(DOWNLOAD_TASKS_KEY, JSON.stringify(tasks.slice(0, 100)))
}

function writeUploadTasks(tasks: LocalUploadTask[]) {
  const storage = getBrowserStorage()
  if (!storage) return
  storage.setItem(UPLOAD_TASKS_KEY, JSON.stringify(tasks.slice(0, 100)))
}

function upsertDownloadTask(task: LocalDownloadTask, created = false) {
  const tasks = readDownloadTasks().filter((item) => item.id !== task.id)
  writeDownloadTasks([{ ...task, updatedAt: Date.now() }, ...tasks])
  notifyTransfersChanged(created)
}

function upsertUploadTask(task: LocalUploadTask, created = false) {
  const tasks = readUploadTasks().filter((item) => item.id !== task.id)
  writeUploadTasks([{ ...task, updatedAt: Date.now() }, ...tasks])
  notifyTransfersChanged(created)
}

function updateDownloadTask(id: string, patch: Partial<LocalDownloadTask>) {
  const tasks = readDownloadTasks()
  const next = tasks.map((task) => (task.id === id ? { ...task, ...patch, updatedAt: Date.now() } : task))
  writeDownloadTasks(next)
  notifyTransfersChanged()
}

function updateUploadTask(id: string, patch: Partial<LocalUploadTask>) {
  const tasks = readUploadTasks()
  const next = tasks.map((task) => (task.id === id ? { ...task, ...patch, updatedAt: Date.now() } : task))
  writeUploadTasks(next)
  notifyTransfersChanged()
}

function removeDownloadTask(id: string) {
  writeDownloadTasks(readDownloadTasks().filter((task) => task.id !== id))
  notifyTransfersChanged()
}

function removeUploadTask(id: string) {
  writeUploadTasks(readUploadTasks().filter((task) => task.id !== id))
  notifyTransfersChanged()
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const activeDownloadControllers = new Map<string, AbortController>()
const activeUploadRequests = new Map<string, XMLHttpRequest>()

async function runDownloadTask(task: LocalDownloadTask) {
  const controller = new AbortController()
  activeDownloadControllers.set(task.id, controller)
  updateDownloadTask(task.id, { status: 'transferring', progress: 0 })

  try {
    const response = await fetch(task.url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(response.statusText || '下载失败')
    }

    const total = Number(response.headers.get('content-length')) || task.size || 0
    const reader = response.body?.getReader()
    if (!reader) {
      const blob = await response.blob()
      saveBlob(blob, task.name)
      updateDownloadTask(task.id, { status: 'completed', progress: 100, size: blob.size || total })
      return
    }

    const chunks: Uint8Array[] = []
    let received = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!value) continue
      chunks.push(value)
      received += value.byteLength
      const progress = total > 0 ? Math.min(99, (received / total) * 100) : task.progress
      updateDownloadTask(task.id, { status: 'transferring', progress, size: total || received })
    }

    saveBlob(new Blob(chunks), task.name)
    updateDownloadTask(task.id, { status: 'completed', progress: 100, size: total || received })
  } catch (err) {
    const message = err instanceof DOMException && err.name === 'AbortError' ? '下载已取消' : err instanceof Error ? err.message : '下载失败'
    updateDownloadTask(task.id, { status: 'error', error: message })
  } finally {
    activeDownloadControllers.delete(task.id)
  }
}

function isDownloadTaskId(id: string) {
  return id.startsWith(DOWNLOAD_TASK_PREFIX)
}

function isUploadTaskId(id: string) {
  return id.startsWith(UPLOAD_TASK_PREFIX)
}

function getDownloadTasksForList(): TransferItem[] {
  const now = Date.now()
  const tasks = readDownloadTasks().map((task) => {
    const isStaleActiveTask =
      (task.status === 'pending' || task.status === 'transferring') &&
      !activeDownloadControllers.has(task.id) &&
      now - task.updatedAt > 10000
    if (isStaleActiveTask) {
      return { ...task, status: 'error' as const, error: task.error || '下载已中断' }
    }
    return task
  })
  writeDownloadTasks(tasks)
  return tasks.map(({ path: _path, sign: _sign, url: _url, error: _error, createdAt: _createdAt, updatedAt: _updatedAt, ...task }) => task)
}

function getUploadTasksForList(): TransferItem[] {
  const now = Date.now()
  const tasks = readUploadTasks().map((task) => {
    const isStaleActiveTask =
      (task.status === 'pending' || task.status === 'transferring') &&
      !activeUploadRequests.has(task.id) &&
      now - task.updatedAt > 30000
    if (isStaleActiveTask) {
      return { ...task, status: 'error' as const, error: task.error || '上传已中断' }
    }
    return task
  })
  writeUploadTasks(tasks)
  return tasks.map(({ dir: _dir, path: _path, error: _error, createdAt: _createdAt, updatedAt: _updatedAt, ...task }) => task)
}

function getLocalTransferTasksForList() {
  return getUploadTasksForList().concat(getDownloadTasksForList())
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getToken()
  const clientId = getClientId()

  if (token) headers.set('Authorization', token)
  if (clientId) headers.set('Client-Id', clientId)

  let body: BodyInit | undefined
  if (options.body instanceof FormData || options.body instanceof Blob || typeof options.body === 'string') {
    body = options.body
  } else if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(options.body)
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body,
  })

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    if (!response.ok) {
      if ((response.status === 401 || response.status === 403) && !options.skipAuthExpired) {
        notifyAuthExpired()
      }
      throw new ApiError(response.statusText || '请求失败', response.status)
    }
    return undefined as T
  }

  const envelope = (await response.json()) as ApiEnvelope<T>
  if (envelope.code !== 200) {
    if ((envelope.code === 401 || envelope.code === 403) && !options.skipAuthExpired) {
      notifyAuthExpired()
    }
    throw new ApiError(envelope.message || '请求失败', envelope.code, envelope.data)
  }
  return envelope.data
}

export const authApi = {
  async login(username: string, password: string, otpCode?: string): Promise<LoginResponse> {
    return request<LoginResponse>('/api/auth/login/hash', {
      method: 'POST',
      skipAuthExpired: true,
      body: {
        username,
        password: await staticHashPassword(password),
        otp_code: otpCode,
      },
    })
  },

  register(username: string, password: string) {
    return request<void>('/api/auth/register', {
      method: 'POST',
      skipAuthExpired: true,
      body: {
        username,
        password,
      },
    })
  },

  currentUser() {
    return request<BackendUser>('/api/me', { skipAuthExpired: true })
  },

  logout() {
    return request<void>('/api/auth/logout', { skipAuthExpired: true })
  },
}

function toTransferItem(task: BackendTaskInfo): TransferItem {
  const progress = Number.isFinite(task.progress) ? Math.max(0, Math.min(100, task.progress)) : 100
  const lowerStatus = `${task.status} ${task.error ?? ''}`.toLowerCase()
  const status: TransferItem['status'] =
    task.error || lowerStatus.includes('error') || lowerStatus.includes('fail')
      ? 'error'
      : progress >= 100
        ? 'completed'
        : task.state === 0
          ? 'pending'
          : 'transferring'

  return {
    id: task.id,
    name: task.name || task.id,
    type: 'upload',
    progress,
    size: task.total_bytes || 0,
    status,
  }
}

function mergeTransferItems(items: TransferItem[]) {
  const byId = new Map<string, TransferItem>()
  for (const item of items) {
    const existing = byId.get(item.id)
    if (!existing || existing.status === 'completed') {
      byId.set(item.id, item)
    }
  }
  return Array.from(byId.values())
}

async function requestWithTimeout<T>(path: string, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await request<T>(path, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export const fileApi = {
  async list(path = '/', refresh = false): Promise<FileListResult> {
    const result = await request<BackendFsListResponse>('/api/fs/list', {
      method: 'POST',
      body: {
        path,
        page: 1,
        per_page: 500,
        refresh,
      },
    })

    return {
      path,
      provider: result.provider ?? 'unknown',
      writable: Boolean(result.write),
      files: (result.content ?? []).map((item) => toFileItem(item, path)),
    }
  },

  get(path: string) {
    return request<BackendFsGetResponse>('/api/fs/get', {
      method: 'POST',
      body: { path },
    })
  },

  mkdir(path: string) {
    return request<void>('/api/fs/mkdir', {
      method: 'POST',
      body: { path },
    })
  },

  rename(path: string, name: string) {
    return request<void>('/api/fs/rename', {
      method: 'POST',
      body: { path, name },
    })
  },

  remove(dir: string, names: string[]) {
    return request<void>('/api/fs/remove', {
      method: 'POST',
      body: { dir, names },
    })
  },

  upload(dir: string, file: File, overwrite = true) {
    const form = new FormData()
    form.set('file', file)
    const filePath = joinPath(dir, file.name)
    const id = `${UPLOAD_TASK_PREFIX}${crypto.randomUUID()}`
    const task: LocalUploadTask = {
      id,
      name: file.name,
      type: 'upload',
      progress: 0,
      size: file.size,
      status: 'pending',
      dir,
      path: filePath,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    upsertUploadTask(task, true)

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      activeUploadRequests.set(id, xhr)
      xhr.open('PUT', buildUrl('/api/fs/form'))
      const token = getToken()
      const clientId = getClientId()
      if (token) xhr.setRequestHeader('Authorization', token)
      if (clientId) xhr.setRequestHeader('Client-Id', clientId)
      xhr.setRequestHeader('File-Path', encodeURI(filePath))
      xhr.setRequestHeader('As-Task', 'true')
      xhr.setRequestHeader('Overwrite', overwrite ? 'true' : 'false')
      xhr.setRequestHeader('Last-Modified', String(file.lastModified))

      xhr.upload.onloadstart = () => {
        updateUploadTask(id, { status: 'transferring', progress: 0 })
      }
      xhr.upload.onprogress = (event) => {
        const total = event.lengthComputable ? event.total : file.size
        const progress = total > 0 ? Math.min(99, (event.loaded / total) * 100) : task.progress
        updateUploadTask(id, { status: 'transferring', progress, size: total || file.size })
      }
      xhr.onload = () => {
        try {
          const contentType = xhr.getResponseHeader('content-type') ?? ''
          if (contentType.includes('application/json') && xhr.responseText) {
            const envelope = JSON.parse(xhr.responseText) as ApiEnvelope<unknown>
            if (envelope.code !== 200) {
              throw new ApiError(envelope.message || '上传失败', envelope.code, envelope.data)
            }
          } else if (xhr.status < 200 || xhr.status >= 300) {
            throw new ApiError(xhr.statusText || '上传失败', xhr.status)
          }
          updateUploadTask(id, { status: 'completed', progress: 100 })
          activeUploadRequests.delete(id)
          resolve()
        } catch (err) {
          const message = err instanceof Error ? err.message : '上传失败'
          updateUploadTask(id, { status: 'error', error: message })
          activeUploadRequests.delete(id)
          reject(err)
        }
      }
      xhr.onerror = () => {
        const err = new Error('上传失败')
        updateUploadTask(id, { status: 'error', error: err.message })
        activeUploadRequests.delete(id)
        reject(err)
      }
      xhr.onabort = () => {
        const err = new Error('上传已取消')
        updateUploadTask(id, { status: 'error', error: err.message })
        activeUploadRequests.delete(id)
        reject(err)
      }
      xhr.send(form)
    })
  },

  downloadUrl(path: string, sign?: string) {
    const suffix = sign ? `?sign=${encodeURIComponent(sign)}` : ''
    return buildUrl(`/d${encodePath(path)}${suffix}`)
  },

  listMounts: (): ApiResult<MountSpace[]> => Promise.resolve(mockMountSpaces),
  listFolders: (): ApiResult<FolderNode[]> => Promise.resolve(mockFolderTree),
  listFiles: (): ApiResult<FileItem[]> => Promise.resolve(mockFiles),
  listLocalTransfers() {
    return getLocalTransferTasksForList()
  },

  async listTransfers(): ApiResult<TransferItem[]> {
    const localTasks = getLocalTransferTasksForList()
    try {
      const [undone, done] = await Promise.all([
        requestWithTimeout<BackendTaskInfo[]>('/api/task/upload/undone', 800),
        requestWithTimeout<BackendTaskInfo[]>('/api/task/upload/done', 800),
      ])
      return mergeTransferItems([...undone, ...done].map(toTransferItem).concat(localTasks))
    } catch {
      return localTasks
    }
  },

  async startDownloadTransfer(path: string, name: string, sign?: string, size = 0) {
    const id = `${DOWNLOAD_TASK_PREFIX}${crypto.randomUUID()}`
    const task: LocalDownloadTask = {
      id,
      name,
      type: 'download',
      progress: 0,
      size,
      status: 'pending',
      path,
      sign,
      url: this.downloadUrl(path, sign),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    upsertDownloadTask(task, true)
    void (async () => {
      try {
        if (sign) {
          await runDownloadTask(task)
          return
        }
        const detail = await this.get(path)
        const signedTask = {
          ...task,
          sign: detail.sign,
          url: this.downloadUrl(path, detail.sign),
          size: size || detail.size || 0,
        }
        upsertDownloadTask(signedTask)
        await runDownloadTask(signedTask)
      } catch (err) {
        updateDownloadTask(id, {
          status: 'error',
          error: err instanceof Error ? err.message : '创建下载任务失败',
        })
      }
    })()
    return task
  },

  cancelTransfer(id: string) {
    if (isUploadTaskId(id)) {
      activeUploadRequests.get(id)?.abort()
      updateUploadTask(id, { status: 'error', error: '上传已取消' })
      return Promise.resolve()
    }
    if (isDownloadTaskId(id)) {
      activeDownloadControllers.get(id)?.abort()
      updateDownloadTask(id, { status: 'error', error: '下载已取消' })
      return Promise.resolve()
    }
    return request<void>(`/api/task/upload/cancel?tid=${encodeURIComponent(id)}`, { method: 'POST' })
  },

  deleteTransfer(id: string) {
    if (isUploadTaskId(id)) {
      activeUploadRequests.get(id)?.abort()
      removeUploadTask(id)
      return Promise.resolve()
    }
    if (isDownloadTaskId(id)) {
      activeDownloadControllers.get(id)?.abort()
      removeDownloadTask(id)
      return Promise.resolve()
    }
    return request<void>(`/api/task/upload/delete?tid=${encodeURIComponent(id)}`, { method: 'POST' })
  },

  retryTransfer(id: string) {
    if (isUploadTaskId(id)) {
      return Promise.reject(new Error('请重新选择文件上传'))
    }
    if (isDownloadTaskId(id)) {
      const task = readDownloadTasks().find((item) => item.id === id)
      if (!task) return Promise.reject(new Error('下载任务不存在'))
      const next = { ...task, status: 'pending' as const, progress: 0, error: undefined, updatedAt: Date.now() }
      upsertDownloadTask(next)
      void runDownloadTask(next)
      return Promise.resolve()
    }
    return request<void>(`/api/task/upload/retry?tid=${encodeURIComponent(id)}`, { method: 'POST' })
  },

  async clearDoneTransfers() {
    writeDownloadTasks(readDownloadTasks().filter((task) => task.status !== 'completed'))
    writeUploadTasks(readUploadTasks().filter((task) => task.status !== 'completed'))
    notifyTransfersChanged()
    await request<void>('/api/task/upload/clear_done', { method: 'POST' })
  },
}

export const adminApi = {
  async listUsers(page = 1, perPage = 200) {
    return request<BackendPageResp<BackendUser>>(`/api/admin/user/list?page=${page}&per_page=${perPage}`)
  },

  createUser(payload: Partial<BackendUser> & { password: string }) {
    return request<void>('/api/admin/user/create', {
      method: 'POST',
      body: payload,
    })
  },

  updateUser(payload: Partial<BackendUser>) {
    return request<void>('/api/admin/user/update', {
      method: 'POST',
      body: payload,
    })
  },

  deleteUser(id: number) {
    return request<void>(`/api/admin/user/delete?id=${id}`, {
      method: 'POST',
    })
  },

  cancelUser2FA(id: number) {
    return request<void>(`/api/admin/user/cancel_2fa?id=${id}`, {
      method: 'POST',
    })
  },

  async listRoles(page = 1, perPage = 200) {
    return request<BackendPageResp<BackendRole>>(`/api/admin/role/list?page=${page}&per_page=${perPage}`)
  },

  listMockUsers: (): ApiResult<AdminUser[]> => Promise.resolve(mockUsers),
  async listStorages(page = 1, perPage = 200) {
    return request<BackendPageResp<BackendStorage>>(`/api/admin/storage/list?page=${page}&per_page=${perPage}`)
  },

  createStorage(payload: Partial<BackendStorage>) {
    return request<{ id: number }>('/api/admin/storage/create', {
      method: 'POST',
      body: payload,
    })
  },

  updateStorage(payload: Partial<BackendStorage>) {
    return request<void>('/api/admin/storage/update', {
      method: 'POST',
      body: payload,
    })
  },

  deleteStorage(id: number) {
    return request<void>(`/api/admin/storage/delete?id=${id}`, {
      method: 'POST',
    })
  },

  enableStorage(id: number) {
    return request<void>(`/api/admin/storage/enable?id=${id}`, {
      method: 'POST',
    })
  },

  disableStorage(id: number) {
    return request<void>(`/api/admin/storage/disable?id=${id}`, {
      method: 'POST',
    })
  },

  listDriverNames() {
    return request<string[]>('/api/admin/driver/names')
  },

  getSettings(keys: string[]) {
    return request<BackendSettingItem[]>(`/api/admin/setting/get?keys=${encodeURIComponent(keys.join(','))}`)
  },

  saveSettings(items: Pick<BackendSettingItem, 'key' | 'value'>[]) {
    return request<void>('/api/admin/setting/save', {
      method: 'POST',
      body: items,
    })
  },

  listStorageMounts: (): ApiResult<StorageMount[]> => Promise.resolve(mockStorageMounts),
  listProtocolPorts: (): ApiResult<ProtocolPort[]> => Promise.resolve(mockProtocolPorts),
}

export function logMockAction(action: string, payload?: unknown) {
  console.log(`[mock-action] ${action}`, payload ?? {})
}

function toFileItem(item: BackendFsObj, parentPath: string): FileItem {
  const fullPath = item.virtual_path || joinPath(parentPath, item.name)
  const extension = item.is_dir ? undefined : getExtension(item.name)
  return {
    id: fullPath,
    name: item.name,
    type: item.is_dir ? 'folder' : 'file',
    fileType: item.is_dir ? '文件夹' : extension?.toUpperCase() || '文件',
    size: item.size,
    modified: formatDate(item.modified),
    extension,
    path: fullPath,
    created: item.created ? formatDate(item.created) : undefined,
    permissions: item.storage_class,
  }
}

function getExtension(name: string) {
  const index = name.lastIndexOf('.')
  if (index < 0 || index === name.length - 1) {
    return undefined
  }
  return name.slice(index + 1).toLowerCase()
}

function formatDate(value: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

function joinPath(dir: string, name: string) {
  const base = dir === '/' ? '' : dir.replace(/\/$/, '')
  return `${base}/${name}`.replace(/\/+/g, '/')
}

function encodePath(path: string) {
  return path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}
