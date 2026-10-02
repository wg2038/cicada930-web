import React, { useEffect, useState, useMemo } from 'react'
import { X, BookOpen, ExternalLink, Loader2 } from 'lucide-react'
import { dbClient } from '../db/client'
import type { Entity } from '../types/shiji'
import type { EntityAnchorRect } from './TaggedText'

interface EntityModalProps {
  label: string | null
  anchorRect?: EntityAnchorRect | null
  onClose: () => void
  onSelectChapter?: (chapterId: number, sectionPn?: string) => void
}

export const EntityModal: React.FC<EntityModalProps> = ({
  label,
  anchorRect,
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Desktop floating popover position calculation
  const popoverStyle = useMemo(() => {
    if (!anchorRect || typeof window === 'undefined' || window.innerWidth < 640) {
      return null
    }

    const cardWidth = 420
    const cardEstHeight = 360
    const padding = 16

    let left = anchorRect.left
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding
    }
    if (left < padding) {
      left = padding
    }

    let top = anchorRect.bottom + 8
    // If not enough room below, display above the word
    if (top + cardEstHeight > window.innerHeight - padding && anchorRect.top > cardEstHeight) {
      top = anchorRect.top - cardEstHeight - 8
    }

    return {
      top: `${Math.max(padding, top)}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
    }
  }, [anchorRect])

  if (!label) return null

  // Desktop Floating Popover
  if (popoverStyle) {
    return (
      <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-2xs" onClick={onClose}>
        <div
          style={popoverStyle}
          className="fixed z-50 max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] animate-in fade-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/70 shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold font-serif tracking-wide">{label}</h3>
              {entity?.type_name_zh && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-sm bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)]">
                  {entity.type_name_zh}
                </span>
              )}
              {entity?.occurrences_count ? (
                <span className="text-xs text-[var(--theme-text-muted)] font-mono">
                  出场 {entity.occurrences_count} 次
                </span>
              ) : null}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-[var(--theme-text-muted)]">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-[var(--theme-primary)]" />
                <span>检索史料中...</span>
              </div>
            ) : (
              <>
                <p className="leading-relaxed text-[var(--theme-text)] bg-[var(--theme-surface)]/70 p-3 rounded-xl border border-[var(--theme-border)]/60 font-serif text-justify">
                  {entity?.description || '暂无详细历史百科释义。'}
                </p>

                {entity?.aliases && (
                  <div className="text-xs text-[var(--theme-text-muted)]">
                    <span className="font-bold text-[var(--theme-text)]">别称：</span>
                    {entity.aliases}
                  </div>
                )}

                {occurrences.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold mb-1.5 flex items-center gap-1 text-[var(--theme-text)]">
                      <BookOpen className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      全书出场索引（前 {occurrences.length} 处）
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                      {occurrences.map((occ, idx) => (
                        <button
                          key={`${occ.chapter_id}-${occ.section_pn}-${idx}`}
                          onClick={() => {
                            onSelectChapter?.(occ.chapter_id, occ.section_pn)
                            onClose()
                          }}
                          className="flex items-center justify-between px-2.5 py-1.5 text-left rounded-lg text-xs border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-primary)] transition-all group"
                        >
                          <span className="font-bold truncate font-serif group-hover:text-[var(--theme-primary)]">
                            《{occ.chapter_title}》
                          </span>
                          <span className="text-[10px] text-[var(--theme-text-muted)] font-mono ml-1 shrink-0">
                            §{occ.section_pn}
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

  // Mobile Centered Web Modal Dialog (Zero Android bottom-sheet / drag handle)
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--theme-border)] bg-[var(--theme-surface)]/70 shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold font-serif tracking-wide">{label}</h3>
            {entity?.type_name_zh && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-sm bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)]">
                {entity.type_name_zh}
              </span>
            )}
            {entity?.occurrences_count ? (
              <span className="text-xs text-[var(--theme-text-muted)] font-mono">
                全书 {entity.occurrences_count} 次
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 safe-pb text-xs sm:text-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-[var(--theme-text-muted)]">
              <Loader2 className="w-5 h-5 animate-spin mb-2 text-[var(--theme-primary)]" />
              <p className="text-xs">正在检索实体图谱...</p>
            </div>
          ) : (
            <>
              <p className="leading-relaxed text-[var(--theme-text)] bg-[var(--theme-surface)] p-3.5 rounded-xl border border-[var(--theme-border)] font-serif text-justify">
                {entity?.description || '暂无详细历史百科释义。'}
              </p>

              {entity?.aliases && (
                <div className="text-xs text-[var(--theme-text-muted)]">
                  <span className="font-bold text-[var(--theme-text)]">别称/异名：</span>
                  {entity.aliases}
                </div>
              )}

              {occurrences.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5 text-[var(--theme-text)]">
                    <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                    典籍出场索引（前 {occurrences.length} 处）
                  </h4>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {occurrences.map((occ, idx) => (
                      <button
                        key={`${occ.chapter_id}-${occ.section_pn}-${idx}`}
                        onClick={() => {
                          onSelectChapter?.(occ.chapter_id, occ.section_pn)
                          onClose()
                        }}
                        className="flex items-center justify-between px-2.5 py-2 text-left rounded-lg text-xs border border-[var(--theme-border)] bg-[var(--theme-surface)] hover:border-[var(--theme-primary)] transition-all group"
                      >
                        <span className="font-bold truncate font-serif group-hover:text-[var(--theme-primary)]">
                          《{occ.chapter_title}》
                        </span>
                        <span className="text-[11px] text-[var(--theme-text-muted)] font-mono ml-1 shrink-0 flex items-center gap-0.5">
                          §{occ.section_pn}
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
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
