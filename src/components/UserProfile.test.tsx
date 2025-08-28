import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserProfile from './UserProfile'

const mockOnBack = vi.fn()

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders user profile information correctly', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    expect(screen.getByText('Ben Lehrburger')).toBeInTheDocument()
    expect(screen.getByText('ben.lehrburger@windsurf.com')).toBeInTheDocument()
    expect(screen.getByText('Member since January 2024')).toBeInTheDocument()
  })

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserProfile onBack={mockOnBack} />)
    
    const backButton = screen.getByRole('button', { name: /back/i })
    await user.click(backButton)
    
    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('displays user statistics correctly', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    expect(screen.getByText('47')).toBeInTheDocument()
    expect(screen.getByText('Charging Sessions')).toBeInTheDocument()
    expect(screen.getByText('1,250')).toBeInTheDocument()
    expect(screen.getByText('kWh Charged')).toBeInTheDocument()
    expect(screen.getByText('$437.5')).toBeInTheDocument()
    expect(screen.getByText('Total Spent')).toBeInTheDocument()
    expect(screen.getByText('890')).toBeInTheDocument()
    expect(screen.getByText('lbs CO₂ Saved')).toBeInTheDocument()
  })

  it('displays recent charging sessions', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    expect(screen.getByText('Recent Charging Sessions')).toBeInTheDocument()
    
    // Check first session
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('2024-08-20')).toBeInTheDocument()
    expect(screen.getByText('45 min')).toBeInTheDocument()
    expect(screen.getByText('28.5 kWh')).toBeInTheDocument()
    expect(screen.getByText('$9.98')).toBeInTheDocument()
    
    // Check second session
    expect(screen.getByText('Beach Resort')).toBeInTheDocument()
    expect(screen.getByText('2024-08-18')).toBeInTheDocument()
    expect(screen.getByText('52 min')).toBeInTheDocument()
    expect(screen.getByText('32.1 kWh')).toBeInTheDocument()
    expect(screen.getByText('$12.2')).toBeInTheDocument()
    
    // Check third session
    expect(screen.getByText('Airport Terminal')).toBeInTheDocument()
    expect(screen.getByText('2024-08-15')).toBeInTheDocument()
    expect(screen.getByText('38 min')).toBeInTheDocument()
    expect(screen.getByText('24.8 kWh')).toBeInTheDocument()
    expect(screen.getByText('$10.42')).toBeInTheDocument()
  })

  it('displays account action buttons', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    expect(screen.getByText('Payment Methods')).toBeInTheDocument()
    expect(screen.getByText('Account Settings')).toBeInTheDocument()
    expect(screen.getByText('Usage Reports')).toBeInTheDocument()
  })

  it('displays favorite station', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    expect(screen.getByText('Favorite Station')).toBeInTheDocument()
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('Most frequently used station')).toBeInTheDocument()
  })

  it('has settings button in header', async () => {
    const user = userEvent.setup()
    render(<UserProfile onBack={mockOnBack} />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    expect(settingsButton).toBeInTheDocument()
    
    // Settings button should be clickable (though no handler is defined in the component)
    await user.click(settingsButton)
  })

  it('displays user avatar placeholder', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    const avatar = document.querySelector('.user-avatar')
    expect(avatar).toBeInTheDocument()
  })

  it('formats numbers correctly', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    // Check that totalEnergy is formatted with locale string (1,250)
    expect(screen.getByText('1,250')).toBeInTheDocument()
  })

  it('displays all stat cards with correct icons', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    // All stat cards should be present
    const statCards = document.querySelectorAll('.stat-card')
    expect(statCards).toHaveLength(4)
    
    // Check for icon classes
    expect(document.querySelector('.text-blue-600')).toBeInTheDocument() // Zap icon
    expect(document.querySelector('.text-green-600')).toBeInTheDocument() // TrendingUp icon
    expect(document.querySelector('.text-orange-500')).toBeInTheDocument() // DollarSign icon
    expect(document.querySelector('.text-purple-600')).toBeInTheDocument() // Clock icon
  })

  it('displays session metrics with correct icons', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    // Each session should have duration, energy, and cost metrics
    const sessions = document.querySelectorAll('.session-card')
    expect(sessions).toHaveLength(3)
    
    // Check that each session has the expected metric icons
    sessions.forEach(session => {
      expect(session.querySelector('.text-gray-500')).toBeInTheDocument() // Clock icon
      expect(session.querySelector('.text-blue-600')).toBeInTheDocument() // Zap icon  
      expect(session.querySelector('.text-green-600')).toBeInTheDocument() // DollarSign icon
    })
  })

  it('action buttons are clickable', async () => {
    const user = userEvent.setup()
    render(<UserProfile onBack={mockOnBack} />)
    
    const paymentButton = screen.getByText('Payment Methods')
    const settingsButton = screen.getByText('Account Settings')
    const reportsButton = screen.getByText('Usage Reports')
    
    // All buttons should be clickable (though no handlers are defined)
    await user.click(paymentButton)
    await user.click(settingsButton)
    await user.click(reportsButton)
    
    // No errors should occur
    expect(paymentButton).toBeInTheDocument()
    expect(settingsButton).toBeInTheDocument()
    expect(reportsButton).toBeInTheDocument()
  })

  it('displays correct section titles', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    expect(screen.getByText('Profile')).toBeInTheDocument()
    expect(screen.getByText('Recent Charging Sessions')).toBeInTheDocument()
    expect(screen.getByText('Favorite Station')).toBeInTheDocument()
  })

  it('renders all session details correctly', () => {
    render(<UserProfile onBack={mockOnBack} />)
    
    // Verify all sessions are rendered with complete information
    const sessionCards = document.querySelectorAll('.session-card')
    expect(sessionCards).toHaveLength(3)
    
    // First session details
    expect(screen.getByText('Downtown Plaza')).toBeInTheDocument()
    expect(screen.getByText('2024-08-20')).toBeInTheDocument()
    
    // Second session details  
    expect(screen.getByText('Beach Resort')).toBeInTheDocument()
    expect(screen.getByText('2024-08-18')).toBeInTheDocument()
    
    // Third session details
    expect(screen.getByText('Airport Terminal')).toBeInTheDocument()
    expect(screen.getByText('2024-08-15')).toBeInTheDocument()
  })
})
