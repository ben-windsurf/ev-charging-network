import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapView from '../MapView'

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    accessToken: '',
    Map: vi.fn(() => ({
      addControl: vi.fn(),
      flyTo: vi.fn(),
      remove: vi.fn(),
    })),
    NavigationControl: vi.fn(),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    })),
    Popup: vi.fn(() => ({
      setHTML: vi.fn().mockReturnThis(),
    })),
  },
}))

// Mock CSS imports
vi.mock('mapbox-gl/dist/mapbox-gl.css', () => ({}))

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_MAPBOX_ACCESS_TOKEN: 'test-token',
  },
}))

// Mock geolocation
Object.defineProperty(globalThis, 'navigator', {
  value: {
    geolocation: {
      getCurrentPosition: vi.fn(),
    },
  },
  writable: true,
})

// Mock data for testing
const mockStations = [
  {
    id: '1',
    name: 'Downtown Plaza',
    address: '123 Main St',
    lat: 25.7617,
    lng: -80.1918,
    available: 3,
    total: 4,
    cost: 0.25,
    amenities: ['WiFi', 'Restaurant', 'Shopping'],
    status: 'available' as const,
  },
  {
    id: '2',
    name: 'Airport Station',
    address: '456 Airport Rd',
    lat: 25.7900,
    lng: -80.2900,
    available: 0,
    total: 6,
    cost: 0.30,
    amenities: ['WiFi', 'Parking'],
    status: 'busy' as const,
  },
  {
    id: '3',
    name: 'Mall Charging Hub',
    address: '789 Shopping Blvd',
    lat: 25.7500,
    lng: -80.1500,
    available: 0,
    total: 8,
    cost: 0.28,
    amenities: ['Food Court', 'Shopping', 'Restrooms', 'ATM'],
    status: 'offline' as const,
  },
]

const mockProps = {
  stations: mockStations,
  onStationSelect: vi.fn(),
  isCharging: false,
}

describe('MapView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component with all main sections', () => {
    render(<MapView {...mockProps} />)
    
    // Check for main sections
    expect(screen.getByPlaceholderText('Search for charging stations...')).toBeInTheDocument()
    expect(screen.getByText('Nearby Charging Stations')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    
    // Check that station cards are rendered
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('Airport Station')).toBeInTheDocument()
    expect(screen.getByText('Mall Charging Hub')).toBeInTheDocument()
  })

  it('displays charging banner when isCharging is true', () => {
    render(<MapView {...mockProps} isCharging={true} />)
    
    expect(screen.getByText('Currently charging at Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('45 min remaining • 78% charged')).toBeInTheDocument()
  })

  it('does not display charging banner when isCharging is false', () => {
    render(<MapView {...mockProps} isCharging={false} />)
    
    expect(screen.queryByText('Currently charging at Downtown Plaza')).not.toBeInTheDocument()
    expect(screen.queryByText('45 min remaining • 78% charged')).not.toBeInTheDocument()
  })

  it('filters stations based on search query', async () => {
    const user = userEvent.setup()
    render(<MapView {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search for charging stations...')
    
    // Initially all stations should be visible
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('Airport Station')).toBeInTheDocument()
    expect(screen.getByText('Mall Charging Hub')).toBeInTheDocument()
    
    // Search for "Downtown"
    await user.type(searchInput, 'Downtown')
    
    // Only Downtown Plaza should be visible
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('Airport Station')).toBeInTheDocument()
    expect(screen.queryByText('Mall Charging Hub')).not.toBeInTheDocument()
  })

  it('filters stations based on address in search query', async () => {
    const user = userEvent.setup()
    render(<MapView {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search for charging stations...')
    
    // Search for "Airport Rd"
    await user.type(searchInput, 'Airport Rd')
    
    // Only Airport Station should be visible
    expect(screen.queryByText('Downtown Plaza')).not.toBeInTheDocument()
    expect(screen.getByText('Airport Station')).toBeInTheDocument()
    expect(screen.queryByText('Mall Charging Hub')).not.toBeInTheDocument()
  })

  it('calls onStationSelect when station card is clicked', async () => {
    const user = userEvent.setup()
    render(<MapView {...mockProps} />)
    
    const stationCard = screen.getByText('Downtown Plaza').closest('.station-card')
    expect(stationCard).toBeInTheDocument()
    
    await user.click(stationCard!)
    
    expect(mockProps.onStationSelect).toHaveBeenCalledWith(mockStations[0])
    expect(mockProps.onStationSelect).toHaveBeenCalledTimes(1)
  })

  it('displays correct status colors and text for different station statuses', () => {
    render(<MapView {...mockProps} />)
    
    // Check available station (green)
    const availableStatus = screen.getByText('Available')
    expect(availableStatus).toHaveClass('text-green-600')
    
    // Check busy station (orange)
    const busyStatus = screen.getByText('Busy')
    expect(busyStatus).toHaveClass('text-orange-500')
    
    // Check offline station (red)
    const offlineStatus = screen.getByText('Offline')
    expect(offlineStatus).toHaveClass('text-red-500')
  })

  it('displays station information correctly including availability and amenities', () => {
    render(<MapView {...mockProps} />)
    
    // Check Downtown Plaza details
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
    expect(screen.getByText('3/4')).toBeInTheDocument()
    expect(screen.getAllByText('ports available')).toHaveLength(3) // All stations have this text
    expect(screen.getByText('$0.25/kWh')).toBeInTheDocument()
    
    // Check specific amenities that are unique to stations
    expect(screen.getByText('Restaurant')).toBeInTheDocument() // Only Downtown Plaza
    expect(screen.getByText('Food Court')).toBeInTheDocument() // Only Mall Charging Hub
    expect(screen.getByText('Parking')).toBeInTheDocument() // Only Airport Station
    
    // Check Mall Charging Hub with more than 3 amenities
    const moreAmenitiesText = screen.getByText('+1 more')
    expect(moreAmenitiesText).toBeInTheDocument()
  })
})
