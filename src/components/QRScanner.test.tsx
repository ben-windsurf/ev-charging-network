import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import QRScanner from './QRScanner'

// Mock react-webcam
vi.mock('react-webcam', () => ({
  default: vi.fn(({ onUserMediaError, ...props }) => (
    <div data-testid="webcam" {...props}>
      <button onClick={() => onUserMediaError && onUserMediaError(new Error('Camera error'))}>
        Trigger Camera Error
      </button>
    </div>
  ))
}))

// Mock jsQR
vi.mock('jsqr', () => ({
  default: vi.fn()
}))

const mockOnScan = vi.fn()
const mockOnBack = vi.fn()

describe('QRScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders scanner interface correctly', () => {
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    expect(screen.getByText('Scan QR Code')).toBeInTheDocument()
    expect(screen.getByText('Connect to Charger')).toBeInTheDocument()
    expect(screen.getByText('Point your camera at the QR code on the charging station to connect and start charging.')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)
    
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('shows camera placeholder initially', () => {
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    expect(screen.getByText('Camera preview will appear here')).toBeInTheDocument()
    expect(screen.getByText('Start Scanning')).toBeInTheDocument()
  })

  it('starts scanning when start scanning button is clicked', async () => {
    const user = userEvent.setup()
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    const startButton = screen.getByText('Start Scanning')
    await user.click(startButton)
    
    expect(screen.getByTestId('webcam')).toBeInTheDocument()
    expect(screen.getByText('Scanning for QR code...')).toBeInTheDocument()
    expect(screen.getByText('Stop Scanning')).toBeInTheDocument()
  })

  it('stops scanning when stop scanning button is clicked', async () => {
    const user = userEvent.setup()
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    // Start scanning
    await user.click(screen.getByText('Start Scanning'))
    expect(screen.getByText('Stop Scanning')).toBeInTheDocument()
    
    // Stop scanning
    await user.click(screen.getByText('Stop Scanning'))
    expect(screen.getByText('Start Scanning')).toBeInTheDocument()
    expect(screen.getByText('Camera preview will appear here')).toBeInTheDocument()
  })

  it('handles manual entry', async () => {
    const user = userEvent.setup()
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    const manualButton = screen.getByText('Enter Code Manually')
    await user.click(manualButton)
    
    expect(mockOnScan).toHaveBeenCalledWith('EV-STATION-001-PORT-A')
  })

  it('handles camera error', async () => {
    const user = userEvent.setup()
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    // Start scanning to show webcam
    await user.click(screen.getByText('Start Scanning'))
    
    // Trigger camera error
    const errorButton = screen.getByText('Trigger Camera Error')
    await user.click(errorButton)
    
    expect(screen.getByText('Camera access denied. Please enable camera permissions.')).toBeInTheDocument()
    expect(screen.getByText('Start Scanning')).toBeInTheDocument() // Should go back to initial state
  })

  it('displays help text', () => {
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    expect(screen.getByText('Having trouble?')).toBeInTheDocument()
    expect(screen.getByText('Make sure the QR code is well-lit and clearly visible')).toBeInTheDocument()
    expect(screen.getByText('Hold your phone steady about 6 inches from the code')).toBeInTheDocument()
    expect(screen.getByText('Ensure camera permissions are enabled')).toBeInTheDocument()
    expect(screen.getByText('Try entering the station code manually if scanning fails')).toBeInTheDocument()
  })

  it('shows scan overlay when scanning', async () => {
    const user = userEvent.setup()
    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    await user.click(screen.getByText('Start Scanning'))
    
    expect(document.querySelector('.scan-overlay')).toBeInTheDocument()
    expect(document.querySelector('.scan-frame')).toBeInTheDocument()
    expect(document.querySelector('.scanning-indicator')).toBeInTheDocument()
  })

  it('processes QR code when found', async () => {
    const user = userEvent.setup()
    const jsQR = await import('jsqr')
    
    // Mock jsQR to return a QR code result
    vi.mocked(jsQR.default).mockReturnValue({
      data: 'test-qr-code-data',
      location: {
        topLeftCorner: { x: 0, y: 0 },
        topRightCorner: { x: 100, y: 0 },
        bottomLeftCorner: { x: 0, y: 100 },
        bottomRightCorner: { x: 100, y: 100 },
        topRightFinderPattern: { x: 90, y: 10 },
        topLeftFinderPattern: { x: 10, y: 10 },
        bottomLeftFinderPattern: { x: 10, y: 90 }
      },
      binaryData: [],
      chunks: [],
      version: 1
    })

    // Mock webcam getScreenshot
    const mockWebcam = {
      getScreenshot: vi.fn(() => 'data:image/jpeg;base64,test')
    }

    // Mock useRef to return our mock webcam
    const originalUseRef = React.useRef
    vi.spyOn(React, 'useRef').mockImplementation((initial) => {
      if (initial === null) {
        return { current: mockWebcam }
      }
      return originalUseRef(initial)
    })

    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    await user.click(screen.getByText('Start Scanning'))
    
    // Fast forward the interval
    vi.advanceTimersByTime(300)
    
    await waitFor(() => {
      expect(mockOnScan).toHaveBeenCalledWith('test-qr-code-data')
    })
  })

  it('clears interval when component unmounts', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')
    const { unmount } = render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    unmount()
    
    // The cleanup should be called, but we can't easily test the specific interval
    // The important thing is that the component unmounts without errors
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it('handles webcam screenshot failure gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock webcam that returns null screenshot
    const mockWebcam = {
      getScreenshot: vi.fn(() => null)
    }

    vi.spyOn(React, 'useRef').mockImplementation((initial) => {
      if (initial === null) {
        return { current: mockWebcam }
      }
      return { current: initial }
    })

    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    await user.click(screen.getByText('Start Scanning'))
    
    // Fast forward the interval - should not crash
    vi.advanceTimersByTime(300)
    
    // Should still be scanning
    expect(screen.getByText('Scanning for QR code...')).toBeInTheDocument()
  })

  it('handles missing webcam ref gracefully', async () => {
    const user = userEvent.setup()
    
    // Mock useRef to return null webcam
    vi.spyOn(React, 'useRef').mockImplementation((initial) => {
      if (initial === null) {
        return { current: null }
      }
      return { current: initial }
    })

    render(<QRScanner onScan={mockOnScan} onBack={mockOnBack} />)
    
    await user.click(screen.getByText('Start Scanning'))
    
    // Fast forward the interval - should not crash
    vi.advanceTimersByTime(300)
    
    // Should still be scanning
    expect(screen.getByText('Scanning for QR code...')).toBeInTheDocument()
  })
})
