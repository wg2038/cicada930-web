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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1C1D22] text-[#2D251E] dark:text-[#E2E2E6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-800/40">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold tracking-wide">{label}</h3>
            {entity?.type_name_zh && (
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#9C3826]/10 text-[#9C3826] dark:bg-red-950/60 dark:text-red-300 border border-[#9C3826]/20">
                {entity.type_name_zh}
              </span>
            )}
            {entity?.occurrences_count ? (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                全书出场 {entity.occurrences_count} 次
              </span>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
              <p className="text-sm">正在检索实体图谱...</p>
            </div>
          ) : (
            <>
              {/* Description */}
              <div className="text-base leading-relaxed text-stone-800 dark:text-stone-200 bg-white/60 dark:bg-stone-900/40 p-4 rounded-lg border border-stone-200/60 dark:border-stone-800">
                {entity?.description || '暂无详细历史百科释义。'}
              </div>

              {/* Aliases if any */}
              {entity?.aliases && (
                <div className="text-sm text-stone-600 dark:text-stone-400">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">别称/异名：</span>
                  {entity.aliases}
                </div>
              )}

              {/* Occurrences across chapters */}
              {occurrences.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2.5 flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <BookOpen className="w-4 h-4 text-[#9C3826]" />
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
                        className="flex items-center justify-between px-3 py-2 text-left rounded-md text-sm border border-stone-200 dark:border-stone-800 hover:border-[#9C3826]/40 dark:hover:border-red-500/40 bg-white/40 dark:bg-stone-900/30 hover:bg-[#9C3826]/5 transition-all group"
                      >
                        <span className="font-medium truncate group-hover:text-[#9C3826] transition-colors">
                          《{occ.chapter_title}》
                        </span>
                        <span className="text-xs text-stone-400 group-hover:text-stone-600 flex items-center gap-0.5">
                          段落 {occ.section_pn}
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
