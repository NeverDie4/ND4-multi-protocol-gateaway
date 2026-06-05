'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  HardDrive,
  KeyRound,
  Shield,
  User,
  UserPlus,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'

export default function RegisterPage() {
  const router = useRouter()
  const { isAuthenticated, isReady, register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/files')
    }
  }, [isAuthenticated, isReady, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('请输入用户名')
      return
    }

    if (!password) {
      setError('请输入密码')
      return
    }

    if (password.length < 6) {
      setError('密码长度至少 6 位')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setIsLoading(true)
    try {
      await register(username.trim(), password)
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : '注册失败，请稍后重试'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex">
        <BrandPanel />

        <div className="flex-1 flex items-center justify-center p-6 bg-card">
          <div className="w-full max-w-md text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">注册成功</h2>
            <p className="text-muted-foreground mt-2">账号已经创建，现在可以登录使用。</p>
            <Button className="w-full h-12 text-base font-medium mt-8" onClick={() => router.push('/login')}>
              返回登录
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

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
              <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <UserPlus className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">创建账号</h2>
              <p className="text-muted-foreground mt-2">填写信息完成注册</p>
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
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-12 pl-10 bg-background border-border"
                    autoComplete="username"
                    disabled={isLoading}
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
                    placeholder="请输入密码（至少 6 位）"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-10 pr-10 bg-background border-border"
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">
                  确认密码
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="再次输入密码"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pl-10 pr-10 bg-background border-border"
                    autoComplete="new-password"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? '隐藏确认密码' : '显示确认密码'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full h-12 text-base font-medium mt-6" disabled={isLoading}>
                {isLoading ? '注册中...' : '创建账号'}
                {!isLoading && <UserPlus className="w-4 h-4 ml-2" />}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              已有账号？{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandPanel() {
  return (
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
        <span>注册后即可使用新账号登录</span>
      </div>
    </div>
  )
}
