import React, { useState } from 'react'
import { BookMarked, Filter, Languages, Sparkles } from 'lucide-react'
import type { SanjiazhuNote, Section, ReaderSettings } from '../types/shiji'

interface SanjiazhuPanelProps {
  notes: SanjiazhuNote[]
  currentSection: Section | null
  settings: ReaderSettings
  onClose?: () => void
}

type NoteTab = 'all' | 'jijie' | 'suoyin' | 'zhengyi'

export const SanjiazhuPanel: React.FC<SanjiazhuPanelProps> = ({
  notes,
  currentSection,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<NoteTab>('all')

  // Filter notes belonging to current section
  const sectionNotes = currentSection
    ? notes.filter((n) => n.sentence_id === currentSection.pn_index)
    : []

  const hasJijie = (n: SanjiazhuNote) => settings.showJijie && Boolean(n.jijie)
  const hasSuoyin = (n: SanjiazhuNote) => settings.showSuoyin && Boolean(n.suoyin)
  const hasZhengyi = (n: SanjiazhuNote) => settings.showZhengyi && Boolean(n.zhengyi)

  const filterNote = (n: SanjiazhuNote) => {
    if (activeTab === 'jijie') return hasJijie(n)
    if (activeTab === 'suoyin') return hasSuoyin(n)
    if (activeTab === 'zhengyi') return hasZhengyi(n)
    return hasJijie(n) || hasSuoyin(n) || hasZhengyi(n)
  }

  const displayedNotes = sectionNotes.filter(filterNote)

  return (
    <div className="h-full flex flex-col border-l border-stone-200 dark:border-stone-800 bg-[#FAF7F2]/60 dark:bg-[#18191E]/70 overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 bg-white/40 dark:bg-stone-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-[#9C3826]" />
          <h3 className="font-bold text-base tracking-wide text-stone-800 dark:text-stone-200">
            三家注考与白话对照
          </h3>
          {currentSection && (
            <span className="text-xs px-2 py-0.5 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
              段落 {currentSection.pn_index}
            </span>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center text-xs bg-stone-200/60 dark:bg-stone-800 p-0.5 rounded-md">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2 py-1 rounded transition-all ${
              activeTab === 'all'
                ? 'bg-white dark:bg-stone-700 font-semibold shadow-xs text-stone-900 dark:text-stone-100'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setActiveTab('jijie')}
            className={`px-2 py-1 rounded transition-all ${
              activeTab === 'jijie'
                ? 'bg-white dark:bg-stone-700 font-semibold shadow-xs text-amber-800 dark:text-amber-300'
                : 'text-stone-600 dark:text-stone-400 hover:text-amber-800'
            }`}
          >
            集解
          </button>
          <button
            onClick={() => setActiveTab('suoyin')}
            className={`px-2 py-1 rounded transition-all ${
              activeTab === 'suoyin'
                ? 'bg-white dark:bg-stone-700 font-semibold shadow-xs text-indigo-800 dark:text-indigo-300'
                : 'text-stone-600 dark:text-stone-400 hover:text-indigo-800'
            }`}
          >
            索隐
          </button>
          <button
            onClick={() => setActiveTab('zhengyi')}
            className={`px-2 py-1 rounded transition-all ${
              activeTab === 'zhengyi'
                ? 'bg-white dark:bg-stone-700 font-semibold shadow-xs text-emerald-800 dark:text-emerald-300'
                : 'text-stone-600 dark:text-stone-400 hover:text-emerald-800'
            }`}
          >
            正义
          </button>
        </div>
      </div>

      {/* Body List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm leading-relaxed">
        {/* Vernacular Translation if present */}
        {currentSection?.translation && (
          <div className="p-3.5 rounded-lg border border-blue-200/70 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 text-blue-950 dark:text-blue-200">
            <div className="flex items-center gap-1.5 font-semibold text-xs mb-1.5 text-blue-800 dark:text-blue-300">
              <Languages className="w-3.5 h-3.5" />
              现代白话文译注
            </div>
            <p className="text-xs leading-relaxed text-blue-900/90 dark:text-blue-100/90">
              {currentSection.translation}
            </p>
          </div>
        )}

        {/* Notes */}
        {displayedNotes.length > 0 ? (
          displayedNotes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 shadow-xs space-y-3"
            >
              {note.anchor_text && (
                <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 pb-1 border-b border-stone-100 dark:border-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#9C3826]" />
                  标目：<span className="text-[#9C3826] font-bold">“{note.anchor_text}”</span>
                </div>
              )}

              {/* Jijie */}
              {hasJijie(note) && (activeTab === 'all' || activeTab === 'jijie') && (
                <div className="space-y-1">
                  <div className="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                    【集解】裴駰
                  </div>
                  <p className="text-xs text-stone-800 dark:text-stone-200 pl-1 leading-relaxed">
                    {note.jijie}
                  </p>
                </div>
              )}

              {/* Suoyin */}
              {hasSuoyin(note) && (activeTab === 'all' || activeTab === 'suoyin') && (
                <div className="space-y-1">
                  <div className="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded bg-indigo-100 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
                    【索隐】司马贞
                  </div>
                  <p className="text-xs text-stone-800 dark:text-stone-200 pl-1 leading-relaxed">
                    {note.suoyin}
                  </p>
                </div>
              )}

              {/* Zhengyi */}
              {hasZhengyi(note) && (activeTab === 'all' || activeTab === 'zhengyi') && (
                <div className="space-y-1">
                  <div className="inline-block px-1.5 py-0.5 text-[11px] font-semibold rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                    【正义】张守节
                  </div>
                  <p className="text-xs text-stone-800 dark:text-stone-200 pl-1 leading-relaxed">
                    {note.zhengyi}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-stone-400 dark:text-stone-600 flex flex-col items-center">
            <Filter className="w-8 h-8 stroke-1 mb-2 opacity-60" />
            <p className="text-xs">
              {currentSection
                ? '此段暂无匹配的三家注释，请点击或滚动至其它段落浏览'
                : '请在左侧正文中点击段落，同步查看对应的集解、索隐与正义'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
