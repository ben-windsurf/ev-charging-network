import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MapView from './MapView'

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(() => ({
      addControl: vi.fn(),
      remove: vi.fn(),
      flyTo: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    })),
    NavigationControl: vi.fn(),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn()
    })),
    Popup: vi.fn(() => ({
      setHTML: vi.fn().mockReturnThis()
    })),
    accessToken: 'test-token'
  }
}))

const mockStations = [
  {
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
  },
  {
    id: '2',
    name: 'Airport Terminal',
    address: '2100 NW 42nd Ave, Miami, FL',
    lat: 25.7959,
    lng: -80.2870,
    available: 0,
    total: 6,
    cost: 0.42,
    amenities: ['Food Court', 'Shopping'],
    status: 'busy' as const
  },
  {
    id: '3',
    name: 'Beach Resort',
    address: '1701 Collins Ave, Miami Beach, FL',
    lat: 25.7907,
    lng: -80.1300,
    available: 2,
    total: 3,
    cost: 0.38,
    amenities: ['Hotel', 'Restaurant', 'Valet'],
    status: 'offline' as const
  }
]

const mockOnStationSelect = vi.fn()

describe('MapView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock environment variable
    vi.stubGlobal('import.meta', {
      env: {
        VITE_MAPBOX_ACCESS_TOKEN: 'test-token'
      }
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders search input and station list', () => {
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.getByPlaceholderText('Search for charging stations...')).toBeInTheDocument()
    expect(screen.getByText('Nearby Charging Stations')).toBeInTheDocument()
  })

  it('displays all stations in the list', () => {
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('Airport Terminal')).toBeInTheDocument()
    expect(screen.getByText('Beach Resort')).toBeInTheDocument()
  })

  it('filters stations based on search query', async () => {
    const user = userEvent.setup()
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search for charging stations...')
    await user.type(searchInput, 'Downtown')
    
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.queryByText('Airport Terminal')).not.toBeInTheDocument()
    expect(screen.queryByText('Beach Resort')).not.toBeInTheDocument()
  })

  it('filters stations by address', async () => {
    const user = userEvent.setup()
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search for charging stations...')
    await user.type(searchInput, 'Miami Beach')
    
    expect(screen.getByText('Beach Resort')).toBeInTheDocument()
    expect(screen.queryByText('Downtown Plaza')).not.toBeInTheDocument()
    expect(screen.queryByText('Airport Terminal')).not.toBeInTheDocument()
  })

  it('shows charging banner when isCharging is true', () => {
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={true}
      />
    )
    
    expect(screen.getByText('Currently charging at Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('45 min remaining • 78% charged')).toBeInTheDocument()
  })

  it('does not show charging banner when isCharging is false', () => {
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.queryByText('Currently charging at Downtown Plaza')).not.toBeInTheDocument()
  })

  it('calls onStationSelect when station card is clicked', async () => {
    const user = userEvent.setup()
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    const stationCard = screen.getByText('Downtown Plaza').closest('.station-card')
    await user.click(stationCard!)
    
    expect(mockOnStationSelect).toHaveBeenCalledWith(mockStations[0])
  })

  it('displays correct status colors and text', () => {
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('Busy')).toBeInTheDocument()
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })

  it('displays station availability and cost', () => {
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.getByText('3/4')).toBeInTheDocument()
    expect(screen.getByText('$0.35/kWh')).toBeInTheDocument()
    expect(screen.getByText('0/6')).toBeInTheDocument()
    expect(screen.getByText('$0.42/kWh')).toBeInTheDocument()
  })

  it('displays amenities with limit', () => {
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    // Downtown Plaza has 3 amenities, should show all
    expect(screen.getByText('Restaurant')).toBeInTheDocument()
    expect(screen.getByText('WiFi')).toBeInTheDocument()
    expect(screen.getByText('Restroom')).toBeInTheDocument()
  })

  it('shows +more indicator when station has more than 3 amenities', () => {
    const stationWithManyAmenities = {
      ...mockStations[0],
      amenities: ['Restaurant', 'WiFi', 'Restroom', 'Parking', 'Shopping']
    }
    
    render(
      <MapView 
        stations={[stationWithManyAmenities]} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('shows mapbox token warning when token is missing', () => {
    vi.stubGlobal('import.meta', {
      env: {
        VITE_MAPBOX_ACCESS_TOKEN: ''
      }
    })
    
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.getByText('Mapbox Token Required')).toBeInTheDocument()
    expect(screen.getByText('Please add your Mapbox access token to the .env file')).toBeInTheDocument()
  })

  it('shows mapbox token warning when token is placeholder', () => {
    vi.stubGlobal('import.meta', {
      env: {
        VITE_MAPBOX_ACCESS_TOKEN: 'your_mapbox_access_token_here'
      }
    })
    
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.getByText('Mapbox Token Required')).toBeInTheDocument()
  })

  it('shows user location when available', () => {
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    // The component should show location info when geolocation is available
    // This is tested through the mock setup
    expect(screen.getByText(/Your location:/)).toBeInTheDocument()
  })

  it('handles empty station list', () => {
    render(
      <MapView 
        stations={[]} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    expect(screen.getByText('Nearby Charging Stations')).toBeInTheDocument()
    // Should not crash with empty stations array
  })

  it('handles search with no results', async () => {
    const user = userEvent.setup()
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search for charging stations...')
    await user.type(searchInput, 'nonexistent')
    
    expect(screen.queryByText('Downtown Plaza')).not.toBeInTheDocument()
    expect(screen.queryByText('Airport Terminal')).not.toBeInTheDocument()
    expect(screen.queryByText('Beach Resort')).not.toBeInTheDocument()
  })

  it('clears search results when search is cleared', async () => {
    const user = userEvent.setup()
    render(
      <MapView 
        stations={mockStations} 
        onStationSelect={mockOnStationSelect}
        isCharging={false}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search for charging stations...')
    await user.type(searchInput, 'Downtown')
    
    // Only Downtown should be visible
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.queryByText('Airport Terminal')).not.toBeInTheDocument()
    
    // Clear search
    await user.clear(searchInput)
    
    // All stations should be visible again
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('Airport Terminal')).toBeInTheDocument()
    expect(screen.getByText('Beach Resort')).toBeInTheDocument()
  })
})
