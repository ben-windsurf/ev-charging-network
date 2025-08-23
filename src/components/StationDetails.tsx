import { ArrowLeft, Navigation, Zap, Clock, DollarSign, MapPin, Wifi, Car, Coffee } from 'lucide-react'

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

interface StationDetailsProps {
  station: ChargingStation
  onStartCharging: () => void
  onBack: () => void
}

export default function StationDetails({ station, onStartCharging, onBack }: StationDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'busy': return 'bg-orange-100 text-orange-800'
      case 'offline': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi size={16} />
      case 'restaurant': case 'food court': return <Coffee size={16} />
      case 'restroom': return <MapPin size={16} />
      case 'valet': case 'parking': return <Car size={16} />
      default: return <MapPin size={16} />
    }
  }

  const handleGetDirections = () => {
    const url = `https://maps.google.com/?q=${station.lat},${station.lng}`
    window.open(url, '_blank')
  }

  return (
    <div className="station-details">
      {/* Header */}
      <div className="details-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h2 className="details-title">Station Details</h2>
      </div>

      {/* Station Info Card */}
      <div className="details-card">
        <div className="station-main-info">
          <div className="station-title-section">
            <h1 className="station-title">{station.name}</h1>
            <span className={`status-pill ${getStatusColor(station.status)}`}>
              {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
            </span>
          </div>
          <p className="station-location">{station.address}</p>
        </div>

        {/* Availability and Cost */}
        <div className="station-metrics">
          <div className="metric-card">
            <div className="metric-icon">
              <Zap className="text-blue-600" size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-value">{station.available}/{station.total}</span>
              <span className="metric-label">Ports Available</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-value">${station.cost}</span>
              <span className="metric-label">per kWh</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <Clock className="text-orange-500" size={24} />
            </div>
            <div className="metric-info">
              <span className="metric-value">~45 min</span>
              <span className="metric-label">Est. charge time</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="amenities-section">
          <h3 className="amenities-title">Amenities</h3>
          <div className="amenities-grid">
            {station.amenities.map((amenity, index) => (
              <div key={index} className="amenity-item">
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            onClick={handleGetDirections}
            className="btn-secondary directions-button"
          >
            <Navigation size={20} />
            Get Directions
          </button>
          
          <button 
            onClick={onStartCharging}
            className="btn-primary charge-button"
            disabled={station.status !== 'available'}
          >
            <Zap size={20} />
            {station.status === 'available' ? 'Start Charging' : 'Unavailable'}
          </button>
        </div>

        {/* Additional Info */}
        <div className="additional-info">
          <div className="info-item">
            <span className="info-label">Network:</span>
            <span className="info-value">EVolution</span>
          </div>
          <div className="info-item">
            <span className="info-label">Connector Type:</span>
            <span className="info-value">CCS, CHAdeMO, Type 2</span>
          </div>
          <div className="info-item">
            <span className="info-label">Max Power:</span>
            <span className="info-value">150 kW</span>
          </div>
          <div className="info-item">
            <span className="info-label">Hours:</span>
            <span className="info-value">24/7</span>
          </div>
        </div>
      </div>
    </div>
  )
}
