import React, { useState } from 'react'
import { BookMarked, Filter, Languages, Sparkles, X } from 'lucide-react'
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
  onClose,
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
    <div className="h-full flex flex-col border-stone-300 dark:border-stone-800 lg:border-l bg-[var(--theme-card)] text-[var(--theme-text)] overflow-hidden transition-colors">

      {/* Top Header */}
      <div className="px-4 py-3 border-b border-[var(--theme-border)]/70 bg-[var(--theme-surface)]/60 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <BookMarked className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
          <h3 className="font-bold text-sm sm:text-base tracking-wide truncate">
            三家注考与白话对照
          </h3>
          {currentSection && (
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[var(--theme-border)]/50 text-[var(--theme-text-muted)] font-mono shrink-0">
              § {currentSection.pn_index}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Tab Filters */}
          <div className="flex items-center text-xs bg-[var(--theme-border)]/40 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-0.8 rounded-md transition-all ${
                activeTab === 'all'
                  ? 'bg-[var(--theme-card)] font-bold shadow-xs text-[var(--theme-text)]'
                  : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveTab('jijie')}
              className={`px-2 py-0.8 rounded-md transition-all ${
                activeTab === 'jijie'
                  ? 'bg-[var(--theme-card)] font-bold shadow-xs text-[#1B6E2E] dark:text-[#7EE787]'
                  : 'text-[var(--theme-text-muted)] hover:text-[#1B6E2E]'
              }`}
            >
              集解
            </button>
            <button
              onClick={() => setActiveTab('suoyin')}
              className={`px-2 py-0.8 rounded-md transition-all ${
                activeTab === 'suoyin'
                  ? 'bg-[var(--theme-card)] font-bold shadow-xs text-[#9C3D96] dark:text-[#F0A0E8]'
                  : 'text-[var(--theme-text-muted)] hover:text-[#9C3D96]'
              }`}
            >
              索隐
            </button>
            <button
              onClick={() => setActiveTab('zhengyi')}
              className={`px-2 py-0.8 rounded-md transition-all ${
                activeTab === 'zhengyi'
                  ? 'bg-[var(--theme-card)] font-bold shadow-xs text-[#8B4513] dark:text-[#E5A876]'
                  : 'text-[var(--theme-text-muted)] hover:text-[#8B4513]'
              }`}
            >
              正义
            </button>
          </div>

          {/* Close button on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm leading-relaxed safe-pb">
        {/* Vernacular Translation if present */}
        {currentSection?.translation && (
          <div className="p-3 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-surface)]/80 text-[var(--theme-text)]">
            <div className="flex items-center gap-1.5 font-bold text-xs mb-1 text-[var(--theme-primary)]">
              <Languages className="w-3.5 h-3.5" />
              现代白话文直译
            </div>
            <p className="text-xs leading-relaxed opacity-90 font-sans">
              {currentSection.translation}
            </p>
          </div>
        )}

        {/* Notes */}
        {displayedNotes.length > 0 ? (
          displayedNotes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl border border-[var(--theme-border)]/80 bg-[var(--theme-surface)] shadow-xs space-y-2.5"
            >
              {note.anchor_text && (
                <div className="text-xs font-semibold text-[var(--theme-text-muted)] pb-1 border-b border-[var(--theme-border)]/50 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  考异标目：<span className="text-[var(--theme-primary)] font-bold font-serif">“{note.anchor_text}”</span>
                </div>
              )}

              {/* Jijie */}
              {hasJijie(note) && (activeTab === 'all' || activeTab === 'jijie') && (
                <div className="space-y-1">
                  <div className="inline-block px-1.5 py-0.5 text-[11px] font-bold rounded-sm bg-[#1B6E2E]/10 dark:bg-[#7EE787]/15 text-[#1B6E2E] dark:text-[#7EE787]">
                    【集解】裴駰
                  </div>
                  <p className="text-xs text-[var(--theme-text)] font-serif pl-1 leading-relaxed">
                    {note.jijie}
                  </p>
                </div>
              )}

              {/* Suoyin */}
              {hasSuoyin(note) && (activeTab === 'all' || activeTab === 'suoyin') && (
                <div className="space-y-1">
                  <div className="inline-block px-1.5 py-0.5 text-[11px] font-bold rounded-sm bg-[#9C3D96]/10 dark:bg-[#F0A0E8]/15 text-[#9C3D96] dark:text-[#F0A0E8]">
                    【索隐】司马贞
                  </div>
                  <p className="text-xs text-[var(--theme-text)] font-serif pl-1 leading-relaxed">
                    {note.suoyin}
                  </p>
                </div>
              )}

              {/* Zhengyi */}
              {hasZhengyi(note) && (activeTab === 'all' || activeTab === 'zhengyi') && (
                <div className="space-y-1">
                  <div className="inline-block px-1.5 py-0.5 text-[11px] font-bold rounded-sm bg-[#8B4513]/10 dark:bg-[#E5A876]/15 text-[#8B4513] dark:text-[#E5A876]">
                    【正义】张守节
                  </div>
                  <p className="text-xs text-[var(--theme-text)] font-serif pl-1 leading-relaxed">
                    {note.zhengyi}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-[var(--theme-text-muted)] flex flex-col items-center">
            <Filter className="w-8 h-8 stroke-1 mb-2 opacity-50" />
            <p className="text-xs">
              {currentSection
                ? `段落 [${currentSection.pn_index}] 暂无匹配的三家注疏`
                : '请在正文中轻触段落，同步展卷对应的集解、索隐与正义'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
