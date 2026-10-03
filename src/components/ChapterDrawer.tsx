import React, { useState, useMemo, useEffect, useRef } from 'react'
import { X, Search, BookOpen, Layers } from 'lucide-react'
import type { Chapter } from '../types/shiji'

interface ChapterDrawerProps {
  isOpen: boolean
  chapters: Chapter[]
  currentChapterId: number
  onSelectChapter: (id: number) => void
  onClose: () => void
}

const CATEGORIES = ['全部', '本纪', '表', '书', '世家', '列传']

export const ChapterDrawer: React.FC<ChapterDrawerProps> = ({
  isOpen,
  chapters,
  currentChapterId,
  onSelectChapter,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [searchQuery, setSearchQuery] = useState('')
  const activeItemRef = useRef<HTMLButtonElement | null>(null)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Scroll current chapter into view on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 60)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const filteredChapters = useMemo(() => {
    return chapters.filter((c) => {
      const matchCat = selectedCategory === '全部' || c.category === selectedCategory
      const matchQuery =
        !searchQuery ||
        c.title.includes(searchQuery) ||
        (c.summary && c.summary.includes(searchQuery))
      return matchCat && matchQuery
    })
  }, [chapters, selectedCategory, searchQuery])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md h-full flex flex-col shadow-2xl bg-[var(--theme-card)] text-[var(--theme-text)] border-r border-[var(--theme-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--theme-border)] flex items-center justify-between bg-[var(--theme-surface)]/60">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--theme-primary)]" />
            <h2 className="font-bold text-base sm:text-lg tracking-wide">卷帙全览 (130篇)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-[var(--theme-border)] bg-[var(--theme-card)]">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--theme-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索篇名、历史纪事..."
              className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] focus:outline-hidden focus:border-[var(--theme-primary)] transition-colors text-[var(--theme-text)]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[var(--theme-primary)] text-white font-bold shadow-xs'
                    : 'bg-[var(--theme-surface)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] border border-[var(--theme-border)]/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-1.5 safe-pb">
          {filteredChapters.map((chapter) => {
            const isCurrent = chapter.id === currentChapterId
            return (
              <button
                key={chapter.id}
                ref={isCurrent ? activeItemRef : undefined}
                onClick={() => {
                  onSelectChapter(chapter.id)
                  onClose()
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                  isCurrent
                    ? 'border-[var(--theme-primary)] bg-[var(--theme-primary-container)]/30 ring-1 ring-[var(--theme-primary)]'
                    : 'border-transparent hover:border-[var(--theme-border)] hover:bg-[var(--theme-surface)]'
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-[var(--theme-border)]/50 text-[var(--theme-text-muted)] font-bold">
                      卷{chapter.id}
                    </span>
                    <span
                      className={`font-bold text-sm sm:text-base font-serif transition-colors ${
                        isCurrent
                          ? 'text-[var(--theme-primary)]'
                          : 'group-hover:text-[var(--theme-primary)]'
                      }`}
                    >
                      {chapter.title}
                    </span>
                    <span className="text-xs text-[var(--theme-text-muted)]">· {chapter.category}</span>
                  </div>
                  {chapter.summary && (
                    <p className="text-xs text-[var(--theme-text-muted)] line-clamp-1">
                      {chapter.summary}
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-[var(--theme-text-muted)] shrink-0 font-mono">
                  <div>{chapter.word_count.toLocaleString()} 字</div>
                  <div className="text-[11px] opacity-70">{chapter.section_count} 段</div>
                </div>
              </button>
            )
          })}

          {filteredChapters.length === 0 && (
            <div className="py-12 text-center text-[var(--theme-text-muted)]">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">未检索到匹配篇章</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
