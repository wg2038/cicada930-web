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
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 pt-0 sm:pt-16 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl h-full sm:h-auto sm:max-h-[85vh] flex flex-col rounded-none sm:rounded-2xl shadow-2xl overflow-hidden border-0 sm:border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/70">
          <Search className="w-5 h-5 text-[var(--theme-text-muted)] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索全书段落、人物、成语、战役 (如：鸿门宴、萧何)..."
            className="flex-1 text-sm sm:text-base bg-transparent border-none outline-hidden placeholder:text-[var(--theme-text-muted)]/70 text-[var(--theme-text)]"
          />
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[var(--theme-primary)] mr-2 shrink-0" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="sm:hidden ml-2 text-xs px-2.5 py-1 rounded bg-[var(--theme-border)]/50 font-bold"
          >
            取消
          </button>
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] font-mono text-[var(--theme-text-muted)] border border-[var(--theme-border)] rounded">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="flex-1 max-h-[calc(100vh-60px)] sm:max-h-[60vh] overflow-y-auto p-3 space-y-2 safe-pb">
          {results.map((item, idx) => (
            <button
              key={`${item.type}-${item.id}-${idx}`}
              onClick={() => {
                onSelectResult(item)
                onClose()
              }}
              className="w-full text-left p-3 rounded-xl border border-transparent hover:border-[var(--theme-border)] bg-[var(--theme-surface)] hover:bg-[var(--theme-card-hover)] transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {item.type === 'entity' && (
                    <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-sm bg-[#8B4513]/10 dark:bg-[#E5A876]/15 text-[#8B4513] dark:text-[#E5A876] font-bold">
                      <User className="w-3 h-3" />
                      实体
                    </span>
                  )}
                  {item.type === 'chengyu' && (
                    <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-sm bg-[#B3261E]/10 dark:bg-[#FF9B94]/15 text-[#B3261E] dark:text-[#FF9B94] font-bold">
                      <Sparkles className="w-3 h-3" />
                      典故
                    </span>
                  )}
                  {item.type === 'section' && (
                    <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-sm bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)] font-bold">
                      <BookOpen className="w-3 h-3 text-[var(--theme-primary)]" />
                      段落
                    </span>
                  )}
                  <span className="font-bold text-sm sm:text-base font-serif group-hover:text-[var(--theme-primary)] transition-colors">
                    {item.title}
                  </span>
                </div>
                {item.subtitle && (
                  <span className="text-[11px] text-[var(--theme-text-muted)] font-mono">{item.subtitle}</span>
                )}
              </div>
              <p className="text-xs text-[var(--theme-text-muted)] line-clamp-2 leading-relaxed">
                {item.snippet}
              </p>
            </button>
          ))}

          {!loading && query && results.length === 0 && (
            <div className="py-12 text-center text-[var(--theme-text-muted)]">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">未找到与 “{query}” 相关的古籍内容</p>
            </div>
          )}

          {!query && (
            <div className="py-10 text-center text-[var(--theme-text-muted)] text-xs space-y-3">
              <p>输入关键词，即时穿透 130 篇、1.3 万个古籍段落与 2 万余条人物地名实体</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-md mx-auto">
                <span className="opacity-80">推荐热词：</span>
                {['项羽', '韩信', '四面楚歌', '鸿门宴', '完璧归赵', '管鲍之交', '焚书坑儒', '垓下之围'].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-2.5 py-1 rounded-lg bg-[var(--theme-surface)] hover:bg-[var(--theme-card-hover)] border border-[var(--theme-border)] text-[var(--theme-text)] transition-colors"
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
