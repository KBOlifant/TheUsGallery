'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../auth/AuthProvider'
import { rememberPath } from '../lib/lastPage'

function RouteMemory() {
  const pathname = usePathname()
  useEffect(() => rememberPath(pathname), [pathname])
  return null
}

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouteMemory />
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </AuthProvider>
    </ThemeProvider>
  )
}
