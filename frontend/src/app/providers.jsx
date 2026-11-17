'use client'

import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from '../theme/ThemeProvider'
import { AuthProvider } from '../auth/AuthProvider'

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </AuthProvider>
    </ThemeProvider>
  )
}
