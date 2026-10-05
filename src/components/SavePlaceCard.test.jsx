import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'
import SavePlaceCard from './SavePlaceCard'

const api = vi.hoisted(() => ({ savePlace: vi.fn() }))
vi.mock('../lib/userData', () => api)
vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }))
const item = { id: 'museum', title: 'Museum', description: 'A place to visit', category: 'Culture' }
function card(userId) { return <MemoryRouter><SavePlaceCard item={item} userId={userId} /></MemoryRouter> }
beforeEach(() => { vi.resetAllMocks() })

it('keeps the place visible after failure and confirms a successful retry', async () => {
  api.savePlace.mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce(undefined)
  render(card('u1'))
  fireEvent.click(screen.getByText('Save place'))
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to confirm')
  expect(screen.getByRole('heading', { name: 'Museum' })).toBeInTheDocument()
  fireEvent.click(screen.getByText('Save place'))
  expect(await screen.findByText('Saved')).toBeDisabled()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  expect(api.savePlace).toHaveBeenLastCalledWith('u1', item)
})

it('blocks duplicate requests and discards old-account save completions', async () => {
  let finish
  api.savePlace.mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))
  const view = render(card('u1'))
  fireEvent.click(screen.getByText('Save place'))
  fireEvent.click(screen.getByText('Saving…'))
  expect(api.savePlace).toHaveBeenCalledTimes(1)
  view.rerender(card('u2'))
  await act(async () => { finish() })
  expect(screen.getByText('Save place')).toBeEnabled()
  expect(screen.queryByText('Saved')).not.toBeInTheDocument()
})

it('requires sign-in and clears saved state on sign-out', async () => {
  api.savePlace.mockResolvedValue(undefined)
  const view = render(card('u1'))
  fireEvent.click(screen.getByText('Save place'))
  await screen.findByText('Saved')
  view.rerender(card(null))
  expect(screen.getByRole('link', { name: 'Sign in to save' })).toHaveAttribute('href', '/auth')
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
  view.rerender(card('u2'))
  expect(screen.getByText('Save place')).toBeEnabled()
})
