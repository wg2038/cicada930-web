import React, { useState, useEffect } from 'react'
import {
  X,
  Scroll,
  Sparkles,
  ShieldAlert,
  Database,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { dbClient } from '../db/client'
import type { DBStats, Chengyu, War, Taishigongyue } from '../types/shiji'

interface SpecialModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectChapter: (chapterId: number, sectionPn?: string) => void
}

type TabType = 'overview' | 'taishigongyue' | 'chengyu' | 'wars'

export const SpecialModal: React.FC<SpecialModalProps> = ({
  isOpen,
  onClose,
  onSelectChapter,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [stats, setStats] = useState<DBStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [chengyuList, setChengyuList] = useState<Chengyu[]>([])
  const [warsList, setWarsList] = useState<War[]>([])
  const [taishigongyueList, setTaishigongyueList] = useState<Taishigongyue[]>([])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    dbClient.getStats().then(setStats).catch(console.error)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    if (activeTab === 'chengyu' && chengyuList.length === 0) {
      setLoading(true)
      dbClient
        .getSpecialList<Chengyu>('chengyu')
        .then(setChengyuList)
        .finally(() => setLoading(false))
    } else if (activeTab === 'wars' && warsList.length === 0) {
      setLoading(true)
      dbClient
        .getSpecialList<War>('wars')
        .then(setWarsList)
        .finally(() => setLoading(false))
    } else if (activeTab === 'taishigongyue' && taishigongyueList.length === 0) {
      setLoading(true)
      dbClient
        .getSpecialList<Taishigongyue>('taishigongyue')
        .then(setTaishigongyueList)
        .finally(() => setLoading(false))
    }
  }, [isOpen, activeTab, chengyuList.length, warsList.length, taishigongyueList.length])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)]"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/60 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--theme-primary)]" />
            <h2 className="font-bold text-base sm:text-lg tracking-wide">《史记》典籍专题集锦</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-4 sm:px-6 pt-2.5 pb-2 border-b border-[var(--theme-border)] overflow-x-auto text-xs sm:text-sm shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-[var(--theme-primary)] text-white shadow-xs'
                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)]'
            }`}
          >
            <Database className="w-4 h-4" />
            典藏概览
          </button>
          <button
            onClick={() => setActiveTab('taishigongyue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'taishigongyue'
                ? 'bg-[var(--theme-primary)] text-white shadow-xs'
                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)]'
            }`}
          >
            <Scroll className="w-4 h-4" />
            太史公曰 (126篇)
          </button>
          <button
            onClick={() => setActiveTab('chengyu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'chengyu'
                ? 'bg-[var(--theme-primary)] text-white shadow-xs'
                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            成语典故 (212条)
          </button>
          <button
            onClick={() => setActiveTab('wars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
              activeTab === 'wars'
                ? 'bg-[var(--theme-primary)] text-white shadow-xs'
                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-surface)]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            重大战役 (736场)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 safe-pb">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--theme-text-muted)]">
              <Loader2 className="w-8 h-8 animate-spin mb-2 text-[var(--theme-primary)]" />
              <p className="text-sm">正在调取典籍专项数据...</p>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-5">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                  <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-center">
                    <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--theme-primary)]">
                      {stats.chapterCount}
                    </div>
                    <div className="text-xs text-[var(--theme-text-muted)] mt-1">全书卷帙</div>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-center">
                    <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--theme-primary)]">
                      {stats.sectionCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--theme-text-muted)] mt-1">结构化段落</div>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-center">
                    <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--theme-primary)]">
                      {stats.notesCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--theme-text-muted)] mt-1">三家注条目</div>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] text-center">
                    <div className="text-xl sm:text-2xl font-bold font-mono text-[var(--theme-primary)]">
                      {stats.entityCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-[var(--theme-text-muted)] mt-1">文史实体标注</div>
                  </div>
                </div>
              )}

              {/* Data & Project Background */}
              <div className="p-4 sm:p-5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] space-y-3.5 text-xs sm:text-sm leading-relaxed text-[var(--theme-text)]">
                <h3 className="font-bold text-sm sm:text-base text-[var(--theme-text)] flex items-center gap-2">
                  <Database className="w-4 h-4 text-[var(--theme-primary)]" />
                  关于 Cicada 930 Web 版与数字古籍工程
                </h3>
                <p>
                  《史记》是我国历史上第一部纪传体通史，记述了上自黄帝、下至汉武帝太初年间共三千多年的历史。
                  本项目为 <strong>Cicada 930 (wg2038/cicada930)</strong> 官方纯前端独立 Web 版本，采用现代 WebAssembly 技术在客户端零延迟运行整座 24.89MB SQLite 数字人文数据库。
                </p>
                <div className="space-y-2 pt-2 border-t border-[var(--theme-border)]/60 text-xs text-[var(--theme-text-muted)]">
                  <p>
                    <strong className="text-[var(--theme-text)]">数据来源与标注机制：</strong>
                    古籍原文与三家注（裴駰《集解》、司马贞《索隐》、张守节《正义》）来源于互联网开源古籍数字化成果，标注体系（人物、地名、官职、战役、典故标记）为自研定制。
                  </p>
                  <p>
                    <strong className="text-[var(--theme-text)]">AI 模型协同研发：</strong>
                    本工程中海量古籍的结构化抽取、注疏上下文对齐、实体关系提取，以及大部分 React/TypeScript 前端架构，均由 <strong>Google Gemini 3.8 Flash</strong> 模型深度协作完成。
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'taishigongyue' ? (
            <div className="space-y-3.5">
              {taishigongyueList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm sm:text-base text-[var(--theme-primary)] font-serif">
                      《{item.chapter_title}》太史公曰
                    </span>
                    <button
                      onClick={() => {
                        onSelectChapter(item.chapter_id)
                        onClose()
                      }}
                      className="flex items-center gap-1 text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] transition-colors font-medium"
                    >
                      <span>阅读本卷</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--theme-text)] font-serif leading-relaxed whitespace-pre-line text-justify">
                    {item.plain_content || item.content}
                  </p>
                </div>
              ))}
            </div>
          ) : activeTab === 'chengyu' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chengyuList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm sm:text-base text-[var(--theme-primary)]">{item.word}</span>
                    <button
                      onClick={() => {
                        onSelectChapter(item.chapter_id, item.pn)
                        onClose()
                      }}
                      className="text-xs text-[var(--theme-text-muted)] hover:text-[var(--theme-primary)] flex items-center gap-1 transition-colors"
                    >
                      <span>《{item.chapter_title}》</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  {item.quote && (
                    <div className="text-[var(--theme-text-muted)] italic font-serif">
                      “{item.quote}”
                    </div>
                  )}
                  {item.meaning && (
                    <p className="text-[var(--theme-text)] leading-relaxed">
                      {item.meaning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {warsList.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-surface)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm sm:text-base text-[var(--theme-primary)]">{item.name}</span>
                    <span className="text-xs text-[var(--theme-text-muted)] font-serif">《{item.chapter_title}》</span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--theme-text)] leading-relaxed text-justify font-serif">
                    {item.full_description || item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
