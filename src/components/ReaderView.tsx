import React, { useEffect, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BookMarked,
  Scroll,
  Info,
} from 'lucide-react'
import { TaggedText } from './TaggedText'
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
  onSelectEntity: (label: string, prefix: string) => void
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
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 space-y-8 select-text">
      {/* Chapter Title & Header */}
      <div className="text-center space-y-3 pb-6 border-b border-stone-200/80 dark:border-stone-800">
        <div className="inline-block px-3 py-1 text-xs font-semibold tracking-widest rounded-full bg-[#9C3826]/10 text-[#9C3826] dark:bg-red-950/60 dark:text-red-300 border border-[#9C3826]/20">
          {chapter.category} · 卷第 {chapter.id}
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
          {chapter.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-mono">
          <span>{chapter.word_count.toLocaleString()} 字</span>
          <span>·</span>
          <span>{chapter.section_count} 段落</span>
          <span>·</span>
          <span>{notes.length} 条三家注</span>
        </div>
        {chapter.summary && (
          <p className="max-w-xl mx-auto text-xs sm:text-sm text-stone-600 dark:text-stone-400 italic bg-stone-100/60 dark:bg-stone-800/40 p-3 rounded-lg border border-stone-200/50 dark:border-stone-800 text-left leading-relaxed">
            <span className="font-semibold not-italic text-stone-700 dark:text-stone-300">卷前提要：</span>
            {chapter.summary}
          </p>
        )}
      </div>

      {/* Sections List */}
      <div
        className="space-y-6"
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
                className={`pt-4 font-serif font-bold text-stone-900 dark:text-stone-100 ${
                  level === 1
                    ? 'text-2xl border-b pb-2 border-stone-300 dark:border-stone-700'
                    : level === 2
                    ? 'text-xl'
                    : 'text-lg text-stone-800 dark:text-stone-200'
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
              className={`group relative rounded-xl p-3 sm:p-4 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-amber-100/50 dark:bg-amber-950/20 ring-1 ring-[#9C3826]/40 dark:ring-amber-500/40'
                  : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
              }`}
            >
              {/* Paragraph number badge */}
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1 select-none font-mono">
                <span className="opacity-60 group-hover:opacity-100 transition-opacity">
                  § {section.pn_index}
                </span>
                {hasNotes && (
                  <span className="flex items-center gap-1 text-[11px] font-sans px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    <BookMarked className="w-3 h-3 text-[#9C3826]" />
                    {sectionNotes.length}条注疏
                  </span>
                )}
              </div>

              {/* Classical Text with Entity Tags */}
              <div className="font-serif tracking-normal text-stone-900 dark:text-stone-100 leading-relaxed text-justify">
                <TaggedText
                  content={section.tagged_content || section.plain_text || ''}
                  showEntities={settings.showEntities}
                  onSelectEntity={onSelectEntity}
                />
              </div>

              {/* Vernacular Translation if enabled */}
              {settings.showTranslation && section.translation && (
                <div className="mt-3 p-3 rounded-lg border-l-2 border-[#9C3826] bg-stone-100/70 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 text-xs sm:text-sm leading-relaxed">
                  <span className="font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    【译文】
                  </span>
                  {section.translation}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Taishigongyue (太史公曰) Section */}
      {taishigongyue && (
        <div className="my-10 p-6 rounded-2xl border-2 border-[#9C3826]/30 bg-[#FAF7F2] dark:bg-[#1C1D22] shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3 text-[#9C3826] font-bold text-lg font-serif">
            <Scroll className="w-5 h-5" />
            <h3>太史公曰</h3>
          </div>
          <div className="font-serif leading-relaxed text-stone-800 dark:text-stone-200 text-base text-justify whitespace-pre-line">
            {taishigongyue.plain_content || taishigongyue.content}
          </div>
        </div>
      )}

      {/* Related Chengyu in this Chapter */}
      {chengyu.length > 0 && (
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-700 dark:text-stone-300">
            <Sparkles className="w-4 h-4 text-[#9C3826]" />
            <span>本卷成语典故 ({chengyu.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {chengyu.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/30 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#9C3826]">{item.word}</span>
                  <span className="text-stone-400 font-mono">段落 {item.pn}</span>
                </div>
                {item.quote && <p className="text-stone-500 italic">“{item.quote}”</p>}
                {item.meaning && (
                  <p className="text-stone-700 dark:text-stone-300">{item.meaning}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Historical Stories in this Chapter */}
      {stories.length > 0 && (
        <div className="pt-6 border-t border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-stone-700 dark:text-stone-300">
            <Info className="w-4 h-4 text-[#9C3826]" />
            <span>本卷重大史事记 ({stories.length})</span>
          </div>
          <div className="space-y-2">
            {stories.map((story) => (
              <div
                key={story.id}
                className="p-3.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/30 space-y-1.5 text-xs"
              >
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {story.title}
                </h4>
                {story.summary && (
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                    {story.summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter Bottom Navigation */}
      <div className="pt-8 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
        <button
          onClick={onPrevChapter}
          disabled={chapter.id <= 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-medium transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>上一篇</span>
        </button>

        <span className="text-xs text-stone-400 font-mono">
          卷 {chapter.id} / {totalChapters}
        </span>

        <button
          onClick={onNextChapter}
          disabled={chapter.id >= totalChapters}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 disabled:pointer-events-none text-xs sm:text-sm font-medium transition-all"
        >
          <span>下一篇</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
