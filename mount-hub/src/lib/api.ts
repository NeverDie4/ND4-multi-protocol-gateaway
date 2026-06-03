import {
  mockFiles,
  mockFolderTree,
  mockMountSpaces,
  mockProtocolPorts,
  mockStorageMounts,
  mockTransfers,
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

function buildUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
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

  currentUser() {
    return request<BackendUser>('/api/me', { skipAuthExpired: true })
  },

  logout() {
    return request<void>('/api/auth/logout', { skipAuthExpired: true })
  },
}

export const fileApi = {
  async list(path = '/'): Promise<FileListResult> {
    const result = await request<BackendFsListResponse>('/api/fs/list', {
      method: 'POST',
      body: {
        path,
        page: 1,
        per_page: 500,
        refresh: false,
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

  async upload(dir: string, file: File, overwrite = true) {
    const form = new FormData()
    form.set('file', file)
    const filePath = joinPath(dir, file.name)
    return request<void>('/api/fs/form', {
      method: 'PUT',
      headers: {
        'File-Path': encodeURI(filePath),
        Overwrite: overwrite ? 'true' : 'false',
        'Last-Modified': String(file.lastModified),
      },
      body: form,
    })
  },

  downloadUrl(path: string, sign?: string) {
    const suffix = sign ? `?sign=${encodeURIComponent(sign)}` : ''
    return buildUrl(`/d${encodePath(path)}${suffix}`)
  },

  listMounts: (): ApiResult<MountSpace[]> => Promise.resolve(mockMountSpaces),
  listFolders: (): ApiResult<FolderNode[]> => Promise.resolve(mockFolderTree),
  listFiles: (): ApiResult<FileItem[]> => Promise.resolve(mockFiles),
  listTransfers: (): ApiResult<TransferItem[]> => Promise.resolve(mockTransfers),
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
