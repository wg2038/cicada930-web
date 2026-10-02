import React from 'react'

export interface EntityAnchorRect {
  top: number
  bottom: number
  left: number
  right: number
}

interface TaggedTextProps {
  content: string
  showEntities: boolean
  onSelectEntity?: (label: string, prefix: string, rect?: EntityAnchorRect) => void
}

/**
 * 典籍语义实体与动词色彩映射表。
 * 与 Android 客户端 dev.x.opusone.theme.Color.kt 严格 100% 对齐。
 */
const CATEGORY_MAP: Record<string, { label: string; className: string }> = {
  人: {
    label: '人物',
    className: 'text-[#8B4513] dark:text-[#E5A876] border-b border-dotted border-[#8B4513]/60 dark:border-[#E5A876]/60 hover:bg-[#8B4513]/10',
  },
  地: {
    label: '地名',
    className: 'text-[#8A6100] dark:text-[#E5C158] border-b border-dotted border-[#8A6100]/60 dark:border-[#E5C158]/60 hover:bg-[#8A6100]/10',
  },
  官: {
    label: '官爵',
    className: 'text-[#A1121C] dark:text-[#FF7B72] border-b border-dotted border-[#A1121C]/60 dark:border-[#FF7B72]/60 hover:bg-[#A1121C]/10',
  },
  族: {
    label: '世系/氏族',
    className: 'text-[#6C3FA8] dark:text-[#D2A8FF] border-b border-dotted border-[#6C3FA8]/60 dark:border-[#D2A8FF]/60 hover:bg-[#6C3FA8]/10',
  },
  群: {
    label: '族群/阶层',
    className: 'text-[#34568F] dark:text-[#79C0FF] border-b border-dotted border-[#34568F]/60 dark:border-[#79C0FF]/60 hover:bg-[#34568F]/10',
  },
  生: {
    label: '生物',
    className: 'text-[#1B6E2E] dark:text-[#7EE787] border-b border-dotted border-[#1B6E2E]/60 dark:border-[#7EE787]/60 hover:bg-[#1B6E2E]/10',
  },
  器: {
    label: '器物',
    className: 'text-[#9A5B22] dark:text-[#FFA657] border-b border-dotted border-[#9A5B22]/60 dark:border-[#FFA657]/60 hover:bg-[#9A5B22]/10',
  },
  历: {
    label: '天文/历法',
    className: 'text-[#3F4C9C] dark:text-[#A5D6FF] border-b border-dotted border-[#3F4C9C]/60 dark:border-[#A5D6FF]/60 hover:bg-[#3F4C9C]/10',
  },
  思: {
    label: '思想/观念',
    className: 'text-[#2F4F4F] dark:text-[#80CBC4] border-b border-dotted border-[#2F4F4F]/60 dark:border-[#80CBC4]/60 hover:bg-[#2F4F4F]/10',
  },
  数: {
    label: '度量/数目',
    className: 'text-[#1F6F45] dark:text-[#56D364] border-b border-dotted border-[#1F6F45]/60 dark:border-[#56D364]/60 hover:bg-[#1F6F45]/10',
  },
  语: {
    label: '成语/典故',
    className: 'text-[#B3261E] dark:text-[#FF9B94] border-b border-dotted border-[#B3261E]/60 dark:border-[#FF9B94]/60 hover:bg-[#B3261E]/10',
  },
  战: {
    label: '征伐/军事',
    className: 'text-[#8E1F28] dark:text-[#FF7B72] bg-[#B3261E]/10 dark:bg-[#B02A37]/25 px-1 rounded-xs font-medium',
  },
  刑: {
    label: '刑律/狱法',
    className: 'text-[#0A4FA8] dark:text-[#79C0FF] bg-[#3D8BFD]/10 dark:bg-[#0A58CA]/25 px-1 rounded-xs font-medium',
  },
  政: {
    label: '政事/封赏',
    className: 'text-[#6B4E00] dark:text-[#FFD700] bg-[#D9A406]/10 dark:bg-[#7A5A00]/25 px-1 rounded-xs font-medium',
  },
  赋: {
    label: '经济/赋役',
    className: 'text-[#0F5C2E] dark:text-[#7EE787] bg-[#28A745]/10 dark:bg-[#146C2E]/25 px-1 rounded-xs font-medium',
  },
}

export const TaggedText: React.FC<TaggedTextProps> = ({
  content,
  showEntities,
  onSelectEntity,
}) => {
  if (!content) return null

  // If entities are disabled or text has no tags, render as plain text
  if (!showEntities || !content.includes('⟪')) {
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
      label: '概念',
      className: 'border-b border-dotted opacity-80 hover:opacity-100',
    }

    parts.push(
      <span
        key={`${match.index}-${label}`}
        onClick={(e) => {
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          onSelectEntity?.(label, prefix, {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
          })
        }}
        title={`${label} [${meta.label}] · 点击调取史实释义与全书索引`}
        className={`inline cursor-pointer transition-all duration-150 rounded-xs select-none ${meta.className}`}
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
