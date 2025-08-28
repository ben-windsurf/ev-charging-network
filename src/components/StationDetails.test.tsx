import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StationDetails from './StationDetails'

const mockStation = {
  id: '1',
  name: 'Downtown Plaza',
  address: '123 Main St, Miami, FL',
  lat: 25.7617,
  lng: -80.1918,
  available: 3,
  total: 4,
  cost: 0.35,
  amenities: ['Restaurant', 'WiFi', 'Restroom'],
  status: 'available' as const
}

const mockOnStartCharging = vi.fn()
const mockOnBack = vi.fn()

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn()
})

describe('StationDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders station information correctly', () => {
    render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('123 Main St, Miami, FL')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
  })

  it('displays station metrics correctly', () => {
    render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    expect(screen.getByText('3/4')).toBeInTheDocument()
    expect(screen.getByText('Ports Available')).toBeInTheDocument()
    expect(screen.getByText('$0.35')).toBeInTheDocument()
    expect(screen.getByText('per kWh')).toBeInTheDocument()
    expect(screen.getByText('~45 min')).toBeInTheDocument()
    expect(screen.getByText('Est. charge time')).toBeInTheDocument()
  })

  it('displays amenities with correct icons', () => {
    render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    expect(screen.getByText('Restaurant')).toBeInTheDocument()
    expect(screen.getByText('WiFi')).toBeInTheDocument()
    expect(screen.getByText('Restroom')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)
    
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('calls onStartCharging when start charging button is clicked for available station', async () => {
    const user = userEvent.setup()
    render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    const chargeButton = screen.getByRole('button', { name: /start charging/i })
    await user.click(chargeButton)
    
    expect(mockOnStartCharging).toHaveBeenCalledTimes(1)
  })

  it('disables start charging button for busy station', () => {
    const busyStation = { ...mockStation, status: 'busy' as const }
    render(
      <StationDetails 
        station={busyStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    const chargeButton = screen.getByRole('button', { name: /unavailable/i })
    expect(chargeButton).toBeDisabled()
    expect(screen.getByText('Busy')).toBeInTheDocument()
  })

  it('disables start charging button for offline station', () => {
    const offlineStation = { ...mockStation, status: 'offline' as const }
    render(
      <StationDetails 
        station={offlineStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    const chargeButton = screen.getByRole('button', { name: /unavailable/i })
    expect(chargeButton).toBeDisabled()
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('opens Google Maps when get directions button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    const directionsButton = screen.getByRole('button', { name: /get directions/i })
    await user.click(directionsButton)
    
    expect(window.open).toHaveBeenCalledWith(
      `https://maps.google.com/?q=${mockStation.lat},${mockStation.lng}`,
      '_blank'
    )
  })

  it('displays correct status colors for different station statuses', () => {
    const { rerender } = render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    // Available station
    expect(screen.getByText('Available')).toHaveClass('bg-green-100', 'text-green-800')
    
    // Busy station
    const busyStation = { ...mockStation, status: 'busy' as const }
    rerender(
      <StationDetails 
        station={busyStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    expect(screen.getByText('Busy')).toHaveClass('bg-orange-100', 'text-orange-800')
    
    // Offline station
    const offlineStation = { ...mockStation, status: 'offline' as const }
    rerender(
      <StationDetails 
        station={offlineStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    expect(screen.getByText('Offline')).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('displays additional station information', () => {
    render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    expect(screen.getByText('EVolution')).toBeInTheDocument()
    expect(screen.getByText('CCS, CHAdeMO, Type 2')).toBeInTheDocument()
    expect(screen.getByText('150 kW')).toBeInTheDocument()
    expect(screen.getByText('24/7')).toBeInTheDocument()
  })

  it('renders amenity icons correctly for different amenity types', () => {
    const stationWithVariousAmenities = {
      ...mockStation,
      amenities: ['WiFi', 'Restaurant', 'Food Court', 'Restroom', 'Valet', 'Parking', 'Unknown']
    }
    
    render(
      <StationDetails 
        station={stationWithVariousAmenities}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    // All amenities should be displayed
    expect(screen.getByText('WiFi')).toBeInTheDocument()
    expect(screen.getByText('Restaurant')).toBeInTheDocument()
    expect(screen.getByText('Food Court')).toBeInTheDocument()
    expect(screen.getByText('Restroom')).toBeInTheDocument()
    expect(screen.getByText('Valet')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('Unknown')).toBeInTheDocument()
  })

  it('handles station with no amenities', () => {
    const stationWithNoAmenities = { ...mockStation, amenities: [] }
    render(
      <StationDetails 
        station={stationWithNoAmenities}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    expect(screen.getByText('Amenities')).toBeInTheDocument()
    // Should not crash with empty amenities array
  })

  it('capitalizes status text correctly', () => {
    const { rerender } = render(
      <StationDetails 
        station={mockStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    
    expect(screen.getByText('Available')).toBeInTheDocument()
    
    const busyStation = { ...mockStation, status: 'busy' as const }
    rerender(
      <StationDetails 
        station={busyStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    expect(screen.getByText('Busy')).toBeInTheDocument()
    
    const offlineStation = { ...mockStation, status: 'offline' as const }
    rerender(
      <StationDetails 
        station={offlineStation}
        onStartCharging={mockOnStartCharging}
        onBack={mockOnBack}
      />
    )
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })
})
