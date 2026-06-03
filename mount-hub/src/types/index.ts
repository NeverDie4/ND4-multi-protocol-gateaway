import type { LucideIcon } from 'lucide-react'

export type MountProtocol = 'smb' | 'webdav' | 'ftp' | 'sftp' | 's3' | 'local'
export type MountStatus = 'connected' | 'warning' | 'disconnected' | 'error'

export interface MountSpace {
  id: string
  name: string
  protocol: MountProtocol
  status: MountStatus
}

export interface FileItem {
  id: string
  name: string
  type: 'folder' | 'file'
  fileType?: string
  size?: number
  modified: string
  extension?: string
  path?: string
  permissions?: string
  created?: string
}

export interface FolderNode {
  id: string
  name: string
  children?: FolderNode[]
  isExpanded?: boolean
}

export interface TransferItem {
  id: string
  name: string
  type: 'upload' | 'download'
  progress: number
  size: number
  status: 'pending' | 'transferring' | 'completed' | 'error'
}

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  username?: string
  isAdmin?: boolean
}

export interface ApiEnvelope<T> {
  code: number
  message: string
  data: T
}

export interface BackendUser {
  id: number
  username: string
  role?: number[]
  role_names?: string[]
  base_path?: string
  disabled?: boolean
  otp?: boolean
  permission?: number
  sso_id?: string
}

export interface BackendPermissionEntry {
  path: string
  permission: number
}

export interface BackendRole {
  id: number
  name: string
  description: string
  default: boolean
  permission_scopes?: BackendPermissionEntry[]
}

export interface CreateUserPayload {
  username: string
  password: string
  base_path: string
  role: number[]
  disabled?: boolean
  permission?: number
  sso_id?: string
}

export interface LoginResponse {
  token: string
  device_key?: string
}

export interface BackendFsObj {
  id?: string
  path?: string
  virtual_path?: string
  name: string
  size: number
  is_dir: boolean
  modified: string
  created?: string
  sign?: string
  thumb?: string
  type?: number
  hashinfo?: string
  storage_class?: string
}

export interface BackendFsListResponse {
  content: BackendFsObj[] | null
  total: number
  filtered_total?: number
  page: number
  per_page: number
  has_more: boolean
  pages_total: number
  readme?: string
  header?: string
  write?: boolean
  provider?: string
}

export interface BackendFsGetResponse extends BackendFsObj {
  raw_url?: string
  readme?: string
  header?: string
  provider?: string
  related?: BackendFsObj[]
}

export interface FileListResult {
  path: string
  provider: string
  writable: boolean
  files: FileItem[]
}

export type AdminCategoryId = 'mounts' | 'users' | 'webdav' | 'https' | 'speed' | 'ports'

export interface AdminCategory {
  id: AdminCategoryId
  name: string
  icon: string
}

export interface AdminUser {
  id: string
  username: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'disabled'
  twoFA: boolean
  devices: number
  maxDevices: number
}

export interface StorageMount {
  id: string
  name: string
  protocol: string
  path: string
  status: 'online' | 'offline' | 'warning'
}

export interface BackendPageResp<T> {
  content: T[]
  total: number
}

export interface BackendStorage {
  id: number
  mount_path: string
  order: number
  driver: string
  cache_expiration: number
  status: string
  addition: string
  remark: string
  modified: string
  disabled: boolean
  disable_index: boolean
  enable_sign: boolean
  order_by?: string
  order_direction?: string
  extract_folder?: string
  web_proxy?: boolean
  webdav_policy?: string
  proxy_range?: boolean
  down_proxy_url?: string
  down_proxy_sign?: boolean
}

export interface CreateStoragePayload {
  mount_path: string
  driver: string
  addition: string
  order?: number
  cache_expiration?: number
  remark?: string
  disabled?: boolean
  web_proxy?: boolean
  webdav_policy?: string
  proxy_range?: boolean
}

export type StorageDriver = 'Local' | 'FTP' | 'WebDav' | 'SFTP' | 'S3'

export interface ProtocolPort {
  protocol: string
  port: number
  status: 'running' | 'initializing' | 'stopped'
  enabled: boolean
  icon: string
}

export interface ProtocolOption {
  id: MountProtocol
  name: string
  description: string
  icon: LucideIcon
}

export interface RecentSearch {
  id: string
  text: string
  type: 'search' | 'file' | 'folder'
}

export type ApiResult<T> = Promise<T>
