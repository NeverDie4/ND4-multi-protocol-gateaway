import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">{icon}</div>}
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  )
}
