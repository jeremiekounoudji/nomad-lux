import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TutorialModal } from './TutorialModal'
import { TutorialStep } from '../../interfaces/Tutorial'

// Mock the tutorial hook
jest.mock('../../hooks/useTutorial', () => ({
  useTutorial: jest.fn()
}))

// Mock the translation store
jest.mock('../../lib/stores/translationStore', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, defaultValue?: string) => defaultValue || key)
  }))
}))

const mockUseTutorial = require('../../hooks/useTutorial').useTutorial

describe('TutorialModal', () => {
  const mockSteps: TutorialStep[] = [
    {
      id: 0,
      title: 'Step 1',
      description: 'First step description',
      imageUrl: '/step1.jpg',
      imageAlt: 'Step 1 image'
    }
  ]

  const defaultMockState = {
    tutorialState: {
      isVisible: false,
      currentStep: 0,
      isCompleted: false,
      neverShowAgain: false,
      hasBeenShown: false
    },
    config: {
      autoStart: true,
      showProgress: true,
      allowSkip: true,
      allowClose: true,
      showNeverShowAgain: true,
      keyboardNavigation: true,
      analyticsEnabled: true
    },
    startTutorial: jest.fn(),
    completeTutorial: jest.fn(),
    skipTutorial: jest.fn(),
    closeTutorial: jest.fn(),
    nextStep: jest.fn(),
    previousStep: jest.fn(),
    setNeverShowAgain: jest.fn(),
    getCurrentStep: jest.fn(() => mockSteps[0]),
    isLastStep: jest.fn(() => false),
    isFirstStep: jest.fn(() => true),
    getProgressPercentage: jest.fn(() => 50)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTutorial.mockReturnValue(defaultMockState)
  })

  it('should not render when isOpen is false', () => {
    render(<TutorialModal steps={mockSteps} isOpen={false} />)
    expect(screen.queryByText('Welcome to Nomad Lux')).not.toBeInTheDocument()
  })

  it('should render when isOpen is true', () => {
    render(<TutorialModal steps={mockSteps} isOpen={true} />)
    expect(screen.getByText('Welcome to Nomad Lux')).toBeInTheDocument()
  })

  it('should call nextStep when next button is clicked', () => {
    render(<TutorialModal steps={mockSteps} isOpen={true} />)
    fireEvent.click(screen.getByText('Next'))
    expect(defaultMockState.nextStep).toHaveBeenCalled()
  })

  it('should call skipTutorial when skip button is clicked', () => {
    render(<TutorialModal steps={mockSteps} isOpen={true} />)
    fireEvent.click(screen.getByText('Skip'))
    expect(defaultMockState.skipTutorial).toHaveBeenCalled()
  })

  it('should call setNeverShowAgain when checkbox is changed', () => {
    render(<TutorialModal steps={mockSteps} isOpen={true} />)
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(defaultMockState.setNeverShowAgain).toHaveBeenCalledWith(true)
  })
})
