'use client'

import { useEffect, useMemo, useState } from 'react'
import { GitBranch, Info, Layers, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'

const LIMIT_KEYS = {
  clientDownload: 'max_client_download_speed',
  clientUpload: 'max_client_upload_speed',
  serverDownload: 'max_server_download_speed',
  serverUpload: 'max_server_upload_speed',
} as const

type LimitKey = keyof typeof LIMIT_KEYS
type LimitValues = Record<LimitKey, string>

const emptyValues: LimitValues = {
  clientDownload: '',
  clientUpload: '',
  serverDownload: '',
  serverUpload: '',
}

const rows: Array<{
  key: LimitKey
  label: string
  hint: string
  showInfo?: boolean
}> = [
  {
    key: 'clientDownload',
    label: '最大下载速率',
    hint: '用户限制。留空或填写 -1 表示不限速。',
    showInfo: true,
  },
  {
    key: 'clientUpload',
    label: '最大上传速率',
    hint: '用户限制。留空或填写 -1 表示不限速。',
    showInfo: true,
  },
  {
    key: 'serverDownload',
    label: '节点下载速率',
    hint: '适用于入站复制流量。留空或填写 -1 表示不限速。',
  },
  {
    key: 'serverUpload',
    label: '节点上传速率',
    hint: '适用于出站复制流量。留空或填写 -1 表示不限速。',
  },
]

function kbToMbInput(value: string | undefined) {
  const kb = Number(value)
  if (!Number.isFinite(kb) || kb < 0) {
    return ''
  }
  return String(Number((kb / 1024).toFixed(2)))
}

function mbInputToKb(value: string) {
  if (value.trim() === '') {
    return '-1'
  }
  const mb = Number(value)
  if (!Number.isFinite(mb) || mb < 0) {
    return '-1'
  }
  return String(Math.round(mb * 1024))
}

function toLimitValues(settings: Awaited<ReturnType<typeof adminApi.getSettings>>) {
  const byKey = new Map(settings.map((item) => [item.key, item.value]))
  return {
    clientDownload: kbToMbInput(byKey.get(LIMIT_KEYS.clientDownload)),
    clientUpload: kbToMbInput(byKey.get(LIMIT_KEYS.clientUpload)),
    serverDownload: kbToMbInput(byKey.get(LIMIT_KEYS.serverDownload)),
    serverUpload: kbToMbInput(byKey.get(LIMIT_KEYS.serverUpload)),
  }
}

export function TransferLimitSettings() {
  const [values, setValues] = useState<LimitValues>(emptyValues)
  const [loadedValues, setLoadedValues] = useState<LimitValues>(emptyValues)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const settingKeys = useMemo(() => Object.values(LIMIT_KEYS), [])

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      setIsLoading(true)
      try {
        const settings = await adminApi.getSettings(settingKeys)
        if (cancelled) return
        const nextValues = toLimitValues(settings)
        setValues(nextValues)
        setLoadedValues(nextValues)
      } catch (err) {
        const message = err instanceof Error ? err.message : '加载限速配置失败'
        toast.error(message)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadSettings()
    return () => {
      cancelled = true
    }
  }, [settingKeys])

  const updateValue = (key: LimitKey, value: string) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const save = async () => {
    setIsSaving(true)
    try {
      await adminApi.saveSettings(
        Object.entries(LIMIT_KEYS).map(([localKey, settingKey]) => ({
          key: settingKey,
          value: mbInputToKb(values[localKey as LimitKey]),
        })),
      )
      setLoadedValues(values)
      toast.success('限速配置已保存')
    } catch (err) {
      const message = err instanceof Error ? err.message : '保存限速配置失败'
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const restore = () => {
    setValues(loadedValues)
    toast.success('已还原为上次加载的配置')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">传输限速</h1>
        <p className="text-muted-foreground mt-1">配置服务质量 (QoS) 带宽限制以优化网络性能。</p>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">全局配置</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {rows.slice(0, 2).map((row) => (
            <LimitRow
              key={row.key}
              row={row}
              value={values[row.key]}
              disabled={isLoading || isSaving}
              onChange={(value) => updateValue(row.key, value)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">本地服务器节点限制</h3>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          {rows.slice(2).map((row) => (
            <LimitRow
              key={row.key}
              row={row}
              value={values[row.key]}
              disabled={isLoading || isSaving}
              onChange={(value) => updateValue(row.key, value)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={restore} disabled={isLoading || isSaving}>
          还原
        </Button>
        <Button className="bg-primary hover:bg-primary/90" onClick={save} disabled={isLoading || isSaving}>
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          保存更改
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm text-muted-foreground">协议行为</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Layers className="w-5 h-5 text-muted-foreground" />
              </div>
              <h4 className="font-semibold">范围请求</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              启用后，范围下载允许检索部分文件，从而可以在不重新启动的情况下恢复中断的传输。
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-muted-foreground" />
              </div>
              <h4 className="font-semibold">分块传输</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              数据动态分段传输。QoS 限制可限制块之间的管道，确保整体带宽合规。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LimitRow({
  row,
  value,
  disabled,
  onChange,
}: {
  row: (typeof rows)[number]
  value: string
  disabled: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div>
        <p className="font-medium">{row.label}</p>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          {row.showInfo && <Info className="w-3.5 h-3.5" />}
          {row.hint}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="-1"
          step="0.01"
          value={value}
          placeholder="不限速"
          className="w-28 text-right"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="text-sm text-muted-foreground w-12">MB/s</span>
      </div>
    </div>
  )
}
