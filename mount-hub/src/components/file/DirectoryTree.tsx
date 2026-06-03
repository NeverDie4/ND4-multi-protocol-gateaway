'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FolderNode } from '@/types'

interface DirectoryTreeProps {
  nodes: FolderNode[]
  selectedId: string | null
  onSelect: (id: string) => void
}

function DirectoryTreeNode({ node, level = 0, selectedId, onSelect }: DirectoryTreeProps & { node: FolderNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(node.isExpanded ?? false)
  const hasChildren = Boolean(node.children?.length)

  return (
    <div>
      <button
        onClick={() => {
          onSelect(node.id)
          if (hasChildren) setIsExpanded(!isExpanded)
        }}
        className={cn(
          'w-full flex items-center gap-1.5 py-1.5 pr-2 rounded-md text-left text-sm transition-colors',
          selectedId === node.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
        ) : (
          <span className="w-4" />
        )}
        <Folder className="w-4 h-4 text-muted-foreground" />
        <span className="truncate">{node.name}</span>
      </button>
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <DirectoryTreeNode key={child.id} node={child} nodes={[]} level={level + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  )
}

export function DirectoryTree({ nodes, selectedId, onSelect }: DirectoryTreeProps) {
  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <DirectoryTreeNode key={node.id} node={node} nodes={nodes} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </div>
  )
}
