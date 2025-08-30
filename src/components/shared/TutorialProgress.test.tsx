import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TutorialProgress } from './TutorialProgress'

// Mock the translation store
jest.mock('../../lib/stores/translationStore', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string, defaultValue?: string) => defaultValue || key)
  }))
}))

describe('TutorialProgress', () => {
  const defaultProps = {
    currentStep: 0,
    totalSteps: 3,
    percentage: 33.33
  }

  it('should render progress information correctly', () => {
    render(<TutorialProgress {...defaultProps} />)

    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('33%')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    expect(screen.getByText('33% complete')).toBeInTheDocument()
  })

  it('should render dots navigation', () => {
    render(<TutorialProgress {...defaultProps} />)

    const dots = screen.getAllByRole('button')
    expect(dots).toHaveLength(3) // 3 steps = 3 dots
  })

  it('should call onStepClick when dot is clicked', () => {
    const onStepClick = jest.fn()
    render(<TutorialProgress {...defaultProps} onStepClick={onStepClick} />)

    const dots = screen.getAllByRole('button')
    fireEvent.click(dots[1]) // Click second dot

    expect(onStepClick).toHaveBeenCalledWith(1)
  })

  it('should not call onStepClick when current step dot is clicked', () => {
    const onStepClick = jest.fn()
    render(<TutorialProgress {...defaultProps} onStepClick={onStepClick} />)

    const dots = screen.getAllByRole('button')
    fireEvent.click(dots[0]) // Click current step dot

    expect(onStepClick).not.toHaveBeenCalled()
  })

  it('should hide progress bar when showProgressBar is false', () => {
    render(<TutorialProgress {...defaultProps} showProgressBar={false} />)

    expect(screen.queryByText('Progress')).not.toBeInTheDocument()
  })

  it('should hide dots when showDots is false', () => {
    render(<TutorialProgress {...defaultProps} showDots={false} />)

    const dots = screen.queryAllByRole('button')
    expect(dots).toHaveLength(0)
  })

  it('should show step buttons when showStepButtons is true', () => {
    render(<TutorialProgress {...defaultProps} showStepButtons={true} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
