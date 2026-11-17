import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from '../../theme/ThemeProvider'
import { ThemeSwitcher } from './ThemeSwitcher'

describe('ThemeSwitcher', () => {
  it('opens from one button and sets mode and palette independently', () => {
    render(
      <ThemeProvider>
        <ThemeSwitcher />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Theme' }))
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Lime' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Orange' }))
    fireEvent.click(screen.getByRole('button', { name: 'Light' }))

    const html = document.documentElement.dataset
    expect(html.palette).toBe('orange')
    expect(html.theme).toBe('light')
    expect(localStorage.getItem('aperture:palette')).toBe('orange')
    expect(localStorage.getItem('aperture:theme')).toBe('light')
  })
})
