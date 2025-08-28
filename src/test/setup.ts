import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Mapbox GL
Object.defineProperty(window, 'mapboxgl', {
  value: {
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
})

// Mock navigator.geolocation
Object.defineProperty(globalThis.navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn((success: (position: any) => void) => 
      success({
        coords: {
          latitude: 25.7617,
          longitude: -80.1918,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: Date.now()
      })
    )
  }
})

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_MAPBOX_ACCESS_TOKEN: 'test-token'
  }
})

// Mock window.open
Object.defineProperty(window, 'open', {
  value: vi.fn()
})
