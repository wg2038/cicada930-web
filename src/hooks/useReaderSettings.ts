import { useState, useEffect } from 'react'
import type { ReaderSettings, ThemeStyle, DarkMode } from '../types/shiji'

const STORAGE_KEY = 'cicada930_reader_settings'

const defaultSettings: ReaderSettings = {
  themeStyle: 'parchment',
  darkMode: 'light',
  fontSize: 18,
  lineHeight: 1.9,
  showJijie: true,
  showSuoyin: true,
  showZhengyi: true,
  showTranslation: false,
  showEntities: true,
  dualPane: true,
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Migration support from legacy 'theme' property
        if (parsed.theme && !parsed.themeStyle) {
          if (parsed.theme === 'dark') {
            parsed.themeStyle = 'parchment'
            parsed.darkMode = 'dark'
          } else {
            parsed.themeStyle = 'parchment'
            parsed.darkMode = 'light'
          }
        }
        return { ...defaultSettings, ...parsed }
      }
    } catch {
      // fallback to defaults on storage access error
    }
    return defaultSettings
  })

  // System dark mode listener
  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const isDark =
    settings.darkMode === 'dark' || (settings.darkMode === 'system' && systemDark)

  // Sync with document element for CSS attributes
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', settings.themeStyle)
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [settings.themeStyle, isDark])

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // ignore
    }
  }, [settings])

  const updateSetting = <K extends keyof ReaderSettings>(key: K, value: ReaderSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const setThemeStyle = (themeStyle: ThemeStyle) => updateSetting('themeStyle', themeStyle)
  const setDarkMode = (darkMode: DarkMode) => updateSetting('darkMode', darkMode)
  const setFontSize = (fontSize: number) => updateSetting('fontSize', Math.max(14, Math.min(26, fontSize)))
  const toggleDualPane = () => updateSetting('dualPane', !settings.dualPane)

  const toggleDarkMode = () => {
    const nextMode: DarkMode = isDark ? 'light' : 'dark'
    setDarkMode(nextMode)
  }

  return {
    settings,
    isDark,
    updateSetting,
    setThemeStyle,
    setDarkMode,
    toggleDarkMode,
    setFontSize,
    toggleDualPane,
  }
}
