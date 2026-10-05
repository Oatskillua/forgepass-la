import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WaitlistForm from './WaitlistForm'
import FeedbackForm from './FeedbackForm'

vi.mock('../lib/analytics', () => ({ trackEvent: vi.fn() }))
vi.mock('../lib/turnstile', () => ({ getTurnstileSiteKey: () => 'test-site-key' }))
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }) => <button type="button" onClick={() => onSuccess('test-token')}>Complete security check</button>,
}))
beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
afterEach(() => vi.unstubAllGlobals())

describe.each([
  ['waitlist', WaitlistForm, 'Join Waitlist'],
  ['feedback', FeedbackForm, 'Submit Feedback'],
])('%s form recovery', (kind, Component, submitLabel) => {
  function fill() {
    render(<Component />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Visitor' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'visitor@example.com' } })
    if (kind === 'feedback') fireEvent.change(screen.getByLabelText('Feedback'), { target: { value: 'Keep my feedback' } })
    fireEvent.click(screen.getByText('Complete security check'))
  }
  it('preserves inputs and requires a fresh challenge after a network failure', async () => {
    fetch.mockRejectedValueOnce(new TypeError('Network unavailable'))
    fill()
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Connection interrupted')
    expect(screen.getByLabelText('Email')).toHaveValue('visitor@example.com')
    expect(screen.getByRole('button', { name: submitLabel })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    expect(screen.getByRole('alert')).toHaveTextContent('Complete the security check')
    expect(fetch).toHaveBeenCalledTimes(1)
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) })
    fireEvent.click(screen.getByText('Complete security check'))
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    await screen.findByRole('status')
    expect(screen.getByLabelText('Email')).toHaveValue('')
  })
  it('does not claim success for malformed server responses', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('HTML') } })
    fill()
    fireEvent.click(screen.getByRole('button', { name: submitLabel }))
    expect(await screen.findByRole('alert')).toHaveTextContent('unreadable response')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
  it('blocks repeated submissions while one request is pending', async () => {
    let resolve
    fetch.mockReturnValue(new Promise((done) => { resolve = done }))
    fill()
    const form = screen.getByRole('button', { name: submitLabel }).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(fetch).toHaveBeenCalledTimes(1)
    resolve({ ok: true, json: async () => ({ ok: true }) })
    await waitFor(() => expect(screen.getByRole('button', { name: submitLabel })).toBeEnabled())
  })
})
