'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'

export type ColorTheme = {
  id: string
  name: string
  primary: string
  sidebar: string
  sidebarActive: string
  bg: string
}

export const PRESET_THEMES: ColorTheme[] = [
  { id: 'loop', name: 'Loop Violet', primary: '#5038f2', sidebar: '#0c0f1b', sidebarActive: '#1d1b4b', bg: '#f5f7fa' },
  { id: 'ocean', name: 'Ocean', primary: '#0284c7', sidebar: '#0b1a2b', sidebarActive: '#12365a', bg: '#f0f7fc' },
  { id: 'forest', name: 'Forest', primary: '#16a34a', sidebar: '#0d1a14', sidebarActive: '#14352a', bg: '#f2faf5' },
  { id: 'sunset', name: 'Sunset', primary: '#ea580c', sidebar: '#1f1410', sidebarActive: '#4a2414', bg: '#fff8f3' },
  { id: 'rose', name: 'Rose', primary: '#db2777', sidebar: '#1f0f19', sidebarActive: '#4a1a35', bg: '#fdf4f8' },
]

type Ctx = {
  dark: boolean
  toggle: () => void
  colors: ColorTheme
  setColors: (t: ColorTheme) => void
  customThemes: ColorTheme[]
  addCustom: (t: ColorTheme) => void
  removeCustom: (id: string) => void
}

const ThemeContext = createContext<Ctx>({
  dark: false,
  toggle: () => {},
  colors: PRESET_THEMES[0],
  setColors: () => {},
  customThemes: [],
  addCustom: () => {},
  removeCustom: () => {},
})

export const useThemeMode = () => useContext(ThemeContext)

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [colors, setColorsState] = useState<ColorTheme>(PRESET_THEMES[0])
  const [customThemes, setCustomThemes] = useState<ColorTheme[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('loop-theme')
    if (saved === 'dark') setDark(true)
    try {
      const c = localStorage.getItem('loop-color-theme')
      if (c) setColorsState(JSON.parse(c))
      const list = localStorage.getItem('loop-custom-themes')
      if (list) setCustomThemes(JSON.parse(list))
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.body.classList.toggle('dark-mode', dark)
    localStorage.setItem('loop-theme', dark ? 'dark' : 'light')
  }, [dark, mounted])

  useEffect(() => {
    if (!mounted) return
    const s = document.documentElement.style
    s.setProperty('--t-primary', colors.primary)
    s.setProperty('--t-sidebar', colors.sidebar)
    s.setProperty('--t-sidebar-active', colors.sidebarActive)
    s.setProperty('--t-bg', colors.bg)
    localStorage.setItem('loop-color-theme', JSON.stringify(colors))
  }, [colors, mounted])

  const addCustom = (t: ColorTheme) => {
    const next = [...customThemes, t]
    setCustomThemes(next)
    localStorage.setItem('loop-custom-themes', JSON.stringify(next))
  }

  const removeCustom = (id: string) => {
    const next = customThemes.filter((t) => t.id !== id)
    setCustomThemes(next)
    localStorage.setItem('loop-custom-themes', JSON.stringify(next))
  }

  return (
    <ThemeContext.Provider
      value={{ dark, toggle: () => setDark((d) => !d), colors, setColors: setColorsState, customThemes, addCustom, removeCustom }}
    >
      <ConfigProvider
        theme={{
          algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: { colorPrimary: colors.primary },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}