import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

// Mock the components
vi.mock('./components/MapView', () => ({
  default: ({ stations, onStationSelect, isCharging }: any) => (
    <div data-testid="map-view">
      <div>MapView Component</div>
      <div>Stations: {stations.length}</div>
      <div>Charging: {isCharging.toString()}</div>
      <button onClick={() => onStationSelect(stations[0])}>Select Station</button>
    </div>
  )
}))

vi.mock('./components/StationDetails', () => ({
  default: ({ station, onStartCharging, onBack }: any) => (
    <div data-testid="station-details">
      <div>Station: {station.name}</div>
      <button onClick={onStartCharging}>Start Charging</button>
      <button onClick={onBack}>Back</button>
    </div>
  )
}))

vi.mock('./components/QRScanner', () => ({
  default: ({ onScan, onBack }: any) => (
    <div data-testid="qr-scanner">
      <div>QR Scanner</div>
      <button onClick={() => onScan('test-qr-code')}>Scan QR</button>
      <button onClick={onBack}>Back</button>
    </div>
  )
}))

vi.mock('./components/UserProfile', () => ({
  default: ({ onBack }: any) => (
    <div data-testid="user-profile">
      <div>User Profile</div>
      <button onClick={onBack}>Back</button>
    </div>
  )
}))

describe('App', () => {
  it('renders the app with header and navigation', () => {
    render(<App />)
    
    expect(screen.getByText('EVolution')).toBeInTheDocument()
    expect(screen.getByText('Find')).toBeInTheDocument()
    expect(screen.getByText('Scan')).toBeInTheDocument()
    expect(screen.getByText('Profile')).toBeInTheDocument()
  })

  it('starts with map view as default', () => {
    render(<App />)
    
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
    expect(screen.getByText('Stations: 3')).toBeInTheDocument()
  })

  it('navigates to scanner view when scan button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await user.click(screen.getByText('Scan'))
    
    expect(screen.getByTestId('qr-scanner')).toBeInTheDocument()
  })

  it('navigates to profile view when profile button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await user.click(screen.getByText('Profile'))
    
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
  })

  it('shows station details when a station is selected', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    await user.click(screen.getByText('Select Station'))
    
    expect(screen.getByTestId('station-details')).toBeInTheDocument()
    expect(screen.getByText('Station: Downtown Plaza')).toBeInTheDocument()
  })

  it('navigates to QR scanner when start charging is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // First select a station
    await user.click(screen.getByText('Select Station'))
    
    // Then start charging
    await user.click(screen.getByText('Start Charging'))
    
    expect(screen.getByTestId('qr-scanner')).toBeInTheDocument()
  })

  it('handles QR scan and shows charging indicator', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Navigate to scanner
    await user.click(screen.getByText('Scan'))
    
    // Scan QR code
    await user.click(screen.getByText('Scan QR'))
    
    // Should return to map and show charging indicator
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
    expect(screen.getByText('Charging: true')).toBeInTheDocument()
    expect(screen.getByText('Charging')).toBeInTheDocument()
  })

  it('navigates back from station details to map', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Select station
    await user.click(screen.getByText('Select Station'))
    expect(screen.getByTestId('station-details')).toBeInTheDocument()
    
    // Go back
    await user.click(screen.getByText('Back'))
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  it('navigates back from QR scanner to station details', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Select station and start charging
    await user.click(screen.getByText('Select Station'))
    await user.click(screen.getByText('Start Charging'))
    expect(screen.getByTestId('qr-scanner')).toBeInTheDocument()
    
    // Go back
    await user.click(screen.getByText('Back'))
    expect(screen.getByTestId('station-details')).toBeInTheDocument()
  })

  it('navigates back from profile to map', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Go to profile
    await user.click(screen.getByText('Profile'))
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    
    // Go back
    await user.click(screen.getByText('Back'))
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  it('shows active navigation state correctly', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const findButton = screen.getByRole('button', { name: /find/i })
    const scanButton = screen.getByRole('button', { name: /scan/i })
    const profileButton = screen.getByRole('button', { name: /profile/i })
    
    // Find should be active by default
    expect(findButton).toHaveClass('active')
    
    // Click scan
    await user.click(scanButton)
    expect(scanButton).toHaveClass('active')
    expect(findButton).not.toHaveClass('active')
    
    // Click profile
    await user.click(profileButton)
    expect(profileButton).toHaveClass('active')
    expect(scanButton).not.toHaveClass('active')
  })

  it('renders with correct station data', () => {
    render(<App />)
    
    // Check that stations are passed correctly
    expect(screen.getByText('Stations: 3')).toBeInTheDocument()
  })

  it('handles station selection with null station gracefully', () => {
    render(<App />)
    
    // The renderView function should handle null selectedStation
    // This is tested by ensuring the app doesn't crash when no station is selected
    expect(screen.getByTestId('map-view')).toBeInTheDocument()
  })

  it('renders charging indicator when charging', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Start charging process
    await user.click(screen.getByText('Scan'))
    await user.click(screen.getByText('Scan QR'))
    
    // Check charging indicator in header
    expect(screen.getByText('Charging')).toBeInTheDocument()
    
    // Check battery icon is present
    const batteryIcon = document.querySelector('.text-green-500')
    expect(batteryIcon).toBeInTheDocument()
  })
})
