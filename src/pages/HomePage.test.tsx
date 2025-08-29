import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import HomePage from './HomePage'

// Mock all dependencies
jest.mock('../lib/stores/authStore')
jest.mock('../hooks/useTutorial')
jest.mock('../hooks/useHomeFeed')
jest.mock('../hooks/useAdminSettings')
jest.mock('../hooks/usePropertyShare')
jest.mock('../lib/stores/propertyStore')
jest.mock('../lib/stores/translationStore', () => ({
  useTranslation: jest.fn(() => ({
    t: jest.fn((key: string) => key)
  }))
}))

jest.mock('../components/shared/TutorialModal', () => ({
  TutorialModal: ({ isOpen }: { isOpen: boolean }) => (
    isOpen ? <div data-testid="tutorial-modal">Tutorial Modal</div> : null
  )
}))

describe('HomePage Tutorial Integration', () => {
  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    )
  })
})
