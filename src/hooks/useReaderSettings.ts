import { useState, useEffect } from 'react'
import type { ReaderSettings, ThemeMode } from '../types/shiji'

const STORAGE_KEY = 'cicada930_reader_settings'

const defaultSettings: ReaderSettings = {
  theme: 'parchment',
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
        return { ...defaultSettings, ...JSON.parse(saved) }
      }
    } catch {
      // fallback to defaults on storage access error
    }
    return defaultSettings
  })

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

  const setTheme = (theme: ThemeMode) => updateSetting('theme', theme)
  const setFontSize = (fontSize: number) => updateSetting('fontSize', Math.max(14, Math.min(26, fontSize)))
  const toggleDualPane = () => updateSetting('dualPane', !settings.dualPane)

  return {
    settings,
    updateSetting,
    setTheme,
    setFontSize,
    toggleDualPane,
  }
}
