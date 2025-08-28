import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock React DOM
const mockRender = vi.fn()
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: mockRender
  }))
}))

// Mock App component
vi.mock('./App.tsx', () => ({
  default: () => <div data-testid="app">App Component</div>
}))

// Mock CSS import
vi.mock('./index.css', () => ({}))

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock document.getElementById
    const mockElement = document.createElement('div')
    mockElement.id = 'root'
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)
  })

  it('renders the app in StrictMode', async () => {
    // Import main.tsx to trigger the render
    await import('./main.tsx')
    
    expect(mockRender).toHaveBeenCalledTimes(1)
    
    // Check that render was called with StrictMode wrapping App
    const renderCall = mockRender.mock.calls[0][0]
    expect(renderCall.type.name).toBe('StrictMode')
    expect(renderCall.props.children.type.name).toBe('App')
  })

  it('gets the root element correctly', async () => {
    await import('./main.tsx')
    
    expect(document.getElementById).toHaveBeenCalledWith('root')
  })
})
