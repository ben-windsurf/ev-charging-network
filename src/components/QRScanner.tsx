import { useState, useRef, useCallback } from 'react'
import { ArrowLeft, Camera, Zap } from 'lucide-react'
import Webcam from 'react-webcam'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (result: string) => void
  onBack: () => void
}

export default function QRScanner({ onScan, onBack }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const webcamRef = useRef<Webcam>(null)
  const intervalRef = useRef<number | null>(null)

  const startScanning = useCallback(() => {
    setIsScanning(true)
    setError(null)
    
    intervalRef.current = setInterval(() => {
      const webcam = webcamRef.current
      if (webcam) {
        const imageSrc = webcam.getScreenshot()
        if (imageSrc) {
          const img = new Image()
          img.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            if (ctx) {
              canvas.width = img.width
              canvas.height = img.height
              ctx.drawImage(img, 0, 0)
              
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const code = jsQR(imageData.data, imageData.width, imageData.height)
              
              if (code) {
                setIsScanning(false)
                if (intervalRef.current) {
                  clearInterval(intervalRef.current)
                }
                onScan(code.data)
              }
            }
          }
          img.src = imageSrc
        }
      }
    }, 300)
  }, [onScan])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  const handleManualEntry = () => {
    // Simulate successful scan for demo
    onScan('EV-STATION-001-PORT-A')
  }

  return (
    <div className="qr-scanner">
      {/* Header */}
      <div className="scanner-header">
        <button onClick={onBack} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h2 className="scanner-title">Scan QR Code</h2>
      </div>

      {/* Instructions */}
      <div className="scanner-instructions">
        <Zap className="text-blue-600" size={32} />
        <h3>Connect to Charger</h3>
        <p>Point your camera at the QR code on the charging station to connect and start charging.</p>
      </div>

      {/* Camera View */}
      <div className="camera-container">
        {isScanning ? (
          <div className="camera-view">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="webcam"
              onUserMediaError={() => {
                setError('Camera access denied. Please enable camera permissions.')
                setIsScanning(false)
              }}
            />
            <div className="scan-overlay">
              <div className="scan-frame"></div>
            </div>
            <div className="scan-status">
              <div className="scanning-indicator">
                <div className="pulse"></div>
                <span>Scanning for QR code...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="camera-placeholder">
            <Camera size={64} className="text-gray-400" />
            <p className="text-gray-600">Camera preview will appear here</p>
            {error && (
              <div className="error-message">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="scanner-actions">
        {!isScanning ? (
          <button onClick={startScanning} className="btn-primary scan-button">
            <Camera size={20} />
            Start Scanning
          </button>
        ) : (
          <button onClick={stopScanning} className="btn-secondary stop-button">
            Stop Scanning
          </button>
        )}
        
        <button onClick={handleManualEntry} className="btn-secondary manual-button">
          Enter Code Manually
        </button>
      </div>

      {/* Help Text */}
      <div className="scanner-help">
        <h4>Having trouble?</h4>
        <ul>
          <li>Make sure the QR code is well-lit and clearly visible</li>
          <li>Hold your phone steady about 6 inches from the code</li>
          <li>Ensure camera permissions are enabled</li>
          <li>Try entering the station code manually if scanning fails</li>
        </ul>
      </div>
    </div>
  )
}
