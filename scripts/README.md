# 脚本说明

## 目录

```
scripts/
├── linux/              # Linux / macOS (Bash)
│   ├── setup.sh        # 首次初始化项目环境
│   ├── dev.sh          # 启动开发服务器（后端 + 前端）
│   ├── dev-backend.sh  # 仅启动后端
│   ├── dev-frontend.sh # 仅启动前端
│   ├── build.sh        # 生产构建
│   ├── lint.sh         # 代码检查
│   ├── test.sh         # 运行测试
│   └── clean.sh        # 清理构建产物
└── windows/            # Windows (PowerShell 5.1+)
    ├── setup.ps1
    ├── dev.ps1
    ├── dev-backend.ps1
    ├── dev-frontend.ps1
    ├── build.ps1
    ├── lint.ps1
    ├── test.ps1
    └── clean.ps1
```

## 后端项目目录

所有脚本假设后端代码位于项目根目录，前端代码位于 `mount-hub/`。

## setup

首次初始化项目环境。

```bash
# Linux / macOS
./scripts/linux/setup.sh

# Windows
.\scripts\windows\setup.ps1
```

- `go mod download && go mod tidy` — 下载 Go 依赖
- `pnpm install`（mount-hub/）— 安装前端依赖
- 若 `data/config.json` 不存在，自动生成默认配置（SQLite3，端口 5244）

## dev

启动开发服务器，后端和前端热重载。

```bash
# 同时启动后端 + 前端
./scripts/linux/dev.sh

# 仅启动后端
./scripts/linux/dev-backend.sh

# 仅启动前端
./scripts/linux/dev-frontend.sh
```

```powershell
# Windows
.\scripts\windows\dev.ps1
# 或指定参数
.\scripts\windows\dev.ps1 --backend
.\scripts\windows\dev.ps1 --frontend

# 独立脚本
.\scripts\windows\dev-backend.ps1
.\scripts\windows\dev-frontend.ps1
```

- 后端：`go run . server --dev`，运行在 `http://127.0.0.1:5244`
- 前端：`pnpm run dev`（Next.js），运行在 `http://127.0.0.1:3000`
- Ctrl+C 安全停止所有进程
- **`--dev` 模式**：admin 密码固定为 `admin`，使用内存 SQLite 数据库（每次重启数据重置），方便联调测试。如需热重载，可手动 `ALIST_ADMIN_PASSWORD=admin go run . server` 配合 `air`

## build

生产构建。

```bash
# 构建前端 + 后端
./scripts/linux/build.sh

# 指定版本号
./scripts/linux/build.sh v1.0.0
```

- 前端：`pnpm run build`（mount-hub/）→ `.next/`
- 后端：`go build` 注入 `BuiltAt` / `GitCommit` / `Version` → `bin/alist`

## lint

代码检查。

```bash
./scripts/linux/lint.sh
```

- `go vet ./...`（后端）
- `pnpm run lint`（前端）

## test

运行测试。

```bash
# 全部测试
./scripts/linux/test.sh

# 指定测试
./scripts/linux/test.sh -run TestCreateStorage -count 1
```

- 透传参数给 `go test ./...`

## clean

清理所有构建产物和运行时数据。

```bash
./scripts/linux/clean.sh
```

删除目录：

| 目录 | 内容 |
|------|------|
| `bin/` | Go 编译产物 |
| `mount-hub/.next/` | Next.js 构建输出 |
| `mount-hub/node_modules/` | 前端依赖 |
| `tmp/` `build/` `log/` `daemon/` `output/` | 遗留临时目录 |
| `public/dist/` | 前端构建占位产物 |
| `data/` | 数据库、配置、日志、临时文件 |

---

## Windows 用户

所有 PowerShell 脚本要求 **PowerShell 5.1+**（Windows 10+ 自带）。

```powershell
.\scripts\windows\setup.ps1
.\scripts\windows\dev.ps1
.\scripts\windows\dev-backend.ps1
.\scripts\windows\dev-frontend.ps1
.\scripts\windows\build.ps1
.\scripts\windows\lint.ps1
.\scripts\windows\test.ps1
.\scripts\windows\clean.ps1
```
