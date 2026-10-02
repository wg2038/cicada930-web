import { useEffect, useState, useCallback } from 'react'
import { dbClient, type ChapterData } from './db/client'
import { useReaderSettings } from './hooks/useReaderSettings'
import { Header } from './components/Header'
import { ReaderView } from './components/ReaderView'
import { SanjiazhuPanel } from './components/SanjiazhuPanel'
import { ChapterDrawer } from './components/ChapterDrawer'
import { SearchModal } from './components/SearchModal'
import { EntityModal } from './components/EntityModal'
import { SpecialModal } from './components/SpecialModal'
import type { Chapter, Section, SearchResultItem } from './types/shiji'
import type { EntityAnchorRect } from './components/TaggedText'
import { Loader2, Scroll } from 'lucide-react'

export function App() {
  const {
    settings,
    isDark,
    updateSetting,
    setThemeStyle,
    setDarkMode,
    toggleDarkMode,
  } = useReaderSettings()

  // App Initialization & Loading State
  const [dbReady, setDbReady] = useState(false)
  const [initProgress, setInitProgress] = useState(0)
  const [progressText, setProgressText] = useState('正在连接《史记》典籍引擎...')

  // Chapters & Current Reading Data
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterId, setCurrentChapterId] = useState<number>(() => {
    const hash = window.location.hash
    const match = hash.match(/#chapter=(\d+)/)
    return match ? parseInt(match[1], 10) : 1
  })

  const [chapterData, setChapterData] = useState<ChapterData | null>(null)
  const [chapterLoading, setChapterLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<Section | null>(null)
  const [targetPn, setTargetPn] = useState<string | null>(null)

  // Dialogs, Popovers & Drawers
  const [chapterDrawerOpen, setChapterDrawerOpen] = useState(false)
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [specialOpen, setSpecialOpen] = useState(false)
  const [selectedEntityLabel, setSelectedEntityLabel] = useState<string | null>(null)
  const [selectedEntityAnchorRect, setSelectedEntityAnchorRect] = useState<EntityAnchorRect | null>(null)

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Initialize DB
  useEffect(() => {
    dbClient
      .init((percent, text) => {
        setInitProgress(percent)
        setProgressText(text)
      })
      .then(() => {
        setDbReady(true)
        return dbClient.getChapters()
      })
      .then((loadedChapters) => {
        setChapters(loadedChapters)
      })
      .catch((err) => {
        console.error('Database initialization error:', err)
        setProgressText('数据库载入异常，请刷新重试：' + (err.message || String(err)))
      })
  }, [])

  // Load Chapter Data when currentChapterId changes
  const loadChapter = useCallback(
    async (chapterId: number, pnToTarget?: string) => {
      setChapterLoading(true)
      try {
        const data = await dbClient.getChapterData(chapterId)
        setChapterData(data)
        setCurrentChapterId(chapterId)
        window.location.hash = `#chapter=${chapterId}`

        if (pnToTarget) {
          setTargetPn(pnToTarget)
          const matched = data.sections.find((s) => s.pn_index === pnToTarget)
          setActiveSection(matched || data.sections[0] || null)
        } else {
          setTargetPn(null)
          setActiveSection(data.sections[0] || null)
        }
      } catch (err) {
        console.error('Failed to load chapter:', err)
      } finally {
        setChapterLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (dbReady) {
      loadChapter(currentChapterId)
    }
  }, [dbReady, currentChapterId, loadChapter])

  const handlePrevChapter = () => {
    if (currentChapterId > 1) {
      loadChapter(currentChapterId - 1)
    }
  }

  const handleNextChapter = () => {
    if (currentChapterId < chapters.length) {
      loadChapter(currentChapterId + 1)
    }
  }

  const handleSelectSearchResult = (item: SearchResultItem) => {
    if (item.type === 'entity') {
      setSelectedEntityLabel(item.title)
      setSelectedEntityAnchorRect(null)
    } else if (item.chapter_id) {
      loadChapter(item.chapter_id, item.section_pn)
    }
  }

  if (!dbReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--theme-bg)] text-[var(--theme-text)]">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--theme-primary-container)] text-[var(--theme-primary)] flex items-center justify-center border border-[var(--theme-border)] shadow-sm">
            <Scroll className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-wider font-serif">《史记》全本精读</h1>
            <p className="text-xs text-[var(--theme-text-muted)]">
              Cicada 930 Web · 纯前端 WebAssembly 离线古籍数字人文库
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-[var(--theme-border)]/40 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[var(--theme-primary)] h-full transition-all duration-300 rounded-full"
                style={{ width: `${initProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--theme-text-muted)] font-mono">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--theme-primary)]" />
                {progressText}
              </span>
              <span>{initProgress}%</span>
            </div>
          </div>

          <p className="text-[11px] text-[var(--theme-text-muted)] max-w-xs mx-auto leading-relaxed">
            首次打开需从服务端下载约 24.89MB 的 SQLite 完整数据库并写入浏览器本地缓存，后续加载将实现秒开。
          </p>
        </div>
      </div>
    )
  }

  const currentChapter = chapters.find((c) => c.id === currentChapterId) || null

  return (
    <div className="min-h-screen flex flex-col bg-[var(--theme-bg)] text-[var(--theme-text)] transition-colors duration-200">
      {/* Top Header */}
      <Header
        currentChapter={currentChapter}
        totalChapters={chapters.length}
        settings={settings}
        isDark={isDark}
        onOpenDrawer={() => setChapterDrawerOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSpecialModal={() => setSpecialOpen(true)}
        onToggleNotesDrawer={() => setNotesDrawerOpen(!notesDrawerOpen)}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        onUpdateSetting={updateSetting}
        onSetThemeStyle={setThemeStyle}
        onSetDarkMode={setDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Reading Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Classical Text Reader */}
        <main className="flex-1 overflow-y-auto">
          {chapterLoading || !chapterData ? (
            <div className="flex flex-col items-center justify-center py-32 text-[var(--theme-text-muted)]">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-primary)] mb-3" />
              <p className="text-sm">正在展卷《{currentChapter?.title || '史记'}》...</p>
            </div>
          ) : (
            <ReaderView
              chapter={chapterData.chapter}
              sections={chapterData.sections}
              notes={chapterData.notes}
              stories={chapterData.stories}
              chengyu={chapterData.chengyu}
              taishigongyue={chapterData.taishigongyue}
              activeSectionPn={activeSection?.pn_index || null}
              targetPn={targetPn}
              settings={settings}
              onSelectSection={(sec) => setActiveSection(sec)}
              onOpenNotesDrawer={(sec) => {
                setActiveSection(sec)
                // If dualPane is active and on desktop, section is already focused
                // Otherwise open the notes drawer
                if (!settings.dualPane || (typeof window !== 'undefined' && window.innerWidth < 1024)) {
                  setNotesDrawerOpen(true)
                }
              }}
              onSelectEntity={(label, _prefix, rect) => {
                setSelectedEntityLabel(label)
                setSelectedEntityAnchorRect(rect || null)
              }}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
              totalChapters={chapters.length}
            />
          )}
        </main>

        {/* Right Column: Sanjiazhu Dual-Pane (Desktop) */}
        {settings.dualPane && chapterData && (
          <aside className="hidden lg:block w-88 xl:w-96 shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
            <SanjiazhuPanel
              notes={chapterData.notes}
              currentSection={activeSection}
              settings={settings}
            />
          </aside>
        )}
      </div>

      {/* Web Off-canvas Notes Drawer (Slides in from the right when toggled or on mobile) */}
      {notesDrawerOpen && chapterData && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs transition-opacity"
          onClick={() => setNotesDrawerOpen(false)}
        >
          <div
            className="w-full max-w-sm sm:max-w-md h-full flex flex-col shadow-2xl bg-[var(--theme-card)] text-[var(--theme-text)] border-l border-[var(--theme-border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <SanjiazhuPanel
              notes={chapterData.notes}
              currentSection={activeSection}
              settings={settings}
              onClose={() => setNotesDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Left Off-canvas Chapter Drawer */}
      <ChapterDrawer
        isOpen={chapterDrawerOpen}
        chapters={chapters}
        currentChapterId={currentChapterId}
        onSelectChapter={(id) => loadChapter(id)}
        onClose={() => setChapterDrawerOpen(false)}
      />

      {/* Instant Search Modal (Web Spotlight) */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      {/* Entity Web Popover / Card (Anchored to clicked word on desktop, clean web dialog on mobile) */}
      <EntityModal
        label={selectedEntityLabel}
        anchorRect={selectedEntityAnchorRect}
        onClose={() => {
          setSelectedEntityLabel(null)
          setSelectedEntityAnchorRect(null)
        }}
        onSelectChapter={(chapId, pn) => loadChapter(chapId, pn)}
      />

      {/* Special Topics Modal (Clean Web Modal) */}
      <SpecialModal
        isOpen={specialOpen}
        onClose={() => setSpecialOpen(false)}
        onSelectChapter={(chapId, pn) => loadChapter(chapId, pn)}
      />
    </div>
  )
}

export default App
