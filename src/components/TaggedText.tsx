import React from 'react'

interface TaggedTextProps {
  content: string
  showEntities: boolean
  onSelectEntity?: (label: string, prefix: string) => void
}

const CATEGORY_MAP: Record<string, { label: string; className: string }> = {
  人: { label: '人物', className: 'text-[#8c2d19] dark:text-[#f87171] border-b border-dotted border-[#8c2d19]/50 hover:bg-[#8c2d19]/10' },
  地: { label: '地名', className: 'text-[#1d6f42] dark:text-[#34d399] border-b border-dotted border-[#1d6f42]/50 hover:bg-[#1d6f42]/10' },
  官: { label: '官职', className: 'text-[#2b5282] dark:text-[#60a5fa] border-b border-dotted border-[#2b5282]/50 hover:bg-[#2b5282]/10' },
  战: { label: '战役', className: 'text-[#9b1c1c] dark:text-[#fca5a5] border-b border-dotted border-[#9b1c1c]/50 hover:bg-[#9b1c1c]/10' },
  族: { label: '氏族', className: 'text-[#6b21a8] dark:text-[#c084fc] border-b border-dotted border-[#6b21a8]/50 hover:bg-[#6b21a8]/10' },
  器: { label: '器物', className: 'text-[#92400e] dark:text-[#fbbf24] border-b border-dotted border-[#92400e]/50 hover:bg-[#92400e]/10' },
  政: { label: '政治', className: 'text-[#1e40af] dark:text-[#93c5fd] border-b border-dotted border-[#1e40af]/50 hover:bg-[#1e40af]/10' },
  刑: { label: '刑律', className: 'text-[#374151] dark:text-[#9ca3af] border-b border-dotted border-[#374151]/50 hover:bg-[#374151]/10' },
  历: { label: '天象', className: 'text-[#0e7490] dark:text-[#38bdf8] border-b border-dotted border-[#0e7490]/50 hover:bg-[#0e7490]/10' },
  群: { label: '阶层', className: 'text-[#0f766e] dark:text-[#2dd4bf] border-b border-dotted border-[#0f766e]/50 hover:bg-[#0f766e]/10' },
  思: { label: '思想', className: 'text-[#c2410c] dark:text-[#fb923c] border-b border-dotted border-[#c2410c]/50 hover:bg-[#c2410c]/10' },
  语: { label: '成语', className: 'text-[#0369a1] dark:text-[#7dd3fc] border-b border-dotted border-[#0369a1]/50 hover:bg-[#0369a1]/10' },
}

export const TaggedText: React.FC<TaggedTextProps> = ({
  content,
  showEntities,
  onSelectEntity,
}) => {
  if (!content) return null

  // If entities are disabled or text has no tags, render as plain text
  if (!showEntities || !content.includes('⟪')) {
    // Strip tags if any exist
    const plain = content.replace(/⟪[^\s]+\s+([^⟫]+)⟫/g, '$1')
    return <span>{plain}</span>
  }

  const parts: React.ReactNode[] = []
  const regex = /⟪([^\s]+)\s+([^⟫]+)⟫/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index))
    }

    const prefix = match[1]
    const label = match[2]
    const meta = CATEGORY_MAP[prefix] || {
      label: '实体',
      className: 'text-stone-700 dark:text-stone-300 border-b border-dotted border-stone-400 hover:bg-stone-500/10',
    }

    parts.push(
      <span
        key={`${match.index}-${label}`}
        onClick={(e) => {
          e.stopPropagation()
          onSelectEntity?.(label, prefix)
        }}
        title={`${label} [${meta.label}] · 点击查看史实详情与出处`}
        className={`inline cursor-pointer transition-colors duration-150 px-0.5 rounded-sm ${meta.className}`}
      >
        {label}
      </span>
    )

    lastIndex = regex.lastIndex
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex))
  }

  return <>{parts}</>
}
