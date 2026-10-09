import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, expect, it, vi } from 'vitest'

import MapPage from './Map'

const mocks = vi.hoisted(() => ({
  user: null,
  getSavedContent: vi.fn(),
}))

vi.mock('../components/PageShell', () => ({
  default: ({ children }) => <main>{children}</main>,
}))

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({ user: mocks.user }),
}))

vi.mock('../lib/userData', () => ({
  getSavedContent: mocks.getSavedContent,
}))

beforeEach(() => {
  mocks.user = null
  mocks.getSavedContent.mockReset()
})

function renderMap() {
  return render(
    <MemoryRouter>
      <MapPage />
    </MemoryRouter>,
  )
}

it('caps optional stops and lets the user replace one without losing order', () => {
  renderMap()

  fireEvent.change(screen.getByLabelText('Destination'), {
    target: { value: 'LA' },
  })

  for (const stop of ['Museum', 'Lunch', 'Park']) {
    fireEvent.change(screen.getByLabelText('Optional stop'), {
      target: { value: stop },
    })

    fireEvent.click(
      screen.getByRole('button', { name: 'Add stop' }),
    )
  }

  expect(
    screen.getByRole('button', { name: 'Add stop' }),
  ).toBeDisabled()

  expect(
    screen.getByRole('status'),
  ).toHaveTextContent('Stop limit reached')

  fireEvent.click(
    screen.getByRole('button', { name: 'Remove Lunch' }),
  )

  fireEvent.change(screen.getByLabelText('Optional stop'), {
    target: { value: 'Dinner' },
  })

  fireEvent.click(
    screen.getByRole('button', { name: 'Add stop' }),
  )

  const url = new URL(
    screen.getByRole('link', { name: 'Launch directions' }).href,
  )

  expect(
    url.searchParams.get('waypoints'),
  ).toBe('Museum|Park|Dinner')
})

it('shows oversized route errors without crashing and recovers after correction', () => {
  renderMap()

  fireEvent.change(screen.getByLabelText('Destination'), {
    target: { value: '博'.repeat(250) },
  })

  expect(
    screen.getByRole('alert'),
  ).toHaveTextContent('too long')

  expect(
    screen.getByText('Launch directions'),
  ).not.toHaveAttribute('href')

  fireEvent.change(screen.getByLabelText('Destination'), {
    target: { value: 'LAX' },
  })

  expect(
    screen.queryByRole('alert'),
  ).not.toBeInTheDocument()

  expect(
    screen.getByRole('link', { name: 'Launch directions' }),
  ).toHaveAttribute('href')
})

it('opens rideshare handoff in a separate tab', () => {
  renderMap()

  fireEvent.change(screen.getByLabelText('Destination'), {
    target: { value: '312 W 120th St' },
  })

  const rideshare = screen.getByRole('link', {
    name: 'Rideshare handoff',
  })

  expect(rideshare).toHaveAttribute(
    'target',
    '_blank',
  )

  expect(rideshare).toHaveAttribute(
    'rel',
    'noreferrer',
  )

  expect(rideshare).toHaveAttribute(
    'href',
    expect.stringContaining(
      'dropoff%5Bformatted_address%5D=312+W+120th+St',
    ),
  )
})

it('loads saved content and uses it in the route builder', async () => {
  mocks.user = { id: 'user-1' }

  mocks.getSavedContent.mockResolvedValue({
    favorites: [
      {
        id: 'place-1',
        place_name: 'Santa Monica',
        place_snapshot: {
          title: 'Santa Monica',
        },
      },
    ],
    events: [
      {
        id: 'event-1',
        event_name: 'ROXETTE',
        event_snapshot: {
          venue: 'Greek Theatre',
          city: 'Los Angeles',
        },
      },
    ],
  })

  renderMap()

  const savedSelect = await screen.findByLabelText(
    'Saved place or event',
  )

  fireEvent.change(savedSelect, {
    target: { value: 'event:event-1' },
  })

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Use as destination',
    }),
  )

  expect(
    screen.getByLabelText('Destination'),
  ).toHaveValue(
    'Greek Theatre, Los Angeles',
  )

  fireEvent.change(savedSelect, {
    target: { value: 'place:place-1' },
  })

  fireEvent.click(
    screen.getByRole('button', {
      name: 'Add saved stop',
    }),
  )

  const directions = new URL(
    screen.getByRole('link', {
      name: 'Launch directions',
    }).href,
  )

  expect(
    directions.searchParams.get('destination'),
  ).toBe(
    'Greek Theatre, Los Angeles',
  )

  expect(
    directions.searchParams.get('waypoints'),
  ).toBe('Santa Monica')
})