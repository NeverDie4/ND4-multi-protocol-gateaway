import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const toneClass = {
  success: 'text-green-600 border-green-200 bg-green-50',
  warning: 'text-yellow-600 border-yellow-200 bg-yellow-50',
  danger: 'text-red-600 border-red-200 bg-red-50',
  neutral: 'text-muted-foreground border-border bg-muted/30',
}

interface StatusBadgeProps {
  label: string
  tone?: keyof typeof toneClass
  withDot?: boolean
  className?: string
}

export function StatusBadge({ label, tone = 'neutral', withDot = true, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('gap-1.5', toneClass[tone], className)}>
      {withDot && <span className={cn('w-2 h-2 rounded-full', tone === 'success' && 'bg-green-500', tone === 'warning' && 'bg-yellow-500', tone === 'danger' && 'bg-red-500', tone === 'neutral' && 'bg-muted-foreground')} />}
      {label}
    </Badge>
  )
}
