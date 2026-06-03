// Mock 数据

export interface MountSpace {
  id: string
  name: string
  protocol: 'smb' | 'webdav' | 'ftp' | 'sftp' | 's3' | 'local'
  status: 'connected' | 'warning' | 'disconnected' | 'error'
}

export interface FileItem {
  id: string
  name: string
  type: 'folder' | 'file'
  fileType?: string // 文件类型描述
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

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
}

// Mock 挂载空间 - 按原型图更新
export const mockMountSpaces: MountSpace[] = [
  { id: '1', name: 'Local', protocol: 'local', status: 'connected' },
  { id: '2', name: 'WebDAV', protocol: 'webdav', status: 'connected' },
  { id: '3', name: 'SFTP', protocol: 'sftp', status: 'warning' },
  { id: '4', name: 'FTP', protocol: 'ftp', status: 'connected' },
  { id: '5', name: 'S3', protocol: 's3', status: 'connected' },
]

// Mock 目录树 - 按原型图更新
export const mockFolderTree: FolderNode[] = [
  {
    id: '1',
    name: 'docs',
    isExpanded: true,
    children: [
      { id: '1-1', name: 'reports' },
      { id: '1-2', name: 'invoices' },
    ]
  },
]

// Mock 文件列表 - 按原型图更新
export const mockFiles: FileItem[] = [
  { 
    id: '1', 
    name: 'Q3_Financial_Summary.pdf', 
    type: 'file', 
    fileType: 'PDF 文档',
    size: 2516582, // 2.4 MB
    modified: 'Oct 12, 10:45 AM', 
    extension: 'pdf',
    path: '/docs/reports/Q3_Financial_Summary.pdf',
    permissions: 'rw-r--r--',
    created: 'Oct 12, 2023, 10:40 AM'
  },
  { 
    id: '2', 
    name: 'Weekly_Metrics_Update.xlsx', 
    type: 'file', 
    fileType: '电子表格',
    size: 865280, // 845 KB
    modified: 'Oct 10, 2:15 PM', 
    extension: 'xlsx',
    path: '/docs/reports/Weekly_Metrics_Update.xlsx',
    permissions: 'rw-r--r--',
    created: 'Oct 10, 2023, 2:00 PM'
  },
  { 
    id: '3', 
    name: 'Project_Alpha_Draft.docx', 
    type: 'file', 
    fileType: 'Word 文档',
    size: 1258291, // 1.2 MB
    modified: 'Oct 08, 9:00 AM', 
    extension: 'docx',
    path: '/docs/reports/Project_Alpha_Draft.docx',
    permissions: 'rw-r--r--',
    created: 'Oct 08, 2023, 8:45 AM'
  },
]

// Mock 传输列表
export const mockTransfers: TransferItem[] = [
  { id: '1', name: 'design_mockup.fig', type: 'upload', progress: 75, size: 2456000, status: 'transferring' },
  { id: '2', name: 'presentation.pptx', type: 'upload', progress: 30, size: 8560000, status: 'transferring' },
  { id: '3', name: 'report_backup.zip', type: 'download', progress: 45, size: 156000000, status: 'transferring' },
]

// Mock 用户列表
export const mockUsers: User[] = [
  { id: '1', name: '张三', email: 'zhangsan@example.com', role: 'admin' },
  { id: '2', name: '李四', email: 'lisi@example.com', role: 'user' },
  { id: '3', name: '王五', email: 'wangwu@example.com', role: 'user' },
  { id: '4', name: '访客用户', email: 'guest@example.com', role: 'guest' },
]

// 管理中心分类
export const adminCategories = [
  { id: 'mounts', name: '挂载管理', icon: 'hard-drive' },
  { id: 'users', name: '用户权限', icon: 'users' },
  { id: 'webdav', name: 'WebDAV 服务', icon: 'globe' },
  { id: 'https', name: 'HTTPS 安全', icon: 'shield' },
  { id: 'speed', name: '传输限速', icon: 'gauge' },
  { id: 'ports', name: '协议端口', icon: 'network' },
]

// 格式化文件大小
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '-'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let size = bytes
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

// 获取文件图标
export function getFileIcon(type: string, extension?: string): string {
  if (type === 'folder') return 'folder'
  switch (extension) {
    case 'pdf': return 'file-text'
    case 'doc':
    case 'docx': return 'file-text'
    case 'xls':
    case 'xlsx': return 'file-spreadsheet'
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return 'image'
    case 'mp3':
    case 'wav': return 'music'
    case 'mp4':
    case 'mov':
    case 'avi': return 'video'
    case 'zip':
    case 'rar':
    case '7z': return 'archive'
    case 'json':
    case 'xml':
    case 'yaml': return 'file-code'
    default: return 'file'
  }
}
