import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, Zap } from 'lucide-react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

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

interface MapViewProps {
  stations: ChargingStation[]
  onStationSelect: (station: ChargingStation) => void
  isCharging: boolean
}

export default function MapView({ stations, onStationSelect, isCharging }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null)

  // Set your Mapbox access token from environment variables
  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''

  useEffect(() => {
    // Initialize map
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-80.1918, 25.7617], // Miami coordinates
        zoom: 11
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    }

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          
          // Center map on user location
          if (map.current) {
            map.current.flyTo({
              center: [location.lng, location.lat],
              zoom: 13
            })
          }
        },
        (error) => {
          console.log('Location access denied:', error)
          // Default to Miami area
          setUserLocation({ lat: 25.7617, lng: -80.1918 })
        }
      )
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Add user location marker
  useEffect(() => {
    if (map.current && userLocation) {
      // Remove existing user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
      }

      // Create user location marker
      const userMarker = new mapboxgl.Marker({
        color: '#3B82F6' // Blue color
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<div><strong>Your Location</strong></div>')
        )
        .addTo(map.current)

      userMarkerRef.current = userMarker
    }
  }, [userLocation])

  // Add charging station markers
  useEffect(() => {
    if (map.current && stations.length > 0) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Add station markers
      stations.forEach(station => {
        const markerColor = station.status === 'available' ? '#10B981' : 
                           station.status === 'busy' ? '#F59E0B' : '#EF4444'

        const marker = new mapboxgl.Marker({
          color: markerColor
        })
          .setLngLat([station.lng, station.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="station-popup">
                  <h3><strong>${station.name}</strong></h3>
                  <p>${station.address}</p>
                  <p><strong>Status:</strong> ${station.status}</p>
                  <p><strong>Available:</strong> ${station.available}/${station.total} ports</p>
                  <p><strong>Cost:</strong> $${station.cost}/kWh</p>
                  <button onclick="window.selectStation('${station.id}')" 
                          style="background: #3B82F6; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                    View Details
                  </button>
                </div>
              `)
          )
          .addTo(map.current!)

        markersRef.current.push(marker)
      })
    }
  }, [stations])

  // Global function to handle station selection from popup
  useEffect(() => {
    interface WindowWithSelectStation extends Window {
      selectStation?: (stationId: string) => void
    }
    
    const windowWithSelectStation = window as WindowWithSelectStation
    windowWithSelectStation.selectStation = (stationId: string) => {
      const station = stations.find(s => s.id === stationId)
      if (station) {
        onStationSelect(station)
      }
    }

    return () => {
      delete windowWithSelectStation.selectStation
    }
  }, [stations, onStationSelect])

  const filteredStations = stations.filter(station =>
    station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    station.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handle station card click to center map
  const handleStationCardClick = (station: ChargingStation) => {
    if (map.current) {
      map.current.flyTo({
        center: [station.lng, station.lat],
        zoom: 15
      })
    }
    onStationSelect(station)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600'
      case 'busy': return 'text-orange-500'
      case 'offline': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available'
      case 'busy': return 'Busy'
      case 'offline': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <div className="map-view">
      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search for charging stations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Charging Status Banner */}
      {isCharging && (
        <div className="charging-banner">
          <div className="flex items-center gap-2">
            <Zap className="text-green-500" size={20} />
            <span className="font-medium">Currently charging at Downtown Plaza</span>
          </div>
          <div className="charging-stats">
            <span className="text-sm text-gray-600">45 min remaining • 78% charged</span>
          </div>
        </div>
      )}

      {/* Interactive Mapbox Map */}
      <div className="map-container">
        <div ref={mapContainer} className="mapbox-map" />
        {mapboxgl.accessToken && mapboxgl.accessToken !== 'your_mapbox_access_token_here' && (
          <div className="map-overlay">
            <p className="text-sm text-gray-600">
              {userLocation ? 
                `Your location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` :
                'Getting your location...'
              }
            </p>
          </div>
        )}
        {(!mapboxgl.accessToken || mapboxgl.accessToken === 'your_mapbox_access_token_here') && (
          <div className="map-token-warning">
            <MapPin className="text-orange-500" size={48} />
            <p className="text-orange-600 font-medium">Mapbox Token Required</p>
            <p className="text-sm text-gray-600">
              Please add your Mapbox access token to the .env file
            </p>
            <p className="text-xs text-gray-500">
              Get one free at https://account.mapbox.com/
            </p>
          </div>
        )}
      </div>

      {/* Station List */}
      <div className="station-list">
        <h3 className="list-title">Nearby Charging Stations</h3>
        <div className="station-cards">
          {filteredStations.map((station) => (
            <div
              key={station.id}
              className="station-card"
              onClick={() => handleStationCardClick(station)}
            >
              <div className="station-header">
                <div>
                  <h4 className="station-name">{station.name}</h4>
                  <p className="station-address">{station.address}</p>
                </div>
                <div className="station-status">
                  <span className={`status-badge ${getStatusColor(station.status)}`}>
                    {getStatusText(station.status)}
                  </span>
                </div>
              </div>
              
              <div className="station-info">
                <div className="availability">
                  <span className="font-medium">{station.available}/{station.total}</span>
                  <span className="text-sm text-gray-600">ports available</span>
                </div>
                <div className="cost">
                  <span className="font-medium">${station.cost}/kWh</span>
                </div>
                <button className="directions-btn">
                  <Navigation size={16} />
                  <span>Directions</span>
                </button>
              </div>

              <div className="amenities">
                {station.amenities.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="amenity-tag">{amenity}</span>
                ))}
                {station.amenities.length > 3 && (
                  <span className="amenity-tag">+{station.amenities.length - 3} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
