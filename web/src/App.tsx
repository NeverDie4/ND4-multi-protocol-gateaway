import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2, Settings, UserPlus } from "lucide-react"
import { useState } from "react"
import type { FormEvent } from "react"

type RegisterState = "idle" | "submitting" | "success" | "error"

type ApiResp = {
  code: number
  message: string
}

function App() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<RegisterState>("idle")
  const [message, setMessage] = useState("")

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!username.trim() || !password) {
      setStatus("error")
      setMessage("请输入用户名和密码")
      return
    }

    setStatus("submitting")
    setMessage("")

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })
      const result = (await response.json()) as ApiResp

      if (result.code !== 200) {
        setStatus("error")
        setMessage(result.message || "注册失败")
        return
      }

      setStatus("success")
      setMessage("注册成功，可以使用新账号登录")
      setPassword("")
    } catch {
      setStatus("error")
      setMessage("无法连接服务器，请稍后重试")
    }
  }

  return (
    <div className={cn("min-h-screen bg-background text-foreground", "flex items-center justify-center px-4 py-10")}>
      <main className="grid w-full max-w-5xl gap-10 md:grid-cols-[1fr_380px] md:items-center">
        <section className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground">AList Gateway</p>
          <h1 className="text-4xl font-bold tracking-normal sm:text-5xl">
            多协议文件挂载平台
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground">
            创建账号后即可进入网关，统一管理文件访问、挂载和跨协议操作。
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open("/api/public/settings", "_self")}
          >
            <Settings />
            查看公开设置
          </Button>
        </section>

        <section className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-semibold">注册账号</h2>
            <p className="text-sm text-muted-foreground">填写用户名和密码完成注册</p>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            <label className="block space-y-2 text-sm font-medium">
              <span>用户名</span>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                disabled={status === "submitting"}
              />
            </label>

            <label className="block space-y-2 text-sm font-medium">
              <span>密码</span>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/30"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                disabled={status === "submitting"}
              />
            </label>

            {message && (
              <p
                className={cn(
                  "min-h-5 text-sm",
                  status === "success" ? "text-emerald-600" : "text-destructive"
                )}
              >
                {message}
              </p>
            )}

            <Button className="w-full" type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? <Loader2 className="animate-spin" /> : <UserPlus />}
              {status === "submitting" ? "注册中" : "创建账号"}
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
