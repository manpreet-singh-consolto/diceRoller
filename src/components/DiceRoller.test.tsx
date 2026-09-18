import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { DiceRoller } from './DiceRoller'

describe('DiceRoller', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders an initial value between 1 and 6', () => {
    render(<DiceRoller />)
    const value = Number(screen.getByTestId('die-face').textContent)
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(6)
  })

  it('shows 6 when Math.random is just under 1 and Roll is clicked', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    render(<DiceRoller />)
    fireEvent.click(screen.getByRole('button', { name: /roll/i }))
    expect(screen.getByTestId('die-face').textContent).toBe('6')
  })

  it('shows 1 when Math.random is 0 and Roll is clicked', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    render(<DiceRoller />)
    fireEvent.click(screen.getByRole('button', { name: /roll/i }))
    expect(screen.getByTestId('die-face').textContent).toBe('1')
  })
})
