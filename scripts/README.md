# 脚本说明

## 目录

```
scripts/
├── linux/        # Linux / macOS (Shell)
│   ├── setup.sh
│   ├── dev.sh
│   ├── build.sh
│   ├── lint.sh
│   ├── test.sh
│   └── clean.sh
└── windows/      # Windows (PowerShell 7+)
    ├── setup.ps1
    ├── dev.ps1
    ├── build.ps1
    ├── lint.ps1
    ├── test.ps1
    └── clean.ps1
```

## setup

首次初始化项目环境。

```bash
./scripts/linux/setup.sh
```

- `go mod download` → 下载 Go 依赖
- `pnpm install`（web/）→ 安装前端依赖
- 若 `config.json` 不存在，自动生成默认配置（SQLite3）

## dev

启动开发服务器，后端和前端热重载。

```bash
# 同时启动后端 + 前端
./scripts/linux/dev.sh

# 仅启动后端
./scripts/linux/dev.sh --backend

# 仅启动前端
./scripts/linux/dev.sh --frontend
```

- 后端：优先使用 `air`（需安装），否则退到 `go run . server`
- 前端：`vite dev`，代理 `/api` → `localhost:5244`
- Ctrl+C 安全停止所有进程

## build

生产构建。

```bash
# 构建前端 + 后端
./scripts/linux/build.sh

# 指定版本号
./scripts/linux/build.sh v1.0.0
```

- 前端：`pnpm run build` → `public/dist/`
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

- 删除 `bin/` `public/dist/` `tmp/` `data/` `build/` `log/` `daemon/` `output/`

---

## Windows 用户

所有命令使用 `scripts/windows/` 下的同名 `.ps1` 脚本，功能完全一致。

```powershell
.\scripts\windows\setup.ps1
.\scripts\windows\dev.ps1
.\scripts\windows\build.ps1
.\scripts\windows\lint.ps1
.\scripts\windows\test.ps1
.\scripts\windows\clean.ps1
```
