import React from 'react'
import { render, screen } from '@testing-library/react'
import { TutorialStep } from './TutorialStep'
import { TutorialStep as TutorialStepInterface } from '../../interfaces/Tutorial'

// Mock the translation store
jest.mock('../../lib/stores/translationStore', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, defaultValue?: string) => defaultValue || key)
  }))
}))

describe('TutorialStep', () => {
  const mockStep: TutorialStepInterface = {
    id: 0,
    title: 'Test Step',
    description: 'This is a test step description',
    imageUrl: '/test-image.jpg',
    imageAlt: 'Test image alt text'
  }

  it('should render step information correctly', () => {
    render(
      <TutorialStep
        step={mockStep}
        stepNumber={1}
        totalSteps={3}
      />
    )

    expect(screen.getByText('Test Step')).toBeInTheDocument()
    expect(screen.getByText('This is a test step description')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
  })

  it('should render image with correct attributes', () => {
    render(
      <TutorialStep
        step={mockStep}
        stepNumber={1}
        totalSteps={3}
      />
    )

    const image = screen.getByAltText('Test image alt text')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-image.jpg')
  })

  it('should render highlight element when provided', () => {
    const stepWithHighlight = {
      ...mockStep,
      highlightElement: '.test-selector'
    }

    render(
      <TutorialStep
        step={stepWithHighlight}
        stepNumber={1}
        totalSteps={3}
      />
    )

    expect(screen.getByText('Highlight:')).toBeInTheDocument()
    expect(screen.getByText('.test-selector')).toBeInTheDocument()
  })

  it('should not render highlight element when not provided', () => {
    render(
      <TutorialStep
        step={mockStep}
        stepNumber={1}
        totalSteps={3}
      />
    )

    expect(screen.queryByText('Highlight:')).not.toBeInTheDocument()
  })
})
