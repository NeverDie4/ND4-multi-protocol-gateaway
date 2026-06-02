# AList API 完整文档

> **基础路径**: `{url_path}` (默认为 `/`，可通过配置 `url_path` 修改)  
> **认证方式**: `Authorization: <token>`（JWT）或 `Authorization: <admin_raw_token>`  
> **统一响应格式**: `{"code": 200, "message": "success", "data": {...}}`  
> **错误响应**: `{"code": 4xx/5xx, "message": "错误信息", "data": null}`  

---

## 0. 路由总览 —— 重定向与直传关系

### 0.1 前端 SPA 路由

| 路由 | 方法 | 行为 | 说明 |
|------|------|------|------|
| `/` | GET | `302 → url_path` | 若 `url_path` 非 `/` 则重定向 |
| `/*` (NoRoute) | GET/POST | `200 → index.html` | SPA fallback，返回注入配置后的 HTML |
| `/@manage/*` (NoRoute) | GET/POST | `200 → ManageHtml` | 管理后台 SPA |

### 0.2 文件下载与代理（直传路由）

| 路由 | 方法 | 中间件 | 行为 | 说明 |
|------|------|--------|------|------|
| `GET /d/*path` | GET | Sign → RateLimit | `handles.Down` | 文件下载：先判断是否应代理，否则获取直链并 302 重定向 |
| `HEAD /d/*path` | HEAD | Sign | `handles.Down` | 仅返回响应头 |
| `GET /p/*path` | GET | Sign → RateLimit | `handles.Proxy` | 代理下载：服务器中转文件流（透明代理），支持 Range |
| `HEAD /p/*path` | HEAD | Sign | `handles.Proxy` | 仅返回响应头 |

> **路由决策**: `/d/*path` 内部会判断 `canProxy(storage, filename)` 决定走 302 重定向还是本地代理；`/p/*path` 强制走代理。

### 0.3 归档内文件下载

| 路由 | 方法 | 中间件 | 行为 |
|------|------|--------|------|
| `GET /ad/*path` | GET | ArchiveSign → RateLimit | 归档文件直接下载 |
| `GET /ap/*path` | GET | ArchiveSign → RateLimit | 归档文件代理下载 |
| `GET /ae/*path` | GET | ArchiveSign → RateLimit | 归档文件内部提取 |
| `HEAD /ad|/ap|/ae/*path` | HEAD | ArchiveSign | 归档文件 HEAD |

### 0.4 分享相关路由

| 路由 | 方法 | 中间件 | 行为 |
|------|------|--------|------|
| `GET /s/:share_id` | GET | — | 获取分享页面 |
| `GET /s/:share_id/*path` | GET | — | 获取分享页面的子路径 |
| `GET /sd/:share_id` | GET | RateLimit | 分享文件直接下载 |
| `GET /sd/:share_id/*path` | GET | RateLimit | 分享子文件直接下载 |
| `HEAD /sd/:share_id` | HEAD | — | 分享文件 HEAD |
| `HEAD /sd/:share_id/*path` | HEAD | — | 分享子文件 HEAD |
| `GET /sp/:share_id` | GET | RateLimit | 分享文件代理下载 |
| `GET /sp/:share_id/*path` | GET | RateLimit | 分享子文件代理下载 |
| `HEAD /sp/:share_id` | HEAD | — | 分享文件代理 HEAD |
| `HEAD /sp/:share_id/*path` | HEAD | — | 分享子文件代理 HEAD |

### 0.5 WebDAV / S3 服务路由

| 路由 | 说明 |
|------|------|
| `ANY /dav` 和 `ANY /dav/*path` | WebDAV 协议端点（PROPFIND/GET/PUT/MKCOL/DELETE/MOVE/COPY/LOCK/UNLOCK/PROPPATCH） |
| `ANY /s3/*` | S3 兼容协议端点 |

### 0.6 其他全局路由

| 路由 | 方法 | 说明 |
|------|------|------|
| `/ping` | ANY | 健康检查，返回 `pong` |
| `/favicon.ico` | GET | 返回 favicon |
| `/robots.txt` | GET | 返回 robots.txt |
| `/i/:link_name` | GET | Plist 代理 |

---

## 1. 认证 API（`/api/auth`、`/api/me`、`/api/authn`）

### 1.1 登录

| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/auth/login` | POST | 无 (IP 限频 5次/5分钟) | 密码明文登录（不推荐） |
| `/api/auth/login/hash` | POST | 无 (IP 限频) | 密码 SHA256(md5(pwd)+salt) 登录 |

**请求体**:
```json
{
  "username": "string (required)",
  "password": "string",
  "otp_code": "string (2FA启用时必填)"
}
```
**响应**: `{"code":200,"message":"success","data":{"token":"<jwt>","device_key":"<md5>"}}`

| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/auth/login/ldap` | POST | 无 | LDAP 登录 |
| `/api/auth/register` | POST | 无 | 用户注册（需 `allow_register=true`） |
| `/api/auth/logout` | GET | Auth | 登出（使 token 失效） |

### 1.2 SSO

| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/auth/sso` | GET | 无 | SSO 登录跳转 |
| `/api/auth/sso_callback` | GET | 无 | SSO 回调 |
| `/api/auth/get_sso_id` | GET | 无 | 获取 SSO ID |
| `/api/auth/sso_get_token` | GET | 无 | SSO 获取 Token |

### 1.3 2FA

| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/auth/2fa/generate` | POST | Auth | 生成 TOTP 密钥和二维码 |
| `/api/auth/2fa/verify` | POST | Auth | 验证并启用 2FA |
| `/api/admin/user/cancel_2fa` | POST | Admin | 管理员取消用户的 2FA |

### 1.4 WebAuthn

| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/authn/webauthn_begin_login` | GET | 无 | 开始 WebAuthn 登录 |
| `/api/authn/webauthn_finish_login` | POST | 无 | 完成 WebAuthn 登录 |
| `/api/authn/webauthn_begin_registration` | GET | Authn | 开始注册设备 |
| `/api/authn/webauthn_finish_registration` | POST | Authn | 完成注册设备 |
| `/api/authn/delete_authn` | POST | Authn | 删除已注册设备 |
| `/api/authn/getcredentials` | GET | Authn | 获取已注册凭证列表 |

### 1.5 当前用户

| 端点 | 方法 | 认证 | 说明 |
|------|------|------|------|
| `/api/me` | GET | Auth | 获取当前用户信息 |
| `/api/me/update` | POST | Auth | 更新当前用户信息 |
| `/api/me/sshkey/list` | GET | Auth | 我的公钥列表 |
| `/api/me/sshkey/add` | POST | Auth | 添加公钥 |
| `/api/me/sshkey/delete` | POST | Auth | 删除公钥 |
| `/api/me/sessions` | GET | Auth | 我的活跃会话列表 |
| `/api/me/sessions/evict` | POST | Auth | 驱逐我的指定会话 |

---

## 2. 文件系统 API（`/api/fs`）—— 需 Auth 认证

### 2.1 读取

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/fs/list` | POST | 文件/目录列表 |
| `/api/fs/get` | POST | 获取单个文件/目录详情 |
| `/api/fs/dirs` | POST | 获取目录树（仅目录） |
| `/api/fs/search` | POST | 全文搜索（需 SearchIndex 中间件） |
| `/api/fs/other` | POST | 驱动自定义操作 |

**`/api/fs/list` 请求体**:
```json
{
  "path": "string (挂载路径)",
  "password": "string (meta密码)",
  "page": "int",
  "per_page": "int (默认200, 最大500, -1=全部)",
  "refresh": "bool"
}
```
**响应 data**:
```json
{
  "content": [{
    "id": "", "path": "", "virtual_path": "", "name": "",
    "size": 0, "is_dir": true, "modified": "timestamp",
    "created": "timestamp", "sign": "", "thumb": "",
    "type": 1, "hashinfo": "", "hash_info": {},
    "label_list": [...], "storage_class": ""
  }],
  "total": 0, "filtered_total": 0, "page": 1, "per_page": 200,
  "has_more": false, "pages_total": 0, "readme": "", "header": "",
  "write": false, "provider": "Local"
}
```

**`/api/fs/get` 请求体**:
```json
{ "path": "string", "password": "string" }
```
**响应**: 包含 `raw_url`(下载地址), `readme`, `header`, `provider`, `web_proxy`, `related`(关联文件) 等

**`/api/fs/dirs` 请求体**:
```json
{ "path": "string", "password": "string", "force_root": "bool(需Admin)" }
```
**响应**: `[{"name":"dir1","modified":"ts"},...]`

**`/api/fs/search` 请求体**:
```json
{ "parent": "string", "keywords": "string" }
```

### 2.2 写入/管理

| 端点 | 方法 | 所需权限 | 说明 |
|------|------|----------|------|
| `/api/fs/mkdir` | POST | Write | 新建目录 |
| `/api/fs/rename` | POST | Rename | 重命名 |
| `/api/fs/batch_rename` | POST | Rename | 批量重命名 |
| `/api/fs/regex_rename` | POST | Rename | 正则批量重命名 |
| `/api/fs/move` | POST | Move | 移动文件 |
| `/api/fs/recursive_move` | POST | Move | 递归移动（自动处理重名） |
| `/api/fs/copy` | POST | Copy | 复制文件（跨存储返回 TaskInfo） |
| `/api/fs/remove` | POST | Remove | 删除文件 |
| `/api/fs/remove_empty_directory` | POST | Remove | 递归清理空目录 |
| `/api/fs/put` | PUT | Write | 流式上传 |
| `/api/fs/form` | PUT | Write | 表单上传 |
| `/api/fs/link` | POST | Admin | 获取文件原始直链（含 Cookie） |
| `/api/fs/add_offline_download` | POST | AddOfflineDownload | 添加离线下载任务 |

**`mkdir` 请求体**: `{ "path": "string" }`

**`rename` 请求体**: `{ "path": "string", "name": "string", "overwrite": "bool" }`

**`move` / `copy` 请求体**: `{ "src_dir": "string", "dst_dir": "string", "names": ["f1","f2"], "overwrite": "bool" }`

**`recursive_move` 请求体**: `{ "src_dir": "string", "dst_dir": "string", "names": ["f1","f2"] }`

**`remove` 请求体**: `{ "dir": "string", "names": ["f1","f2"] }`

**`put`（流式上传）**：需要 Header: `File-Path`(URL-encoded), `Content-Length`, `As-Task`(可选), `Overwrite`(可选默认true), `X-File-Md5`(可选), `Last-Modified`(可选 UnixMilli)

**`form`（表单上传）**：multipart/form-data，字段可与流式上传相同

**`add_offline_download` 请求体**:
```json
{ "path": "string", "urls": ["url1","url2"], "tool": "aria2|qbit|transmission|simplehttp" }
```

### 2.3 飞书文档导出

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/fs/lark/export/download` | GET | 飞书(Lark)云文档导出下载（用于 Lark 驱动的 docx/sheet 导出） |

### 2.4 压缩包操作

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/fs/archive/meta` | POST (or ANY) | 获取压缩包元信息（文件树/密码校验） |
| `/api/fs/archive/list` | POST (or ANY) | 压缩包内文件列表 |
| `/api/fs/archive/decompress` | POST | 解压（创建异步任务） |

---

## 3. 分享 API（`/api/share`）—— 需 Auth + 非 Guest

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/share/create` | POST | 创建分享 |
| `/api/share/update` | POST | 更新分享 |
| `/api/share/disable` | POST | 禁用分享 |
| `/api/share/list` | GET | 获取分享列表 |
| `/api/share/delete` | POST | 删除分享 |

---

## 4. 公开分享 API（`/api/public`）—— 无需 Auth

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/public/settings` | ANY | 获取公开配置（站点标题/Logo/允许注册等） |
| `/api/public/offline_download_tools` | ANY | 获取离线下载工具列表 |
| `/api/public/archive_extensions` | ANY | 获取支持的压缩格式列表 |
| `/api/public/share/info` | GET | 获取分享信息 |
| `/api/public/share/auth` | POST | 验证分享密码 |
| `/api/public/share/list` | POST | 分享目录列表 |
| `/api/public/share/get` | POST | 获取分享的单个文件详情 |

---

## 5. 标签 API（`/api/label`、`/api/label_file_binding`）—— 需 Auth

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/label/list` | GET | 标签列表 |
| `/api/label/get` | GET | 获取单个标签 |
| `/api/label_file_binding/get` | GET | 按文件名查询标签 |
| `/api/label_file_binding/get_file_by_label` | GET | 按标签查询文件 |

---

## 6. 任务 API（`/api/task`）—— 需 Auth + 非 Guest（也有 `/api/admin/task` 需 Admin）

共有 7 种任务类型，每种有相同子路由：

| 子路由 | 方法 | 说明 |
|--------|------|------|
| `/undone` | GET | 未完成任务列表 |
| `/done` | GET | 已完成任务列表 |
| `/info?tid=xxx` | POST | 任务详情 |
| `/cancel?tid=xxx` | POST | 取消任务 |
| `/delete?tid=xxx` | POST | 删除任务 |
| `/retry?tid=xxx` | POST | 重试任务 |
| `/cancel_some` | POST | 批量取消（Body: `["tid1","tid2"]`） |
| `/delete_some` | POST | 批量删除 |
| `/retry_some` | POST | 批量重试 |
| `/clear_done` | POST | 清空已完成任务 |
| `/clear_succeeded` | POST | 清空成功任务 |
| `/retry_failed` | POST | 重试所有失败任务 |

**任务类型路径**:

| 路径 | 任务类型 | 权限 |
|------|----------|------|
| `/api/task/upload/*` | 上传任务 | Auth(非Guest) |
| `/api/task/copy/*` | 复制任务 | Auth(非Guest) |
| `/api/task/offline_download/*` | 离线下载任务 | Auth(非Guest) |
| `/api/task/offline_download_transfer/*` | 离线下载转存任务 | Auth(非Guest) |
| `/api/task/decompress/*` | 解压下载任务 | Auth(非Guest) |
| `/api/task/decompress_upload/*` | 解压上传任务 | Auth(非Guest) |
| `/api/task/s3_transition/*` | S3 冷热迁移任务 | Auth(非Guest) |
| `/api/admin/task/*` | 同上（兼容旧脚本） | Admin |

**任务信息结构**:
```json
{
  "id": "string", "name": "string", "creator": "username",
  "creator_role": [1,2], "state": 1, "status": "string",
  "progress": 50.0, "start_time": "ts", "end_time": "ts",
  "total_bytes": 1024, "error": ""
}
```

---

## 7. 管理 API（`/api/admin`）—— 需 Admin 角色

### 7.1 Meta（路径元数据）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/meta/list` | GET | Meta 列表 |
| `/api/admin/meta/get?id=x` | GET | 获取 Meta |
| `/api/admin/meta/create` | POST | 创建 Meta |
| `/api/admin/meta/update` | POST | 更新 Meta |
| `/api/admin/meta/delete?id=x` | POST | 删除 Meta |

### 7.2 User（用户管理）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/user/list` | GET | 用户列表（分页 `?page=1&per_page=10`） |
| `/api/admin/user/get?id=x` | GET | 获取用户 |
| `/api/admin/user/create` | POST | 创建用户 |
| `/api/admin/user/update` | POST | 更新用户 |
| `/api/admin/user/cancel_2fa` | POST | 取消用户2FA |
| `/api/admin/user/delete?id=x` | POST | 删除用户 |
| `/api/admin/user/del_cache` | POST | 清除用户缓存 |
| `/api/admin/user/sshkey/list?user_id=x` | GET | 某用户公钥列表 |
| `/api/admin/user/sshkey/delete` | POST | 删除某用户公钥 |

**User 对象关键字段**:
```json
{
  "id": 1, "username": "string", "password": "string(新建时)",
  "base_path": "/", "role": [1,2], "disabled": false,
  "permission": 0, "otp_secret": "", "sso_id": ""
}
```

### 7.3 Role（角色管理）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/role/list` | GET | 角色列表（分页） |
| `/api/admin/role/get?id=x` | GET | 获取角色 |
| `/api/admin/role/create` | POST | 创建角色 |
| `/api/admin/role/update` | POST | 更新角色 |
| `/api/admin/role/delete?id=x` | POST | 删除角色 |

**Role 对象**:
```json
{
  "id": 1, "name": "string (唯一)", "description": "string",
  "default": false,
  "permission_scopes": [
    { "path": "/local", "permission": 1023 }
  ]
}
```

**权限位掩码参考**:

| 位 | 常量 | 值 | 含义 |
|----|------|----|------|
| 0 | SeeHides | 1 | 可见隐藏文件 |
| 1 | AccessWithoutPwd | 2 | 免密码访问 |
| 2 | AddOfflineDownload | 4 | 离线下载 |
| 3 | Write | 8 | 写入/上传 |
| 4 | Rename | 16 | 重命名 |
| 5 | Move | 32 | 移动 |
| 6 | Copy | 64 | 复制 |
| 7 | Remove | 128 | 删除 |
| 8 | WebdavRead | 256 | WebDAV 读 |
| 9 | WebdavManage | 512 | WebDAV 写 |
| 10 | FTPAccess | 1024 | FTP/SFTP 登录 |
| 11 | FTPManage | 2048 | FTP/SFTP 写 |
| 12 | ReadArchives | 4096 | 读取压缩包 |
| 13 | Decompress | 8192 | 解压 |
| 14 | PathLimit | 16384 | 路径限制 |
| 15 | MCPAccess | 32768 | MCP 读 |
| 16 | MCPManage | 65536 | MCP 写 |

> 常用预设：只读用户 = 256 (WebdavRead)，普通用户 = 8+16+32+64+128+256 = 504，全权限 = 131071

### 7.4 Storage（存储管理）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/storage/list` | GET | 存储列表（分页） |
| `/api/admin/storage/get?id=x` | GET | 获取存储 |
| `/api/admin/storage/create` | POST | 创建存储 |
| `/api/admin/storage/update` | POST | 更新存储 |
| `/api/admin/storage/delete?id=x` | POST | 删除存储 |
| `/api/admin/storage/enable?id=x` | POST | 启用存储 |
| `/api/admin/storage/disable?id=x` | POST | 禁用存储 |
| `/api/admin/storage/load_all` | POST | 重新加载所有存储 |

**Storage 对象**:
```json
{
  "id": 1, "mount_path": "/local",
  "order": 0, "driver": "Local",
  "cache_expiration": 30, "status": "work",
  "addition": "{\"root_folder_path\":\"/data\"}",
  "remark": "", "disabled": false,
  "order_by": "name", "order_direction": "asc",
  "extract_folder": "front",
  "web_proxy": false, "webdav_policy": "302_redirect",
  "proxy_range": false, "down_proxy_url": "",
  "enable_sign": false, "disable_index": false
}
```

### 7.5 Driver Info（驱动信息）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/driver/list` | GET | 驱动信息列表（含配置字段） |
| `/api/admin/driver/names` | GET | 驱动名列表 |
| `/api/admin/driver/info?driver=X` | GET | 指定驱动的配置字段详情 |

### 7.6 Setting（配置管理）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/setting/get?key=xxx` | GET | 获取单项配置 |
| `/api/admin/setting/list` | GET | 配置列表（按分组） |
| `/api/admin/setting/save` | POST | 批量保存配置（`[{key,value},...]`） |
| `/api/admin/setting/delete?key=xxx` | POST | 删除配置项 |
| `/api/admin/setting/reset_token` | POST | 重置管理员 Token |
| `/api/admin/setting/set_token` | POST | 设置管理员 Token |
| `/api/admin/setting/set_aria2` | POST | 设置 ARIA2 配置 |
| `/api/admin/setting/set_qbit` | POST | 设置 qBittorrent 配置 |
| `/api/admin/setting/set_transmission` | POST | 设置 Transmission 配置 |
| `/api/admin/setting/set_115` | POST | 设置 115 网盘配置 |
| `/api/admin/setting/set_pikpak` | POST | 设置 PikPak 配置 |
| `/api/admin/setting/set_thunder` | POST | 设置迅雷配置 |
| `/api/admin/setting/set_guangyapan` | POST | 设置广雅盘配置 |
| `/api/admin/setting/set_frp` | POST | 设置 FRP 配置 |
| `/api/admin/setting/stop_frp` | POST | 停止 FRP |
| `/api/admin/setting/frp_runtime` | GET | 获取 FRP 运行状态 |

**SettingItem 对象**:
```json
{
  "key": "site_title", "value": "AList",
  "help": "站点标题", "type": "string",
  "options": "", "group": 1, "flag": 0, "index": 0
}
```

### 7.7 Index（搜索索引）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/index/build` | POST | 构建索引（需 SearchIndex 中间件） |
| `/api/admin/index/update` | POST | 增量更新索引 |
| `/api/admin/index/stop` | POST | 停止索引 |
| `/api/admin/index/clear` | POST | 清除索引 |
| `/api/admin/index/progress` | GET | 获取索引进度 |

### 7.8 Label（标签管理）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/label/create` | POST | 创建标签 |
| `/api/admin/label/update` | POST | 更新标签 |
| `/api/admin/label/delete` | POST | 删除标签 |

### 7.9 Label File Binding（标签-文件绑定管理）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/label_file_binding/list` | GET | 绑定列表 |
| `/api/admin/label_file_binding/create` | POST | 创建绑定 |
| `/api/admin/label_file_binding/create_batch` | POST | 批量创建绑定 |
| `/api/admin/label_file_binding/delete` | POST | 按文件名删除绑定 |
| `/api/admin/label_file_binding/restore` | POST | 恢复绑定 |

### 7.10 Message（消息通知 —— WebSocket）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/message/get` | POST | WebSocket 消息拉取 |
| `/api/admin/message/send` | POST | WebSocket 消息推送 |

### 7.11 Session（会话管理）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/admin/session/list` | GET | 所有会话列表 |
| `/api/admin/session/evict` | POST | 驱逐指定会话 |

---

## 8. Debug API（仅 `--debug` 或 `--dev` 模式）

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/debug/path/*path` | GET | 路径解析调试 |
| `/api/debug/hide_privacy` | GET | 隐私过滤调试 |
| `/api/debug/gc` | GET | 手动触发 GC |
| `/api/debug/pprof/*` | ANY | Go pprof 性能分析 |

---

## 9. 认证中间件行为对照表

| 中间件 | 位置 | 行为 |
|--------|------|------|
| `StoragesLoaded` | 全局 | 等待所有存储加载完成 |
| `MaxAllowed(n)` | 全局(可选) | 最大并发连接数信号量控制 |
| `SessionRefresh` | 全局 | 刷新设备会话 |
| `ForceHttps` | 全局(可选) | HTTP→HTTPS 重定向 |
| `Auth` | `/api/*` 需认证路由 | Token→JWT→Guest 三级认证；注入 `user` 到 ctx |
| `Authn` | `/api/authn/*` | 同上但用于 WebAuthn |
| `AuthNotGuest` | `/api/share/*` `/api/task/*` | 访客禁止 |
| `AuthAdmin` | `/api/admin/*` `/api/fs/link` | 管理员专用 |
| `SignCheck` | `/d/*path` `/p/*path` | 校验下载签名 `?sign=xxx` |
| `DownloadRateLimiter` | `/d/*path` `/p/*path` `/dav` `/sd/*` `/sp/*` `/ad/*` `/ap/*` `/ae/*` | 客户端下载限速 |
| `UploadRateLimiter` | `/api/fs/put` `/api/fs/form` `/dav` | 客户端上传限速 |
| `SearchIndex` | `/api/fs/search` `/api/admin/index/*` | 搜索索引可用性检查 |
| `FsUp` | `/api/fs/put` `/api/fs/form` | 上传权限校验(Write) |

---

## 10. 路由优先级总结

```
路由匹配顺序（Gin 规则：精确 > 通配）:

精确路由:  /ping  /favicon.ico  /robots.txt  /i/:link_name
组路由:    /dav/*path  /s3/*
精确路由:  /d/*path  /p/*path  /s/:share_id  /sd/:share_id  /sp/:share_id
精确路由:  /ad/*path  /ap/*path  /ae/*path
组路由:    /api/auth/*  /api/me/*  /api/authn/*  /api/public/*
组路由:    /api/fs/*  /api/share/*  /api/task/*  /api/label/*
组路由:    /api/admin/*
静态文件:  /assets/*  /images/*  /streamer/*  /static/* (长缓存15552000s)
NoRoute:   /* (SPA fallback, 返回 index.html)
```
