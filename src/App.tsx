import { useState } from 'react'
import { MapPin, Zap, QrCode, User, Battery } from 'lucide-react'
import MapView from './components/MapView'
import StationDetails from './components/StationDetails'
import QRScanner from './components/QRScanner'
import UserProfile from './components/UserProfile'
import './App.css'

type View = 'map' | 'details' | 'scanner' | 'profile'

interface ChargingStation {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  available: number
  total: number
  cost: number
  amenities: string[]
  status: 'available' | 'busy' | 'offline'
}

function App() {
  const [currentView, setCurrentView] = useState<View>('map')
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null)
  const [isCharging, setIsCharging] = useState(false)

  // Mock data for charging stations
  const stations: ChargingStation[] = [
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
      status: 'available'
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
      status: 'busy'
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
      status: 'available'
    }
  ]

  const handleStationSelect = (station: ChargingStation) => {
    setSelectedStation(station)
    setCurrentView('details')
  }

  const handleStartCharging = () => {
    setCurrentView('scanner')
  }

  const handleQRScan = (result: string) => {
    console.log('QR Code scanned:', result)
    setIsCharging(true)
    setCurrentView('map')
  }

  const renderView = () => {
    switch (currentView) {
      case 'map':
        return (
          <MapView 
            stations={stations} 
            onStationSelect={handleStationSelect}
            isCharging={isCharging}
          />
        )
      case 'details':
        return selectedStation ? (
          <StationDetails 
            station={selectedStation} 
            onStartCharging={handleStartCharging}
            onBack={() => setCurrentView('map')}
          />
        ) : null
      case 'scanner':
        return (
          <QRScanner 
            onScan={handleQRScan}
            onBack={() => setCurrentView('details')}
          />
        )
      case 'profile':
        return (
          <UserProfile 
            onBack={() => setCurrentView('map')}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="flex items-center gap-2">
            <Zap className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold">EVolution</h1>
          </div>
          {isCharging && (
            <div className="charging-indicator">
              <Battery className="text-green-500" size={20} />
              <span className="text-sm text-green-600">Charging</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentView === 'map' ? 'active' : ''}`}
          onClick={() => setCurrentView('map')}
        >
          <MapPin size={20} />
          <span>Find</span>
        </button>
        <button 
          className={`nav-item ${currentView === 'scanner' ? 'active' : ''}`}
          onClick={() => setCurrentView('scanner')}
        >
          <QrCode size={20} />
          <span>Scan</span>
        </button>
        <button 
          className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentView('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  )
}

export default App
