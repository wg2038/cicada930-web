import React from 'react'
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Languages,
  SlidersHorizontal,
} from 'lucide-react'
import type { Chapter } from '../types/shiji'

interface MobileBottomBarProps {
  currentChapter: Chapter | null
  totalChapters: number
  notesCount: number
  showTranslation: boolean
  onOpenDrawer: () => void
  onOpenNotesDrawer: () => void
  onToggleTranslation: () => void
  onPrevChapter: () => void
  onNextChapter: () => void
  onOpenSettings: () => void
}

/**
 * 现代移动端底部沉浸阅读坞（Mobile Bottom Action Bar）。
 * 遵循现代移动阅读人机工学，将核心阅读高频操作集中于单手拇指黄金操作区。
 */
export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentChapter,
  totalChapters,
  notesCount,
  showTranslation,
  onOpenDrawer,
  onOpenNotesDrawer,
  onToggleTranslation,
  onPrevChapter,
  onNextChapter,
  onOpenSettings,
}) => {
  const chapterId = currentChapter?.id || 1

  return (
    <nav
      aria-label="移动端阅读导航栏"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-[var(--theme-border)] bg-[var(--theme-header-bg)] backdrop-blur-lg safe-pb shadow-lg transition-transform duration-300"
    >
      <div className="flex items-center justify-around h-13 px-2 max-w-lg mx-auto">
        {/* 1. 卷目目录 */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] active:scale-95 transition-all"
          title="卷帙目录"
        >
          <Menu className="w-4.5 h-4.5" />
          <span className="text-[10px] mt-0.5 font-medium">目录</span>
        </button>

        {/* 2. 上一卷 */}
        <button
          onClick={onPrevChapter}
          disabled={chapterId <= 1}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
          title="上一卷"
        >
          <ChevronLeft className="w-4.5 h-4.5" />
          <span className="text-[10px] mt-0.5 font-medium">上卷</span>
        </button>

        {/* 3. 白话译文开关 */}
        <button
          onClick={onToggleTranslation}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all active:scale-95 ${
            showTranslation
              ? 'text-[var(--theme-primary)] font-bold'
              : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
          }`}
          title={showTranslation ? '隐藏白话译文' : '开启白话译文'}
        >
          <div className="relative">
            <Languages className="w-4.5 h-4.5" />
            {showTranslation && (
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">译文</span>
        </button>

        {/* 4. 三家注疏抽屉 */}
        <button
          onClick={onOpenNotesDrawer}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] active:scale-95 transition-all relative"
          title="查看本段三家注疏"
        >
          <div className="relative">
            <BookMarked className="w-4.5 h-4.5" />
            {notesCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-mono font-bold rounded-full bg-[var(--theme-primary)] text-white">
                {notesCount > 99 ? '99+' : notesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">注疏</span>
        </button>

        {/* 5. 下一卷 */}
        <button
          onClick={onNextChapter}
          disabled={chapterId >= totalChapters}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
          title="下一卷"
        >
          <ChevronRight className="w-4.5 h-4.5" />
          <span className="text-[10px] mt-0.5 font-medium">下卷</span>
        </button>

        {/* 6. 排版与皮肤设置 */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] active:scale-95 transition-all"
          title="排版与主题设置"
        >
          <SlidersHorizontal className="w-4.5 h-4.5" />
          <span className="text-[10px] mt-0.5 font-medium">排版</span>
        </button>
      </div>
    </nav>
  )
}
