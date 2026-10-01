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
import { Loader2, Scroll } from 'lucide-react'

export function App() {
  const { settings, updateSetting, setTheme } = useReaderSettings()

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

  // Dialogs & Modals
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [specialOpen, setSpecialOpen] = useState(false)
  const [selectedEntityLabel, setSelectedEntityLabel] = useState<string | null>(null)

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

  // Sync dark class with documentElement
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

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

        // Set default active section
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
    } else if (item.chapter_id) {
      loadChapter(item.chapter_id, item.section_pn)
    }
  }

  // Theme container classes
  const themeClass =
    settings.theme === 'parchment'
      ? 'bg-[#FAF7F2] text-[#2D251E]'
      : settings.theme === 'light'
      ? 'bg-slate-50 text-slate-900'
      : 'bg-[#141519] text-[#E2E2E6]'

  if (!dbReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FAF7F2] text-[#2D251E] dark:bg-[#141519] dark:text-[#E2E2E6]">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#9C3826]/10 text-[#9C3826] flex items-center justify-center border border-[#9C3826]/20 shadow-sm">
            <Scroll className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-wider font-serif">《史记》全本精读</h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Cicada 930 Web · 纯前端 WebAssembly 离线古籍数字人文库
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-[#9C3826] h-full transition-all duration-300 rounded-full"
                style={{ width: `${initProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9C3826]" />
                {progressText}
              </span>
              <span>{initProgress}%</span>
            </div>
          </div>

          <p className="text-[11px] text-stone-400 max-w-xs mx-auto leading-relaxed">
            首次打开需从服务端下载约 24.89MB 的 SQLite 完整数据库并写入浏览器本地缓存，后续加载将实现秒开。
          </p>
        </div>
      </div>
    )
  }

  const currentChapter = chapters.find((c) => c.id === currentChapterId) || null

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${themeClass}`}>
      {/* Top Header */}
      <Header
        currentChapter={currentChapter}
        totalChapters={chapters.length}
        settings={settings}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSpecialModal={() => setSpecialOpen(true)}
        onPrevChapter={handlePrevChapter}
        onNextChapter={handleNextChapter}
        onUpdateSetting={updateSetting}
        onSetTheme={setTheme}
      />

      {/* Main Reading Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Classical Text Reader */}
        <main className="flex-1 overflow-y-auto">
          {chapterLoading || !chapterData ? (
            <div className="flex flex-col items-center justify-center py-32 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#9C3826] mb-3" />
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
              onSelectEntity={(label) => setSelectedEntityLabel(label)}
              onPrevChapter={handlePrevChapter}
              onNextChapter={handleNextChapter}
              totalChapters={chapters.length}
            />
          )}
        </main>

        {/* Right Column: Sanjiazhu Dual-Pane (Desktop) */}
        {settings.dualPane && chapterData && (
          <aside className="hidden lg:block w-96 xl:w-[420px] shrink-0 h-[calc(100vh-3.5rem)] sticky top-14">
            <SanjiazhuPanel
              notes={chapterData.notes}
              currentSection={activeSection}
              settings={settings}
            />
          </aside>
        )}
      </div>

      {/* Modals & Drawers */}
      <ChapterDrawer
        isOpen={drawerOpen}
        chapters={chapters}
        currentChapterId={currentChapterId}
        onSelectChapter={(id) => loadChapter(id)}
        onClose={() => setDrawerOpen(false)}
      />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={handleSelectSearchResult}
      />

      <EntityModal
        label={selectedEntityLabel}
        onClose={() => setSelectedEntityLabel(null)}
        onSelectChapter={(chapId, pn) => loadChapter(chapId, pn)}
      />

      <SpecialModal
        isOpen={specialOpen}
        onClose={() => setSpecialOpen(false)}
        onSelectChapter={(chapId, pn) => loadChapter(chapId, pn)}
      />
    </div>
  )
}

export default App
