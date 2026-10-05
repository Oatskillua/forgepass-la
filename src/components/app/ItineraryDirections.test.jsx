import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ItineraryDirections from './ItineraryDirections'

describe('itinerary directions', () => {
  it('uses event venues and lets travelers correct destinations without modifying saved stops', () => {
    const stops = [{ id: 'a', title: 'Concert', item_type: 'event', location_snapshot: { venue: 'Hollywood Bowl', city: 'Los Angeles' } }]
    render(<ItineraryDirections stops={stops} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Plan trip directions'))
    expect(screen.getByLabelText('Destination 1: Concert')).toHaveValue('Hollywood Bowl, Los Angeles')
    fireEvent.change(screen.getByLabelText('Destination 1: Concert'), { target: { value: '2301 N Highland Ave, Los Angeles' } })
    fireEvent.change(screen.getByLabelText('Trip travel mode'), { target: { value: 'walking' } })
    const url = new URL(screen.getByRole('link').href)
    expect(url.searchParams.get('destination')).toBe('2301 N Highland Ave, Los Angeles')
    expect(url.searchParams.get('travelmode')).toBe('walking')
    expect(url.searchParams.has('origin')).toBe(false)
    expect(stops[0].location_snapshot.venue).toBe('Hollywood Bowl')
  })

  it('includes every stop in order across routes and connects consecutive routes', () => {
    render(<ItineraryDirections stops={Array.from({ length: 9 }, (_, index) => ({ id: String(index), title: `Place ${index + 1}` }))} />)
    fireEvent.click(screen.getByText('Plan trip directions'))
    fireEvent.change(screen.getByLabelText('Route starting point'), { target: { value: 'My hotel' } })
    const urls = screen.getAllByRole('link').map((link) => new URL(link.href).searchParams)
    expect(urls).toHaveLength(3)
    expect(urls[0].get('origin')).toBe('My hotel')
    expect(urls[0].get('waypoints')).toBe('Place 1|Place 2|Place 3')
    expect(urls[0].get('destination')).toBe('Place 4')
    expect(urls[1].get('origin')).toBe('Place 4')
    expect(urls[1].get('waypoints')).toBe('Place 5|Place 6|Place 7')
    expect(urls[1].get('destination')).toBe('Place 8')
    expect(urls[2].get('origin')).toBe('Place 8')
    expect(urls[2].get('destination')).toBe('Place 9')
    expect(urls[2].has('waypoints')).toBe(false)
  })

  it('withholds all routes when a destination is missing or too long and recovers after correction', () => {
    render(<ItineraryDirections stops={[{ id: 'a', title: 'Museum' }]} />)
    fireEvent.click(screen.getByText('Plan trip directions'))
    const input = screen.getByLabelText('Destination 1: Museum')
    fireEvent.change(input, { target: { value: ' ' } })
    expect(screen.getByRole('alert')).toHaveTextContent('every stop')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    fireEvent.change(input, { target: { value: '博'.repeat(250) } })
    expect(screen.getByRole('alert')).toHaveTextContent('too long')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'The Getty, Los Angeles' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining('google.com/maps/dir/'))
  })
})
