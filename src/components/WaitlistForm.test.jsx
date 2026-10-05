import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import WaitlistForm from './WaitlistForm'

vi.mock('../lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

vi.mock('../lib/turnstile', () => ({
  getTurnstileSiteKey: () => '',
}))

describe('WaitlistForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects an invalid email before making a request', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    render(<WaitlistForm />)

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'invalid-email' },
    })
    fireEvent.submit(screen.getByRole('button', { name: 'Join Waitlist' }).closest('form'))

    expect(await screen.findByText('Enter a valid email address.')).toBeVisible()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('submits normalized data and displays success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    })
    vi.stubGlobal('fetch', fetchMock)
    render(<WaitlistForm />)

    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: '  Visitor  ' },
    })
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: ' USER@Example.com ' },
    })
    fireEvent.change(screen.getByPlaceholderText('City'), {
      target: { value: ' Los Angeles ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Join Waitlist' }))

    expect(await screen.findByText("You're In")).toBeVisible()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const [, request] = fetchMock.mock.calls[0]
    expect(JSON.parse(request.body)).toMatchObject({
      name: 'Visitor',
      email: 'user@example.com',
      city: 'Los Angeles',
      interest: 'Events',
    })
  })
})
