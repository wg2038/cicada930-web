import React, { useState, useEffect, useRef } from 'react'
import { Search, X, Loader2, BookOpen, User, Sparkles } from 'lucide-react'
import { dbClient } from '../db/client'
import type { SearchResultItem } from '../types/shiji'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectResult: (item: SearchResultItem) => void
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResultItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      dbClient
        .search(trimmed)
        .then((res) => {
          setResults(res)
        })
        .catch((err) => {
          console.error('Search failed:', err)
        })
        .finally(() => {
          setLoading(false)
        })
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl flex flex-col rounded-xl shadow-2xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1A1B20] text-[#2D251E] dark:text-[#E2E2E6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60">
          <Search className="w-5 h-5 text-stone-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索《史记》全本段落、人物、地名、成语典故 (如：鸿门宴、萧何、破釜沉舟)..."
            className="flex-1 text-base bg-transparent border-none outline-hidden placeholder:text-stone-400 text-stone-800 dark:text-stone-100"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-stone-400 mr-2" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 border border-stone-300 dark:border-stone-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
          {results.map((item, idx) => (
            <button
              key={`${item.type}-${item.id}-${idx}`}
              onClick={() => {
                onSelectResult(item)
                onClose()
              }}
              className="w-full text-left p-3 rounded-lg border border-transparent hover:border-stone-200 dark:hover:border-stone-800 bg-white/50 dark:bg-stone-900/40 hover:bg-white dark:hover:bg-stone-800/80 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {item.type === 'entity' && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-medium">
                      <User className="w-3 h-3" />
                      人物/实体
                    </span>
                  )}
                  {item.type === 'chengyu' && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 font-medium">
                      <Sparkles className="w-3 h-3" />
                      成语典故
                    </span>
                  )}
                  {item.type === 'section' && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                      <BookOpen className="w-3 h-3 text-[#9C3826]" />
                      正文段落
                    </span>
                  )}
                  <span className="font-bold text-base group-hover:text-[#9C3826] transition-colors">
                    {item.title}
                  </span>
                </div>
                {item.subtitle && (
                  <span className="text-xs text-stone-400 font-medium">{item.subtitle}</span>
                )}
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                {item.snippet}
              </p>
            </button>
          ))}

          {!loading && query && results.length === 0 && (
            <div className="py-12 text-center text-stone-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">未找到与 “{query}” 相关的古籍内容</p>
            </div>
          )}

          {!query && (
            <div className="py-10 text-center text-stone-400 text-xs space-y-2">
              <p>输入关键词，即时穿透 130 篇、1.3 万个古籍段落与 2 万余条人物地名实体</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="text-stone-500">推荐热词：</span>
                {['项羽', '韩信', '四面楚歌', '鸿门宴', '完璧归赵', '管鲍之交', '焚书坑儒'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-2 py-1 rounded bg-stone-200/60 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
