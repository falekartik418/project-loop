'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'

const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
  dark: false,
  toggle: () => {},
})

export const useThemeMode = () => useContext(ThemeContext)

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('loop-theme')
    if (saved === 'dark') setDark(true)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.body.classList.toggle('dark-mode', dark)
    localStorage.setItem('loop-theme', dark ? 'dark' : 'light')
  }, [dark, mounted])

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark((d) => !d) }}>
      <ConfigProvider theme={{ algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm }}>
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}