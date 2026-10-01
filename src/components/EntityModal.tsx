import React, { useEffect, useState } from 'react'
import { X, BookOpen, ExternalLink, Loader2 } from 'lucide-react'
import { dbClient } from '../db/client'
import type { Entity } from '../types/shiji'

interface EntityModalProps {
  label: string | null
  prefix?: string
  onClose: () => void
  onSelectChapter?: (chapterId: number, sectionPn?: string) => void
}

export const EntityModal: React.FC<EntityModalProps> = ({
  label,
  onClose,
  onSelectChapter,
}) => {
  const [loading, setLoading] = useState(true)
  const [entity, setEntity] = useState<Entity | null>(null)
  const [occurrences, setOccurrences] = useState<
    { chapter_id: number; section_pn: string; chapter_title: string }[]
  >([])

  useEffect(() => {
    if (!label) return
    let active = true
    setLoading(true)

    dbClient
      .getEntityDetails(label)
      .then((res) => {
        if (!active) return
        setEntity(res.entity)
        setOccurrences(res.occurrences)
      })
      .catch((err) => {
        console.error('Failed to load entity details:', err)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [label])

  if (!label) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-12 h-1 rounded-full bg-stone-400/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/60">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl sm:text-2xl font-bold font-serif tracking-wide">{label}</h3>
            {entity?.type_name_zh && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-sm bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)]">
                {entity.type_name_zh}
              </span>
            )}
            {entity?.occurrences_count ? (
              <span className="text-xs text-[var(--theme-text-muted)] font-mono">
                全书出场 {entity.occurrences_count} 次
              </span>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 safe-pb">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--theme-text-muted)]">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-[var(--theme-primary)]" />
              <p className="text-sm">正在检索实体图谱...</p>
            </div>
          ) : (
            <>
              {/* Description */}
              <div className="text-sm sm:text-base leading-relaxed text-[var(--theme-text)] bg-[var(--theme-surface)] p-4 rounded-xl border border-[var(--theme-border)]/70 font-serif">
                {entity?.description || '暂无详细历史百科释义。'}
              </div>

              {/* Aliases if any */}
              {entity?.aliases && (
                <div className="text-xs sm:text-sm text-[var(--theme-text-muted)]">
                  <span className="font-bold text-[var(--theme-text)]">别称/异名：</span>
                  {entity.aliases}
                </div>
              )}

              {/* Occurrences across chapters */}
              {occurrences.length > 0 && (
                <div>
                  <h4 className="text-xs sm:text-sm font-bold mb-2 flex items-center gap-1.5 text-[var(--theme-text)]">
                    <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                    典籍出场篇章（前 {occurrences.length} 处索引）
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {occurrences.map((occ, idx) => (
                      <button
                        key={`${occ.chapter_id}-${occ.section_pn}-${idx}`}
                        onClick={() => {
                          onSelectChapter?.(occ.chapter_id, occ.section_pn)
                          onClose()
                        }}
                        className="flex items-center justify-between px-3 py-2 text-left rounded-lg text-xs sm:text-sm border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-primary)] transition-all group"
                      >
                        <span className="font-bold truncate font-serif group-hover:text-[var(--theme-primary)]">
                          《{occ.chapter_title}》
                        </span>
                        <span className="text-xs text-[var(--theme-text-muted)] font-mono flex items-center gap-0.5">
                          § {occ.section_pn}
                          <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
