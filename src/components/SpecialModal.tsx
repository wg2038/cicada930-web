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
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-stone-300 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1A1B20] text-[#2D251E] dark:text-[#E2E2E6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#9C3826]" />
            <h2 className="font-bold text-lg tracking-wide">《史记》典籍专题集锦</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-stone-200 dark:border-stone-800 overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-[#9C3826] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Database className="w-4 h-4" />
            典藏概览与数据说明
          </button>
          <button
            onClick={() => setActiveTab('taishigongyue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'taishigongyue'
                ? 'bg-[#9C3826] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Scroll className="w-4 h-4" />
            太史公曰 (126篇)
          </button>
          <button
            onClick={() => setActiveTab('chengyu')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'chengyu'
                ? 'bg-[#9C3826] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            成语典故 (212条)
          </button>
          <button
            onClick={() => setActiveTab('wars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'wars'
                ? 'bg-[#9C3826] text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            重大战役 (736场)
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">正在调取典籍专项数据...</p>
            </div>
          ) : activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 text-center">
                    <div className="text-2xl font-bold font-mono text-[#9C3826]">
                      {stats.chapterCount}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">全书卷帙</div>
                  </div>
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 text-center">
                    <div className="text-2xl font-bold font-mono text-[#9C3826]">
                      {stats.sectionCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">规范段落</div>
                  </div>
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 text-center">
                    <div className="text-2xl font-bold font-mono text-[#9C3826]">
                      {stats.notesCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">三家注条目</div>
                  </div>
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 text-center">
                    <div className="text-2xl font-bold font-mono text-[#9C3826]">
                      {stats.entityCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">文史实体标注</div>
                  </div>
                </div>
              )}

              {/* Data & Project Background */}
              <div className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/50 space-y-4 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#9C3826]" />
                  关于 Cicada 930 Web 版与数字古籍工程
                </h3>
                <p>
                  《史记》是我国历史上第一部纪传体通史，记述了上自黄帝、下至汉武帝太初年间共三千多年的历史。
                  本项目为 <strong>Cicada 930 (wg2038/cicada930)</strong> 官方纯前端独立 Web 版本，采用现代 WebAssembly 技术在客户端零延迟运行整座 24.89MB SQLite 数字人文数据库。
                </p>
                <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
                  <p>
                    <strong>数据来源与标注机制：</strong>
                    古籍原文与三家注（裴駰《集解》、司马贞《索隐》、张守节《正义》）来源于互联网开源古籍数字化成果，标注体系（人物、地名、官职、战役、典故标记）为项目团队自研定制。
                  </p>
                  <p>
                    <strong>AI 模型协同研发：</strong>
                    本工程中海量古籍的结构化抽取、注疏上下文对齐、实体关系提取，以及大部分 Kotlin/React 代码架构，均由 <strong>Google Gemini 3.8 Flash</strong> 模型深度协作完成。
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'taishigongyue' ? (
            <div className="space-y-4">
              {taishigongyueList.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-[#9C3826] font-serif">
                      《{item.chapter_title}》太史公曰
                    </span>
                    <button
                      onClick={() => {
                        onSelectChapter(item.chapter_id)
                        onClose()
                      }}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#9C3826] transition-colors"
                    >
                      <span>阅读本卷</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 font-serif leading-relaxed whitespace-pre-line">
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
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-[#9C3826]">{item.word}</span>
                    <button
                      onClick={() => {
                        onSelectChapter(item.chapter_id, item.pn)
                        onClose()
                      }}
                      className="text-xs text-stone-500 hover:text-[#9C3826] flex items-center gap-1 transition-colors"
                    >
                      <span>《{item.chapter_title}》</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  {item.quote && (
                    <div className="text-xs text-stone-500 dark:text-stone-400 italic">
                      “{item.quote}”
                    </div>
                  )}
                  {item.meaning && (
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
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
                  className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-[#9C3826]">{item.name}</span>
                    <span className="text-xs text-stone-400">《{item.chapter_title}》</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
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
