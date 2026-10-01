import React, { useState } from 'react'
import {
  Menu,
  Search,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Scroll,
  Columns,
  Square,
  Sparkles,
} from 'lucide-react'
import type { Chapter, ReaderSettings, ThemeMode } from '../types/shiji'

interface HeaderProps {
  currentChapter: Chapter | null
  totalChapters: number
  settings: ReaderSettings
  onOpenDrawer: () => void
  onOpenSearch: () => void
  onOpenSpecialModal: () => void
  onPrevChapter: () => void
  onNextChapter: () => void
  onUpdateSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void
  onSetTheme: (theme: ThemeMode) => void
}

export const Header: React.FC<HeaderProps> = ({
  currentChapter,
  totalChapters,
  settings,
  onOpenDrawer,
  onOpenSearch,
  onOpenSpecialModal,
  onPrevChapter,
  onNextChapter,
  onUpdateSetting,
  onSetTheme,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)

  const toggleTheme = () => {
    if (settings.theme === 'parchment') onSetTheme('light')
    else if (settings.theme === 'light') onSetTheme('dark')
    else onSetTheme('parchment')
  }

  const themeLabel = {
    parchment: '宣纸·竹简',
    light: '月白·素简',
    dark: '玄青·暗夜',
  }[settings.theme]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800 bg-[#FAF7F2]/90 dark:bg-[#16171B]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Left: Brand & Chapter Drawer Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white/60 dark:bg-stone-800/60 hover:bg-[#9C3826]/10 hover:border-[#9C3826]/40 transition-all text-stone-800 dark:text-stone-200"
            title="展开 130 篇卷目目录"
          >
            <Menu className="w-4 h-4 text-[#9C3826]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide hidden sm:inline">卷目</span>
          </button>

          {/* Chapter Quick Switcher */}
          {currentChapter && (
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={onPrevChapter}
                disabled={currentChapter.id <= 1}
                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none"
                title="上一篇"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div
                onClick={onOpenDrawer}
                className="cursor-pointer font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-1.5 hover:text-[#9C3826] transition-colors"
              >
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[#9C3826]/10 text-[#9C3826] dark:bg-red-950/60 dark:text-red-300">
                  {currentChapter.id}/{totalChapters}
                </span>
                <span className="truncate max-w-[140px] sm:max-w-xs">{currentChapter.title}</span>
              </div>
              <button
                onClick={onNextChapter}
                disabled={currentChapter.id >= totalChapters}
                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-30 disabled:pointer-events-none"
                title="下一篇"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Special view / Topics */}
          <button
            onClick={onOpenSpecialModal}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title="太史公曰、成语典故、重大战役专题"
          >
            <Sparkles className="w-4 h-4 text-[#9C3826]" />
            <span className="hidden md:inline">专题集锦</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-300/80 dark:border-stone-700 bg-white/60 dark:bg-stone-800/60 text-xs text-stone-500 dark:text-stone-400 hover:border-[#9C3826]/40 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">全书检索</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[10px] font-mono border border-stone-300 dark:border-stone-700 rounded text-stone-400">
              ⌘K
            </kbd>
          </button>

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title={`当前主题：${themeLabel}（点击切换）`}
          >
            {settings.theme === 'parchment' ? (
              <Scroll className="w-4 h-4 text-[#9C3826]" />
            ) : settings.theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Layout Dual/Single Toggle */}
          <button
            onClick={() => onUpdateSetting('dualPane', !settings.dualPane)}
            className="hidden sm:flex p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title={settings.dualPane ? '切换为单栏纯文本阅读' : '切换为双栏对照模式'}
          >
            {settings.dualPane ? <Columns className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          </button>

          {/* Settings Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu(!showSettingsMenu)}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
              title="阅读偏好与注释排版设置"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Settings Dropdown */}
            {showSettingsMenu && (
              <div
                className="absolute right-0 mt-2 w-72 p-4 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 bg-[#FAF7F2] dark:bg-[#1E1F25] text-stone-800 dark:text-stone-200 z-50 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                  <span className="font-semibold text-sm">阅读与排版偏好</span>
                  <button
                    onClick={() => setShowSettingsMenu(false)}
                    className="text-xs text-stone-400 hover:text-stone-600"
                  >
                    完成
                  </button>
                </div>

                {/* Font Size */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-400">正文字号 ({settings.fontSize}px)</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateSetting('fontSize', Math.max(14, settings.fontSize - 1))}
                      className="px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 font-bold"
                    >
                      A-
                    </button>
                    <button
                      onClick={() => onUpdateSetting('fontSize', Math.min(26, settings.fontSize + 1))}
                      className="px-2 py-0.5 rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 font-bold"
                    >
                      A+
                    </button>
                  </div>
                </div>

                {/* Line Height */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600 dark:text-stone-400">行距倍率</span>
                  <div className="flex items-center gap-1">
                    {[1.7, 1.9, 2.2].map((lh) => (
                      <button
                        key={lh}
                        onClick={() => onUpdateSetting('lineHeight', lh)}
                        className={`px-2 py-0.5 rounded text-xs transition-colors ${
                          settings.lineHeight === lh
                            ? 'bg-[#9C3826] text-white font-medium'
                            : 'border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800'
                        }`}
                      >
                        {lh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>实体百科标记高亮</span>
                    <input
                      type="checkbox"
                      checked={settings.showEntities}
                      onChange={(e) => onUpdateSetting('showEntities', e.target.checked)}
                      className="rounded accent-[#9C3826]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>正文现代白话译文</span>
                    <input
                      type="checkbox"
                      checked={settings.showTranslation}
                      onChange={(e) => onUpdateSetting('showTranslation', e.target.checked)}
                      className="rounded accent-[#9C3826]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>双栏对照排版 (大屏适用)</span>
                    <input
                      type="checkbox"
                      checked={settings.dualPane}
                      onChange={(e) => onUpdateSetting('dualPane', e.target.checked)}
                      className="rounded accent-[#9C3826]"
                    />
                  </label>
                </div>

                {/* Notes Filter */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-xs space-y-1.5">
                  <span className="font-semibold text-stone-500">三家注独立显隐</span>
                  <div className="flex items-center justify-between">
                    <span>裴駰《史记集解》</span>
                    <input
                      type="checkbox"
                      checked={settings.showJijie}
                      onChange={(e) => onUpdateSetting('showJijie', e.target.checked)}
                      className="rounded accent-amber-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>司马贞《史记索隐》</span>
                    <input
                      type="checkbox"
                      checked={settings.showSuoyin}
                      onChange={(e) => onUpdateSetting('showSuoyin', e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>张守节《史记正义》</span>
                    <input
                      type="checkbox"
                      checked={settings.showZhengyi}
                      onChange={(e) => onUpdateSetting('showZhengyi', e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upstream Android Project Link */}
          <a
            href="https://github.com/wg2038/cicada930"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            title="查看 Android 与语料清洗主工程 (wg2038/cicada930)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}
