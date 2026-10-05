import { fireEvent, render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import MapPage from './Map'
vi.mock('../components/PageShell', () => ({ default: ({ children }) => <main>{children}</main> }))

it('caps optional stops and lets the user replace one without losing order', () => {
  render(<MapPage />)
  fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'LA' } })
  for (const stop of ['Museum', 'Lunch', 'Park']) {
    fireEvent.change(screen.getByLabelText('Optional stop'), { target: { value: stop } })
    fireEvent.click(screen.getByRole('button', { name: 'Add stop' }))
  }
  expect(screen.getByRole('button', { name: 'Add stop' })).toBeDisabled()
  expect(screen.getByRole('status')).toHaveTextContent('Stop limit reached')
  fireEvent.click(screen.getByRole('button', { name: 'Remove Lunch' }))
  fireEvent.change(screen.getByLabelText('Optional stop'), { target: { value: 'Dinner' } })
  fireEvent.click(screen.getByRole('button', { name: 'Add stop' }))
  const url = new URL(screen.getByRole('link', { name: 'Launch directions' }).href)
  expect(url.searchParams.get('waypoints')).toBe('Museum|Park|Dinner')
})

it('shows oversized route errors without crashing and recovers after correction', () => {
  render(<MapPage />)
  fireEvent.change(screen.getByLabelText('Destination'), { target: { value: '博'.repeat(250) } })
  expect(screen.getByRole('alert')).toHaveTextContent('too long')
  expect(screen.getByText('Launch directions')).not.toHaveAttribute('href')
  fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'LAX' } })
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Launch directions' })).toHaveAttribute('href')
})
