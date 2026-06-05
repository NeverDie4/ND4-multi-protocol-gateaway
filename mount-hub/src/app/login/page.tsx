'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  Grid3X3,
  HardDrive,
  KeyRound,
  Link2,
  Shield,
  User,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { isAuthenticated, isReady, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [showTotp, setShowTotp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/files')
    }
  }, [isAuthenticated, isReady, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(username, password, totpCode || undefined)
      router.push('/files')
    } catch (err) {
      const message = err instanceof Error ? err.message : '登录失败，请检查账号和密码'
      if (/Invalid 2FA code/i.test(message)) {
        setShowTotp(true)
        setError('该账号已启用 2FA，请输入验证码')
      } else {
        setError(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <HardDrive className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-semibold text-foreground">MountHub</span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-lg">
          <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
            统一管理多协议文件资源
          </h1>
          <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
            挂载 Local、FTP、WebDAV、SFTP、S3 等存储，集中完成浏览、上传、下载和权限管理。
          </p>

          <div className="mt-10 bg-card rounded-2xl p-6 shadow-sm border border-border/50 space-y-1">
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">高性能传输</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  通过流式传输、代理下载和任务队列支撑大文件操作。
                </p>
              </div>
            </div>
            <div className="border-t border-border/50 mx-3" />
            <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">多用户权限</h3>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
                  以角色和路径权限控制访问范围，适合团队共享和运维管理。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>后端服务连接后即可进入工作台</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-card">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <HardDrive className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">MountHub</span>
          </div>

          <div className="bg-card lg:bg-background rounded-2xl lg:p-8 lg:shadow-lg lg:border lg:border-border/50">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-foreground">欢迎回来</h2>
              <p className="text-muted-foreground mt-2">登录后访问统一文件工作台</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  用户名
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 pl-10 bg-background border-border"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  密码
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10 bg-background border-border"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {showTotp ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="totp" className="text-sm font-medium">
                    2FA 验证码
                  </Label>
                  <Badge variant="secondary" className="text-xs font-normal py-0 px-1.5">
                    可选
                  </Badge>
                </div>
                <div className="relative">
                  <Grid3X3 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="totp"
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="h-12 pl-10 bg-background border-border tracking-widest"
                    maxLength={6}
                  />
                </div>
              </div>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
                  onClick={() => setShowTotp(true)}
                >
                  使用 2FA 验证码
                </Button>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full h-12 text-base font-medium mt-6" disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background lg:bg-card px-3 text-muted-foreground">其他登录方式</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full h-11 font-normal" type="button" disabled>
                <Fingerprint className="w-4 h-4 mr-2" />
                WebAuthn / 通行密钥
              </Button>
              <Button variant="outline" className="w-full h-11 font-normal" type="button" disabled>
                <Link2 className="w-4 h-4 mr-2" />
                企业 SSO
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
