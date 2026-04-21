import React, { createContext, useEffect, useState } from 'react'
import { ConfigProvider } from 'antd'

export const ThemeContext = createContext({ primaryColor: '#FF6E00', setPrimaryColor: () => {} })

export default function ThemeProvider({ children }) {
  const envColor = process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#FF6E00'
  const [primaryColor, setPrimaryColor] = useState(envColor)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('primaryColor')
      if (saved) setPrimaryColor(saved)
    } catch (e) {
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('primaryColor', primaryColor)
    } catch (e) {
    }
  }, [primaryColor])

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      <ConfigProvider theme={{ token: { colorPrimary: primaryColor } }}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  )
}
