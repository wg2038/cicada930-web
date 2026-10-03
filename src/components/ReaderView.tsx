import React, { useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookMarked,
  Scroll,
  Info,
} from 'lucide-react'
import { TaggedText, type EntityAnchorRect } from './TaggedText'
import type {
  Chapter,
  Section,
  SanjiazhuNote,
  Story,
  Chengyu,
  Taishigongyue,
  ReaderSettings,
} from '../types/shiji'

interface ReaderViewProps {
  chapter: Chapter
  sections: Section[]
  notes: SanjiazhuNote[]
  stories: Story[]
  chengyu: Chengyu[]
  taishigongyue: Taishigongyue | null
  activeSectionPn: string | null
  targetPn?: string | null
  settings: ReaderSettings
  onSelectSection: (section: Section) => void
  onOpenNotesDrawer?: (section: Section) => void
  onSelectEntity: (label: string, prefix: string, rect?: EntityAnchorRect) => void
  onPrevChapter: () => void
  onNextChapter: () => void
  totalChapters: number
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  chapter,
  sections,
  notes,
  stories,
  chengyu,
  taishigongyue,
  activeSectionPn,
  targetPn,
  settings,
  onSelectSection,
  onOpenNotesDrawer,
  onSelectEntity,
  onPrevChapter,
  onNextChapter,
  totalChapters,
}) => {
  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  // Scroll to targeted section if targetPn is passed
  useEffect(() => {
    if (targetPn && sectionRefs.current.has(targetPn)) {
      const el = sectionRefs.current.get(targetPn)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [targetPn])

  // Map notes by sentence_id for fast lookup
  const notesBySection = React.useMemo(() => {
    const map = new Map<string, SanjiazhuNote[]>()
    for (const note of notes) {
      if (!map.has(note.sentence_id)) {
        map.set(note.sentence_id, [])
      }
      map.get(note.sentence_id)!.push(note)
    }
    return map
  }, [notes])

  return (
    <div className="w-full px-2 sm:px-6 py-4 sm:py-6 space-y-6 select-text">
      {/* Chapter Title & Header */}
      <div className="text-center space-y-2.5 sm:space-y-3 pb-5 sm:pb-6 border-b border-[var(--theme-border)]/80">
        <div className="inline-block px-3 py-1 text-xs font-bold tracking-widest rounded-full bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)] border border-[var(--theme-border)]">
          {chapter.category} · 卷第 {chapter.id}
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--theme-text)] font-serif">
          {chapter.title}
        </h1>
        <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs text-[var(--theme-text-muted)] font-mono">
          <span>{chapter.word_count.toLocaleString()} 字</span>
          <span>·</span>
          <span>{chapter.section_count} 段落</span>
          <span>·</span>
          <span>{notes.length} 条三家注</span>
        </div>
        {chapter.summary && (
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[var(--theme-text-muted)] italic bg-[var(--theme-card)] p-3.5 rounded-xl border border-[var(--theme-border)] text-left leading-relaxed">
            <span className="font-semibold not-italic text-[var(--theme-text)]">卷前提要：</span>
            {chapter.summary}
          </p>
        )}
      </div>

      {/* Sections List */}
      <div
        className="space-y-4 sm:space-y-5"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
        }}
      >
        {sections.map((section) => {
          const isHeading = section.section_type.startsWith('heading')
          const isActive = activeSectionPn === section.pn_index
          const sectionNotes = notesBySection.get(section.pn_index) || []
          const hasNotes = sectionNotes.length > 0

          if (isHeading) {
            const level = section.heading_level || 2
            return (
              <div
                key={section.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(section.pn_index, el)
                }}
                className={`pt-3 sm:pt-4 font-serif font-bold text-[var(--theme-text)] ${
                  level === 1
                    ? 'text-xl sm:text-2xl border-b pb-2 border-[var(--theme-border)]'
                    : level === 2
                    ? 'text-lg sm:text-xl'
                    : 'text-base sm:text-lg opacity-90'
                }`}
              >
                {section.heading_text || section.plain_text}
              </div>
            )
          }

          return (
            <div
              key={section.id}
              ref={(el) => {
                if (el) sectionRefs.current.set(section.pn_index, el)
              }}
              onClick={() => onSelectSection(section)}
              className={`group relative rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[var(--theme-surface)]/90 ring-1 ring-[var(--theme-primary)]/40 shadow-xs'
                  : 'hover:bg-[var(--theme-surface)]/40'
              }`}
            >
              {/* Desktop Left-gutter Section Number (§ pn) */}
              <span className="hidden xl:block absolute -left-10 top-3 text-[11px] font-mono text-[var(--theme-text-muted)] opacity-35 group-hover:opacity-90 transition-opacity select-none text-right w-7">
                {section.pn_index}
              </span>

              {/* Classical Text with Entity Tags & Inline Note Badge */}
              <div className="font-serif tracking-normal text-[var(--theme-text)] leading-relaxed text-justify whitespace-pre-line relative">
                {/* Mobile / Tablet Paragraph Prefix Badge */}
                <span className="xl:hidden inline-block mr-1.5 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[var(--theme-border)]/40 text-[var(--theme-text-muted)] select-none align-baseline">
                  {section.pn_index}
                </span>

                <TaggedText
                  content={section.tagged_content || section.plain_text || ''}
                  showEntities={settings.showEntities}
                  onSelectEntity={onSelectEntity}
                />

                {/* Inline Classical Notes Pill Badge */}
                {hasNotes && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSection(section)
                      onOpenNotesDrawer?.(section)
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-sans px-2 py-0.5 ml-2 rounded-full border border-[var(--theme-primary)]/30 bg-[var(--theme-primary-container)]/40 hover:bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)] font-medium transition-all shadow-2xs align-middle select-none active:scale-95"
                    title="在侧边栏或抽屉中查看本段三家注疏"
                  >
                    <BookMarked className="w-3 h-3 text-[var(--theme-primary)]" />
                    <span>注 {sectionNotes.length}</span>
                  </button>
                )}
              </div>

              {/* Vernacular Translation if enabled */}
              {settings.showTranslation && section.translation?.trim() && (
                <div className="mt-2.5 pl-3.5 pr-3 py-2 rounded-r-lg border-l-2 border-[var(--theme-primary)]/40 bg-[var(--theme-card)]/70 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors font-sans text-[0.88em] leading-relaxed text-justify whitespace-pre-line select-text">
                  <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.2 rounded bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)] mr-2 select-none align-middle font-mono">
                    译
                  </span>
                  {section.translation.trim()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Taishigongyue (太史公曰) Section */}
      {taishigongyue && (
        <div className="my-8 sm:my-10 p-5 sm:p-7 rounded-2xl border-2 border-[var(--theme-primary)]/40 bg-[var(--theme-card)] shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-[var(--theme-primary)] font-bold text-lg font-serif">
            <Scroll className="w-5 h-5" />
            <h3>太史公曰</h3>
          </div>
          <div className="font-serif leading-relaxed text-[var(--theme-text)] text-sm sm:text-base text-justify whitespace-pre-line">
            {taishigongyue.plain_content || taishigongyue.content}
          </div>
        </div>
      )}

      {/* Related Chengyu in this Chapter */}
      {chengyu.length > 0 && (
        <div className="pt-6 border-t border-[var(--theme-border)] space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--theme-text)]">
            <Sparkles className="w-4 h-4 text-[var(--theme-primary)]" />
            <span>本卷成语典故 ({chengyu.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {chengyu.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[var(--theme-primary)]">{item.word}</span>
                  <span className="text-[var(--theme-text-muted)] font-mono">段落 {item.pn}</span>
                </div>
                {item.quote && <p className="text-[var(--theme-text-muted)] italic font-serif">“{item.quote}”</p>}
                {item.meaning && (
                  <p className="text-[var(--theme-text)]">{item.meaning}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Historical Stories in this Chapter */}
      {stories.length > 0 && (
        <div className="pt-6 border-t border-[var(--theme-border)] space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--theme-text)]">
            <Info className="w-4 h-4 text-[var(--theme-primary)]" />
            <span>本卷重大史事记 ({stories.length})</span>
          </div>
          <div className="space-y-2.5">
            {stories.map((story) => (
              <div
                key={story.id}
                className="p-3.5 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] space-y-1.5 text-xs"
              >
                <h4 className="font-bold text-sm text-[var(--theme-text)]">
                  {story.title}
                </h4>
                {story.summary && (
                  <p className="text-[var(--theme-text-muted)] leading-relaxed">
                    {story.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter Bottom Navigation */}
      <div className="pt-6 sm:pt-8 border-t border-[var(--theme-border)] flex items-center justify-between safe-pb">
        <button
          onClick={onPrevChapter}
          disabled={chapter.id <= 1}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] hover:bg-[var(--theme-card-hover)] disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-semibold transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>上一篇</span>
        </button>

        <span className="text-xs text-[var(--theme-text-muted)] font-mono">
          卷 {chapter.id} / {totalChapters}
        </span>

        <button
          onClick={onNextChapter}
          disabled={chapter.id >= totalChapters}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-[var(--theme-border)] bg-[var(--theme-card)] hover:bg-[var(--theme-card-hover)] disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-semibold transition-all"
        >
          <span>下一篇</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
