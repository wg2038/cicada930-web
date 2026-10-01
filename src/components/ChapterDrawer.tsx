import React, { useState, useMemo } from 'react'
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
        className="w-full max-w-md h-full flex flex-col shadow-2xl bg-[#FAF7F2] dark:bg-[#1A1B20] text-[#2D251E] dark:text-[#E2E2E6] border-r border-stone-200 dark:border-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/40 dark:bg-stone-900/40">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#9C3826]" />
            <h2 className="font-bold text-lg tracking-wide">卷帙全览 (130篇)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-3 border-b border-stone-200 dark:border-stone-800">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索篇名、历史纪事..."
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white/80 dark:bg-stone-900/80 focus:outline-hidden focus:border-[#9C3826] transition-colors"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#9C3826] text-white font-medium shadow-xs'
                    : 'bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-300/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {filteredChapters.map((chapter) => {
            const isCurrent = chapter.id === currentChapterId
            return (
              <button
                key={chapter.id}
                onClick={() => {
                  onSelectChapter(chapter.id)
                  onClose()
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group ${
                  isCurrent
                    ? 'border-[#9C3826] bg-[#9C3826]/10 dark:bg-[#9C3826]/20'
                    : 'border-transparent hover:border-stone-200 dark:hover:border-stone-800 hover:bg-white/60 dark:hover:bg-stone-900/40'
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                      卷{chapter.id}
                    </span>
                    <span
                      className={`font-semibold text-base transition-colors ${
                        isCurrent
                          ? 'text-[#9C3826] dark:text-red-400'
                          : 'group-hover:text-[#9C3826] dark:group-hover:text-red-400'
                      }`}
                    >
                      {chapter.title}
                    </span>
                    <span className="text-xs text-stone-400">· {chapter.category}</span>
                  </div>
                  {chapter.summary && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                      {chapter.summary}
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-stone-400 shrink-0 font-mono">
                  <div>{chapter.word_count.toLocaleString()} 字</div>
                  <div className="text-[11px] opacity-70">{chapter.section_count} 段</div>
                </div>
              </button>
            )
          })}

          {filteredChapters.length === 0 && (
            <div className="py-12 text-center text-stone-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p className="text-sm">未检索到匹配篇章</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
