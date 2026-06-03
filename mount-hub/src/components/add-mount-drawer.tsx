'use client'

import { useState } from 'react'
import { Cloud, Server, Database, Globe, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface AddMountDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const protocols = [
  { id: 'smb', name: 'SMB/CIFS', description: 'Windows 共享文件夹', icon: Server },
  { id: 'webdav', name: 'WebDAV', description: 'Web 分布式创作和版本控制', icon: Cloud },
  { id: 'ftp', name: 'FTP/SFTP', description: '文件传输协议', icon: Globe },
  { id: 's3', name: 'S3 兼容', description: 'AWS S3 或兼容存储', icon: Database },
  { id: 'local', name: '本地文件夹', description: '挂载本机文件夹', icon: FolderOpen },
]

export function AddMountDrawer({ isOpen, onClose }: AddMountDrawerProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null)
  const [step, setStep] = useState<'protocol' | 'config'>('protocol')

  const handleProtocolSelect = (protocolId: string) => {
    setSelectedProtocol(protocolId)
    setStep('config')
  }

  const handleBack = () => {
    setStep('protocol')
    setSelectedProtocol(null)
  }

  const handleClose = () => {
    setStep('protocol')
    setSelectedProtocol(null)
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className="w-[480px] sm:w-[540px]">
        <SheetHeader className="pb-6">
          <SheetTitle>
            {step === 'protocol' ? '添加挂载空间' : '配置连接'}
          </SheetTitle>
          <SheetDescription>
            {step === 'protocol' 
              ? '选择要连接的存储协议类型' 
              : `配置 ${protocols.find(p => p.id === selectedProtocol)?.name} 连接参数`
            }
          </SheetDescription>
        </SheetHeader>

        {step === 'protocol' ? (
          <div className="space-y-2">
            {protocols.map((protocol) => {
              const Icon = protocol.icon
              return (
                <button
                  key={protocol.id}
                  onClick={() => handleProtocolSelect(protocol.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border border-border bg-card',
                    'flex items-center gap-4 text-left',
                    'hover:border-primary/50 hover:bg-secondary/50 transition-all'
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{protocol.name}</p>
                    <p className="text-xs text-muted-foreground">{protocol.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">显示名称</Label>
              <Input id="name" placeholder="例如：公司文件服务器" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host">服务器地址</Label>
              <Input id="host" placeholder="例如：192.168.1.100 或 files.example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input id="username" placeholder="输入用户名" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input id="password" type="password" placeholder="输入密码" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="path">远程路径（可选）</Label>
              <Input id="path" placeholder="例如：/shared/documents" />
            </div>
          </div>
        )}

        <SheetFooter className="mt-6 pt-4 border-t border-border">
          {step === 'config' && (
            <Button variant="outline" onClick={handleBack}>
              返回
            </Button>
          )}
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          {step === 'config' && (
            <Button onClick={handleClose}>
              连接
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
