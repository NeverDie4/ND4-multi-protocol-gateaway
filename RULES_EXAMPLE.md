# AI 开发规则

AList 多协议文件挂载平台 —— 前后端分离，后端 Go/Gin RESTful，前端 React 19 SPA。支持本地文件系统挂载与 FTP/WebDAV/SFTP/S3 协议中转。

## 开发环境

| 项目 | 配置 | 备注 |
|------|------|------|
| 系统 | macOS / Windows / Linux | |
| Go | 1.25+ | `go.mod` 声明 |
| Node.js | 22 LTS | Vite 6+ 最低 Node 18 |
| 包管理器 | pnpm 9+ | |
| 数据库 | MySQL / PostgreSQL | 生产环境；开发可用 SQLite3 |
| HTTP 端口 | 5244 | `scheme.http_port` |

## 服务端口

| 端口 | 服务 | 说明 |
|------|------|------|
| 5244 | HTTP API | 主服务，Gin Router |
| 5221 | FTP | ftpserverlib |
| 5222 | SFTP | 密码 / 公钥 / 访客认证 |
| 5246 | S3 | S3 兼容协议 |
| 5248 | MCP | AI 助手集成 (HTTP Streamable + STDIO) |
| `/dav` | WebDAV | 共享 HTTP 端口，Windows/macOS 可挂载 |

## 文档索引

| 文档 | 内容 |
|------|------|
| `需求分析文档.md` | 逐项需求对照 + 缺口清单 + 验收方案 |
| `架构分析文档.md` | 分层架构 + 数据流 + DB 表结构 + 设计模式 |
| `API文档.md` | 全部 180+ 端点（含重定向/代理/WebDAV/分享路由） |
| `技术选型文档.md` | 全栈技术栈（前端 React 全家桶 / 后端 Go / 数据库） |

## 关键目录

```
.
├── cmd/                # CLI 命令 (server/admin)
├── server/             # HTTP 层 (路由/中间件/Handler/WebDAV/FTP/SFTP/S3/MCP)
├── internal/
│   ├── fs/             # 路径 → 存储映射
│   ├── op/             # 操作编排 (缓存/去重/排序)
│   ├── driver/         # 驱动接口
│   ├── model/          # 数据模型
│   ├── db/             # GORM CRUD
│   └── conf/           # 全局配置
├── drivers/            # 90+ 存储驱动 (local/ftp/webdav/sftp/s3/...)
├── web/                # 前端源码 (React 19 + shadcn/ui + Vite)
├── web-example/        # alist-web 参考 (gitignored)
└── public/dist/        # 前端构建产物 → Go embed (gitignored)
```

## 注意事项

- Handler 中通过 `ctx.MustGet("user").(*model.User)` 获取当前用户
- 权限用 `common.MergeRolePermissions(user, path)` 获取位掩码
- 存储路由用 `op.GetStorageAndActualPath(path)` 最长前缀匹配
- 下载返回三种模式：`MFile`(本地 ServeContent) / `RangeReadCloser`(多线程分块) / `URL`(302 重定向或透明代理)
- 修改后必须 `go build ./...` 验证编译通过
- 不确定时主动提问，不硬猜

---
