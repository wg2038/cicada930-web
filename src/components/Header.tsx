import { useState } from 'react'
import {
  Menu,
  Search,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Columns,
  Square,
  Sparkles,
  BookMarked,
  Languages,
} from 'lucide-react'
import type { Chapter, ReaderSettings, ThemeStyle, DarkMode } from '../types/shiji'

interface HeaderProps {
  currentChapter: Chapter | null
  totalChapters: number
  settings: ReaderSettings
  isDark: boolean
  isSettingsOpen?: boolean
  onToggleSettings?: () => void
  onCloseSettings?: () => void
  onOpenDrawer: () => void
  onOpenSearch: () => void
  onOpenSpecialModal: () => void
  onToggleNotesDrawer?: () => void
  onPrevChapter: () => void
  onNextChapter: () => void
  onUpdateSetting: <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => void
  onSetThemeStyle: (style: ThemeStyle) => void
  onSetDarkMode: (mode: DarkMode) => void
  onToggleDarkMode: () => void
}

export const Header: React.FC<HeaderProps> = ({
  currentChapter,
  totalChapters,
  settings,
  isDark,
  isSettingsOpen,
  onToggleSettings,
  onCloseSettings,
  onOpenDrawer,
  onOpenSearch,
  onOpenSpecialModal,
  onToggleNotesDrawer,
  onPrevChapter,
  onNextChapter,
  onUpdateSetting,
  onSetThemeStyle,
  onSetDarkMode,
  onToggleDarkMode,
}) => {
  const [internalShowSettings, setInternalShowSettings] = useState(false)
  const showSettingsMenu = isSettingsOpen !== undefined ? isSettingsOpen : internalShowSettings
  const toggleSettings = onToggleSettings || (() => setInternalShowSettings((prev) => !prev))
  const closeSettings = onCloseSettings || (() => setInternalShowSettings(false))

  const THEME_OPTIONS: { id: ThemeStyle; name: string; desc: string; previewBg: string; previewAccent: string }[] = [
    {
      id: 'parchment',
      name: '宣纸',
      desc: isDark ? '玄青夜读' : '澄心宣白',
      previewBg: isDark ? '#14120F' : '#F2ECE1',
      previewAccent: isDark ? '#F2B39E' : '#8E3424',
    },
    {
      id: 'indigo',
      name: '线装',
      desc: isDark ? '星夜黛蓝' : '磁青素月',
      previewBg: isDark ? '#0E131A' : '#ECEFF3',
      previewAccent: isDark ? '#A3C5F7' : '#1F4675',
    },
    {
      id: 'bamboo',
      name: '竹简',
      desc: isDark ? '墨绿竹金' : '天青竹月',
      previewBg: isDark ? '#171A14' : '#E9EFE7',
      previewAccent: isDark ? '#D9BC8A' : '#26563F',
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--theme-border)] bg-[var(--theme-header-bg)] backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand & Chapter Drawer Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] hover:bg-[var(--theme-card-hover)] transition-all text-[var(--theme-text)] shadow-2xs"
            title="展开 130 篇卷目目录"
          >
            <Menu className="w-4 h-4 text-[var(--theme-primary)]" />
            <span className="text-xs sm:text-sm font-bold tracking-wide hidden sm:inline">卷目</span>
          </button>

          {/* Chapter Quick Switcher (Desktop) */}
          {currentChapter && (
            <div className="hidden sm:flex items-center gap-0.5 sm:gap-1.5">
              <button
                onClick={onPrevChapter}
                disabled={currentChapter.id <= 1}
                className="p-1 sm:p-1.5 rounded text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="上一篇"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                onClick={onOpenDrawer}
                className="cursor-pointer font-bold text-xs sm:text-base text-[var(--theme-text)] flex items-center gap-1 hover:text-[var(--theme-primary)] transition-colors px-1 py-1 rounded"
                title="点击切换卷次"
              >
                <span className="font-mono text-[11px] sm:text-xs px-1.5 py-0.5 rounded bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)] font-bold">
                  {currentChapter.id}
                </span>
                <span className="truncate max-w-[120px] sm:max-w-xs">{currentChapter.title}</span>
              </div>

              <button
                onClick={onNextChapter}
                disabled={currentChapter.id >= totalChapters}
                className="p-1 sm:p-1.5 rounded text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="下一篇"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Center: Prominent Chapter Title */}
        {currentChapter && (
          <div
            onClick={onOpenDrawer}
            className="sm:hidden flex items-center justify-center gap-1.5 font-bold text-sm text-[var(--theme-text)] cursor-pointer truncate max-w-[180px] px-2 py-1 rounded-lg"
            title="点击展开卷目"
          >
            <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)] font-bold shrink-0">
              卷{currentChapter.id}
            </span>
            <span className="truncate font-serif">{currentChapter.title}</span>
          </div>
        )}

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Special view / Topics (Desktop/Tablet only) */}
          <button
            onClick={onOpenSpecialModal}
            className="hidden md:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
            title="太史公曰、成语典故、重大战役专题"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
            <span>集锦</span>
          </button>

          {/* Notes Drawer Toggle (Desktop/Tablet only) */}
          {onToggleNotesDrawer && (
            <button
              onClick={onToggleNotesDrawer}
              className="hidden md:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
              title="展开或折叠三家注疏与白话译文"
            >
              <BookMarked className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
              <span>注疏</span>
            </button>
          )}

          {/* Quick Translation Toggle (Desktop/Tablet only) */}
          <button
            onClick={() => onUpdateSetting('showTranslation', !settings.showTranslation)}
            className={`hidden md:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              settings.showTranslation
                ? 'bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)] font-bold shadow-2xs'
                : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40'
            }`}
            title={settings.showTranslation ? '点击隐藏段落白话译文' : '点击开启段落白话译文'}
          >
            <Languages className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
            <span>译文</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg border border-[var(--theme-border)] bg-[var(--theme-card)] text-xs text-[var(--theme-text-muted)] hover:border-[var(--theme-primary)] transition-colors"
            title="搜索全书 (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">检索</span>
            <kbd className="hidden lg:inline-block px-1 py-0.2 text-[10px] font-mono border border-[var(--theme-border)] rounded text-[var(--theme-text-muted)]">
              ⌘K
            </kbd>
          </button>

          {/* Dark/Light Quick Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
            title={isDark ? '切换为浅色模式' : '切换为深色模式'}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-amber-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-600" />
            )}
          </button>

          {/* Desktop Dual/Single Layout Toggle (Desktop only) */}
          <button
            onClick={() => onUpdateSetting('dualPane', !settings.dualPane)}
            className="hidden lg:flex p-2 rounded-lg text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
            title={settings.dualPane ? '切换为单栏纯文本阅读' : '切换为双栏对照模式'}
          >
            {settings.dualPane ? <Columns className="w-4 h-4 text-[var(--theme-primary)]" /> : <Square className="w-4 h-4" />}
          </button>

          {/* Settings Menu Button (Desktop/Tablet only since Mobile Bottom Bar has it) */}
          <div className="relative">
            <button
              onClick={toggleSettings}
              className={`hidden sm:flex p-2 rounded-lg transition-colors ${
                showSettingsMenu
                  ? 'bg-[var(--theme-primary-container)] text-[var(--theme-on-primary-container)]'
                  : 'text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40'
              }`}
              title="主题皮肤与阅读排版偏好"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Settings Dropdown / Mobile Sheet */}
            {showSettingsMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent backdrop-blur-2xs sm:backdrop-blur-none"
                  onClick={closeSettings}
                />
                <div
                  className="fixed inset-x-3 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] sm:bottom-auto sm:inset-x-auto sm:absolute sm:right-0 sm:mt-2 w-auto sm:w-84 max-h-[82vh] overflow-y-auto p-4 rounded-2xl shadow-2xl border border-[var(--theme-border)] bg-[var(--theme-card)] text-[var(--theme-text)] z-50 space-y-4 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--theme-border)]/70">
                    <span className="font-bold text-sm tracking-wide">排版与主题设置</span>
                    <button
                      onClick={closeSettings}
                      className="text-xs px-2 py-0.5 rounded bg-[var(--theme-border)]/40 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]"
                    >
                      完成
                    </button>
                  </div>

                {/* 1. Theme Style Selector (宣纸 / 线装 / 竹简) */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[var(--theme-text-muted)]">古籍纸墨风格</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => onSetThemeStyle(opt.id)}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                          settings.themeStyle === opt.id
                            ? 'border-[var(--theme-primary)] ring-1 ring-[var(--theme-primary)] bg-[var(--theme-surface)] shadow-2xs font-bold'
                            : 'border-[var(--theme-border)] hover:bg-[var(--theme-card-hover)]'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-stone-400/40 shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: opt.previewBg }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.previewAccent }} />
                        </div>
                        <span className="text-xs">{opt.name}</span>
                        <span className="text-[10px] text-[var(--theme-text-muted)] scale-90">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Dark Mode Selector (浅色 / 深色 / 跟随系统) */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-[var(--theme-text-muted)]">明暗模式</div>
                  <div className="flex rounded-xl bg-[var(--theme-surface)] p-1 border border-[var(--theme-border)]">
                    <button
                      onClick={() => onSetDarkMode('light')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs transition-all ${
                        settings.darkMode === 'light'
                          ? 'bg-[var(--theme-card)] font-bold shadow-xs text-[var(--theme-text)]'
                          : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      浅色
                    </button>
                    <button
                      onClick={() => onSetDarkMode('dark')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs transition-all ${
                        settings.darkMode === 'dark'
                          ? 'bg-[var(--theme-card)] font-bold shadow-xs text-[var(--theme-text)]'
                          : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      深色
                    </button>
                    <button
                      onClick={() => onSetDarkMode('system')}
                      className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-xs transition-all ${
                        settings.darkMode === 'system'
                          ? 'bg-[var(--theme-card)] font-bold shadow-xs text-[var(--theme-text)]'
                          : 'text-[var(--theme-text-muted)] hover:text-[var(--theme-text)]'
                      }`}
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      跟随
                    </button>
                  </div>
                </div>

                {/* 3. Font Size & Line Height */}
                <div className="space-y-2 pt-1 border-t border-[var(--theme-border)]/60 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--theme-text-muted)]">正文字号 ({settings.fontSize}px)</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateSetting('fontSize', Math.max(14, settings.fontSize - 1))}
                        className="w-7 h-6 rounded border border-[var(--theme-border)] hover:bg-[var(--theme-card-hover)] font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <button
                        onClick={() => onUpdateSetting('fontSize', Math.min(26, settings.fontSize + 1))}
                        className="w-7 h-6 rounded border border-[var(--theme-border)] hover:bg-[var(--theme-card-hover)] font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[var(--theme-text-muted)]">行距倍率</span>
                    <div className="flex items-center gap-1">
                      {[1.7, 1.9, 2.2].map((lh) => (
                        <button
                          key={lh}
                          onClick={() => onUpdateSetting('lineHeight', lh)}
                          className={`px-2 py-0.5 rounded text-xs transition-all ${
                            settings.lineHeight === lh
                              ? 'bg-[var(--theme-primary)] text-white font-bold'
                              : 'border border-[var(--theme-border)] hover:bg-[var(--theme-card-hover)]'
                          }`}
                        >
                          {lh}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Reading Toggles */}
                <div className="space-y-2 pt-2 border-t border-[var(--theme-border)]/60 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>实体百科标记高亮 (OAM)</span>
                    <input
                      type="checkbox"
                      checked={settings.showEntities}
                      onChange={(e) => onUpdateSetting('showEntities', e.target.checked)}
                      className="rounded accent-[var(--theme-primary)]"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>正文现代白话译文</span>
                    <input
                      type="checkbox"
                      checked={settings.showTranslation}
                      onChange={(e) => onUpdateSetting('showTranslation', e.target.checked)}
                      className="rounded accent-[var(--theme-primary)]"
                    />
                  </label>

                  <label className="hidden lg:flex items-center justify-between cursor-pointer">
                    <span>双栏对照排版 (大屏适用)</span>
                    <input
                      type="checkbox"
                      checked={settings.dualPane}
                      onChange={(e) => onUpdateSetting('dualPane', e.target.checked)}
                      className="rounded accent-[var(--theme-primary)]"
                    />
                  </label>
                </div>

                {/* 5. Sanjiazhu Independent Filters */}
                <div className="pt-2 border-t border-[var(--theme-border)]/60 text-xs space-y-1.5">
                  <span className="font-semibold text-[var(--theme-text-muted)]">三家注独立显隐</span>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1B6E2E] dark:text-[#7EE787]">裴駰《史记集解》</span>
                    <input
                      type="checkbox"
                      checked={settings.showJijie}
                      onChange={(e) => onUpdateSetting('showJijie', e.target.checked)}
                      className="rounded accent-[#1B6E2E]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9C3D96] dark:text-[#F0A0E8]">司马贞《史记索隐》</span>
                    <input
                      type="checkbox"
                      checked={settings.showSuoyin}
                      onChange={(e) => onUpdateSetting('showSuoyin', e.target.checked)}
                      className="rounded accent-[#9C3D96]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#8B4513] dark:text-[#E5A876]">张守节《史记正义》</span>
                    <input
                      type="checkbox"
                      checked={settings.showZhengyi}
                      onChange={(e) => onUpdateSetting('showZhengyi', e.target.checked)}
                      className="rounded accent-[#8B4513]"
                    />
                  </div>
                </div>
                </div>
              </>
            )}
          </div>

          {/* Upstream Android Project Link */}
          <a
            href="https://github.com/wg2038/cicada930"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex p-2 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] hover:bg-[var(--theme-border)]/40 transition-colors"
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
