import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import TimelineInput from '../components/TimelineInput'
import Timeline from '../components/Timeline'
import LanguageSwitcher from '../components/LanguageSwitcher'

describe('TimelineInput', () => {
  it('renders input field', () => {
    render(
      <BrowserRouter>
        <TimelineInput 
          onGenerate={vi.fn()} 
          isLoading={false} 
          tokensRemaining={3} 
        />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('input-field')).toBeInTheDocument()
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument()
  })

  it('shows tokens remaining', () => {
    render(
      <BrowserRouter>
        <TimelineInput 
          onGenerate={vi.fn()} 
          isLoading={false} 
          tokensRemaining={5} 
        />
      </BrowserRouter>
    )
    
    expect(screen.getByText(/5/)).toBeInTheDocument()
  })

  it('disables button when loading', () => {
    render(
      <BrowserRouter>
        <TimelineInput 
          onGenerate={vi.fn()} 
          isLoading={true} 
          tokensRemaining={3} 
        />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('generate-btn')).toBeDisabled()
  })

  it('disables button when no tokens', () => {
    render(
      <BrowserRouter>
        <TimelineInput 
          onGenerate={vi.fn()} 
          isLoading={false} 
          tokensRemaining={0} 
        />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('generate-btn')).toBeDisabled()
  })

  it('calls onGenerate with input', () => {
    const onGenerate = vi.fn()
    render(
      <BrowserRouter>
        <TimelineInput 
          onGenerate={onGenerate} 
          isLoading={false} 
          tokensRemaining={3} 
        />
      </BrowserRouter>
    )
    
    const input = screen.getByTestId('input-field')
    fireEvent.change(input, { target: { value: 'AI' } })
    
    const button = screen.getByTestId('generate-btn')
    fireEvent.click(button)
    
    expect(onGenerate).toHaveBeenCalledWith('AI', 10)
  })
})

describe('Timeline', () => {
  const mockEvents = [
    {
      year: 2027,
      title: 'Major Breakthrough',
      description: 'A significant advancement occurs.',
      impact: 'high' as const,
      category: 'technology'
    },
    {
      year: 2030,
      title: 'Mass Adoption',
      description: 'Technology becomes mainstream.',
      impact: 'medium' as const,
      category: 'business'
    }
  ]

  it('renders timeline events', () => {
    render(
      <Timeline 
        events={mockEvents} 
        subject="AI" 
        summary="The future looks bright" 
      />
    )
    
    expect(screen.getByText('Major Breakthrough')).toBeInTheDocument()
    expect(screen.getByText('Mass Adoption')).toBeInTheDocument()
  })

  it('renders summary', () => {
    render(
      <Timeline 
        events={mockEvents} 
        subject="AI" 
        summary="The future looks bright" 
      />
    )
    
    expect(screen.getByText('The future looks bright')).toBeInTheDocument()
  })

  it('renders year badges', () => {
    render(
      <Timeline 
        events={mockEvents} 
        subject="AI" 
        summary="Test summary" 
      />
    )
    
    expect(screen.getByText('2027')).toBeInTheDocument()
    expect(screen.getByText('2030')).toBeInTheDocument()
  })
})

describe('LanguageSwitcher', () => {
  it('renders language switcher', () => {
    render(
      <BrowserRouter>
        <LanguageSwitcher />
      </BrowserRouter>
    )
    
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument()
  })

  it('shows current language', () => {
    render(
      <BrowserRouter>
        <LanguageSwitcher />
      </BrowserRouter>
    )
    
    expect(screen.getByText('EN')).toBeInTheDocument()
  })

  it('opens dropdown on click', () => {
    render(
      <BrowserRouter>
        <LanguageSwitcher />
      </BrowserRouter>
    )
    
    const trigger = screen.getByText('EN')
    fireEvent.click(trigger)
    
    expect(screen.getByText('English')).toBeInTheDocument()
    expect(screen.getByText('中文')).toBeInTheDocument()
    expect(screen.getByText('日本語')).toBeInTheDocument()
  })
})
