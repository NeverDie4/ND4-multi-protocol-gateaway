# 前端路由规划

> 前端框架：React 19 + TanStack Router + shadcn/ui  
> 路由前缀：`/@manage` 管理后台、`/s/` 分享、其余为文件浏览  
> Auth 守卫：`_auth` 布局层校验 token，未登录跳 `@login`  
> Admin 守卫：`@manage` 布局层校验 role 含 admin

---

## 路由树

```
── @login                              # [Public] 登录页
── @test                               # [Dev] 测试页，仅 --debug 模式
── s/$shareId                          # [Public] 分享浏览
│   └── $                              #         分享子路径（catch-all）
│
── _auth                               # [Auth] 认证布局（token 校验）
│   ├── /                              # 文件浏览器主页
│   │
│   ├── @manage                        # [Admin] 管理后台布局
│   │   ├── /                          # 仪表盘 / 个人资料
│   │   │
│   │   ├── storages                   # 存储驱动管理
│   │   │   ├── add                    # 添加存储
│   │   │   └── $id                    # 编辑存储
│   │   │
│   │   ├── users                      # 用户管理
│   │   │   ├── add                    # 添加用户
│   │   │   └── $id                    # 编辑用户
│   │   │
│   │   ├── metas                      # Meta 元数据管理
│   │   │   ├── add                    # 添加 Meta
│   │   │   └── $id                    # 编辑 Meta
│   │   │
│   │   ├── permissions                # 权限管理
│   │   │   ├── role                   # 角色列表（含 permission_scopes）
│   │   │
│   │   ├── shares                     # 分享管理
│   │   │
│   │   ├── tasks                      # 任务中心
│   │   │   ├── upload                 # 上传任务
│   │   │   ├── copy                   # 复制任务
│   │   │   ├── offline_download       # 离线下载任务
│   │   │   ├── decompress             # 解压任务
│   │   │   └── s3_transition          # S3 冷热迁移任务
│   │   │
│   │   ├── settings                   # 系统设置
│   │   │   ├── site                   # 站点设置
│   │   │   ├── style                  # 样式/主题
│   │   │   ├── preview                # 预览设置
│   │   │   ├── preview-settings       # 高级预览配置
│   │   │   ├── global                 # 全局设置
│   │   │   ├── sso                    # SSO 配置
│   │   │   ├── ldap                   # LDAP 配置
│   │   │   ├── s3                     # S3 服务配置
│   │   │   ├── tag                    # 标签全局设置
│   │   │   ├── ftp                    # FTP 服务配置
│   │   │   ├── frp                    # FRP 内网穿透
│   │   │   ├── traffic               # 流量/限速配置
│   │   │   └── other                  # 其他 (aria2/qbit/tokens)
│   │   │
│   │   ├── indexes                    # 搜索索引管理
│   │   │
│   │   ├── backup-restore             # 备份与恢复
│   │   │
│   │   ├── session                    # 会话管理
│   │   │   ├── my                     # 我的会话
│   │   │   └── management             # 会话管理（管理员）
│   │   │
│   │   ├── messenger                  # 消息/公告
│   │   │
│   │   ├── 2fa                        # 双因素认证
│   │   │
│   │   └── about                      # 关于
│   │
│   └── $                              # [Auth] 404
│
── $                                    # [Public] 根级 404
```

---

## 各路由所需 API

### P0 — 核心流程

| 路由 | 页面 | 所需 API |
|------|------|----------|
| `@login` | 登录 | `POST /api/auth/login/hash`, `GET /api/public/settings` |
| `/` | 文件浏览器 | `POST /api/fs/list`, `POST /api/fs/get`, `POST /api/fs/dirs`, `POST /api/fs/search` |
| `/` (工具栏) | 文件操作 | `POST /api/fs/mkdir /rename /batch_rename /regex_rename /move /recursive_move /copy /remove /remove_empty_directory`, `PUT /api/fs/put /form`, `POST /api/fs/add_offline_download` |
| (直链) | 下载/代理 | `GET /d/*path`, `GET /p/*path` (浏览器直接请求，不走前端路由) |
| (直链) | 归档操作 | `POST /api/fs/archive/meta /list /decompress`, `GET /ad/*path /ap/*path /ae/*path` |

### P1 — 管理基础

| 路由 | 页面 | 所需 API |
|------|------|----------|
| `@manage/storages` | 存储列表 | `GET /api/admin/storage/list /get`, `POST /api/admin/storage/create /update /delete /enable /disable /load_all` |
| `@manage/storages/add` | 添加存储 | `GET /api/admin/driver/list /names /info` |
| `@manage/storages/$id` | 编辑存储 | 同存储列表（get + update） |
| `@manage/users` | 用户列表 | `GET /api/admin/user/list /get`, `POST create /update /delete /cancel_2fa /del_cache` |
| `@manage/users/$id` | 编辑用户 | 同上 + `GET /api/admin/user/sshkey/list`, `POST sshkey/delete` |
| `@manage/permissions/role` | 角色管理 | `GET /api/admin/role/list /get`, `POST create /update /delete`（权限条目通过角色对象的 `permission_scopes` 字段管理，无独立 permission CRUD 端点） |
| `@manage/metas` | Meta 管理 | `GET /api/admin/meta/list /get`, `POST create /update /delete` |
| `@manage/metas/$id` | 编辑 Meta | 同 Meta 管理（get + update） |
| `@manage/settings/site` | 站点设置 | `GET /api/admin/setting/list?groups=`, `POST /api/admin/setting/save` |
| `@manage/shares` | 分享管理 | `GET /api/share/list`, `POST /api/share/create /update /delete /disable` |
| `@manage/settings/tag` | 标签管理 | `GET /api/label/list /get`, `POST /api/admin/label/create /update /delete`, `GET /api/admin/label_file_binding/list`, `POST create /create_batch /delete /restore` |

### P2 — 设置与任务

| 路由 | 页面 | 所需 API |
|------|------|----------|
| `@manage/settings/style` | 样式设置 | `GET /api/admin/setting/list?groups=`, `POST /api/admin/setting/save` |
| `@manage/settings/preview` | 预览设置 | 同上 |
| `@manage/settings/preview-settings` | 高级预览 | 同上 |
| `@manage/settings/global` | 全局设置 | 同上 |
| `@manage/settings/sso` | SSO 配置 | 同上 |
| `@manage/settings/ldap` | LDAP 配置 | 同上 |
| `@manage/settings/s3` | S3 设置 | 同上 |
| `@manage/settings/ftp` | FTP 设置 | 同上 |
| `@manage/settings/frp` | FRP 设置 | `GET /api/admin/setting/list?groups=`, `POST /api/admin/setting/save`, `POST /api/admin/setting/set_frp /stop_frp`, `GET /api/admin/setting/frp_runtime` |
| `@manage/settings/traffic` | 流量限速 | `GET /api/admin/setting/list?groups=`, `POST /api/admin/setting/save` |
| `@manage/settings/other` | 下载工具 | `GET /api/admin/setting/list?groups=`, `POST /api/admin/setting/save`, `POST /api/admin/setting/set_aria2 /set_qbit /set_transmission /set_115 /set_pikpak /set_thunder /set_guangyapan`, `POST /api/admin/setting/reset_token /set_token` |
| `@manage/tasks/upload` | 上传任务 | `GET /api/task/upload/undone /done`, `POST info /cancel /delete /retry /cancel_some /delete_some /retry_some /clear_done /clear_succeeded /retry_failed` |
| `@manage/tasks/copy` | 复制任务 | 同上 (type=copy) |
| `@manage/tasks/offline_download` | 离线下载 | 同上 (type=offline_download) |
| `@manage/tasks/decompress` | 解压任务 | 同上 (type=decompress) |
| `@manage/tasks/s3_transition` | S3 迁移 | 同上 (type=s3_transition) |
| `@manage/indexes` | 搜索索引 | `POST /api/admin/index/build /update /clear /stop`, `GET /api/admin/index/progress` |

> 注：后端另有 `offline_download_transfer` 和 `decompress_upload` 两种任务类型，无独立前端页面（合并至对应父类型页面或内部使用）。

### P3 — 用户功能 & 分享

| 路由 | 页面 | 所需 API |
|------|------|----------|
| `@manage/` | 个人资料 | `GET /api/me`, `POST /api/me/update`, `GET /api/me/sshkey/list`, `POST sshkey/add /delete` |
| `@manage/session/my` | 我的会话 | `GET /api/me/sessions`, `POST /api/me/sessions/evict` |
| `@manage/session/management` | 会话管理 | `GET /api/admin/session/list`, `POST /api/admin/session/evict` |
| `@manage/2fa` | 双因素认证 | `POST /api/auth/2fa/generate /verify` |
| `@manage/messenger` | 消息公告 | `POST /api/admin/message/get /send` |
| `@manage/backup-restore` | 备份恢复 | (后端已实现，按配置操作) |
| `@manage/about` | 关于 | 静态信息，无需 API |
| `s/$shareId` | 分享浏览 | `GET /api/public/share/info`, `POST /api/public/share/auth /list /get` |
| `s/$shareId/$` | 分享子路径 | 同上 + `GET /sd/$shareId/$`, `GET /sp/$shareId/$` |

---

## 路由设计说明

### 文件浏览器路由

`/` 即为主页，文件路径通过 URL query `?path=` 传递（与 Go 后端 SPA fallback 注入兼容）。无需为每个目录单独注册路由。

### 下载与代理直链

以下路由不经过前端 Router，由浏览器直接请求或 `window.open` 触发：

| 路由模式 | 用途 |
|----------|------|
| `GET /d/*path` | 文件下载（302 重定向或 ServeContent）|
| `GET /p/*path` | 透明代理下载（支持 Range）|
| `GET /ad/*path` | 归档内文件下载 |
| `GET /ap/*path` | 归档内文件代理 |
| `GET /ae/*path` | 归档内文件提取 |
| `GET /sd/:shareId` | 分享文件下载（根） |
| `GET /sd/:shareId/*path` | 分享文件下载（子路径） |
| `GET /sp/:shareId` | 分享文件代理（根） |
| `GET /sp/:shareId/*path` | 分享文件代理（子路径） |

### Auth 守卫逻辑

```
1. 读取 localStorage/cookie 中的 token
2. 无 token → redirect to @login?redirect=<原路径>
3. 有 token → GET /api/me 验证
   - 成功 → 放行，写入 user store (zustand)
   - 失败 (401) → 清除 token，redirect to @login
```

### Admin 守卫逻辑

```
1. 检查 user store 中 role 是否含 admin
2. 非 admin → 显示 403 页面
3. admin → 放行
```

### 动态页面标题

每个路由通过 TanStack Router 的 `head` 或 route context 设置 `document.title`，格式：

```
AList - {页面名称}
```

---

## 路由统计

| 类别 | 数量 |
|------|------|
| 公共路由 | 4 (`@login` `s/$shareId` `s/$shareId/$` `$`) |
| Auth 路由 | 1 (`/` 文件浏览器) |
| Admin 路由 | 37 (`@manage/*` 全部子路由) |
| Dev 路由 | 1 (`@test`) |
| **合计** | **43** |

---

## 实施顺序

| 阶段 | 内容 | 页面数 |
|------|------|--------|
| 1 | 路由骨架 + TanStack Router 配置 + Auth/Admin 守卫 + 登录页 | 2 |
| 2 | 文件浏览器主页（list/get/dirs/search） | 1 |
| 3 | 文件操作工具栏（上传/删除/重命名/移动/复制/mkdir） | (内联) |
| 4 | 存储管理 + 用户管理 + 角色管理 | 7 |
| 5 | Meta + 分享 + 标签 + 会话 | 6 |
| 6 | 设置页 13 个 + 任务中心 5 个 + 索引 + 备份 + 2FA + 消息 + 关于 | 23 |
| 7 | 分享公开页面 | 2 |
