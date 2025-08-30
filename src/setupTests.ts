import '@testing-library/jest-dom';
import React from 'react';

interface MockComponentProps {
  children?: React.ReactNode;
  [key: string]: unknown;
}

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Check: () => React.createElement('div', { 'data-testid': 'check-icon' }),
  X: () => React.createElement('div', { 'data-testid': 'x-icon' }),
  ChevronRight: () => React.createElement('div', { 'data-testid': 'chevron-right-icon' }),
  ChevronLeft: () => React.createElement('div', { 'data-testid': 'chevron-left-icon' }),
  Home: () => React.createElement('div', { 'data-testid': 'home-icon' }),
  User: () => React.createElement('div', { 'data-testid': 'user-icon' }),
  Settings: () => React.createElement('div', { 'data-testid': 'settings-icon' }),
  Play: () => React.createElement('div', { 'data-testid': 'play-icon' }),
  Pause: () => React.createElement('div', { 'data-testid': 'pause-icon' }),
  SkipForward: () => React.createElement('div', { 'data-testid': 'skip-forward-icon' }),
  RotateCcw: () => React.createElement('div', { 'data-testid': 'rotate-ccw-icon' }),
}));

// Mock HeroUI components
jest.mock('@heroui/react', () => ({
  Button: ({ children, ...props }: MockComponentProps) =>
    React.createElement('button', props, children),
  Modal: ({ children, ...props }: MockComponentProps) =>
    React.createElement('div', props, children),
  ModalContent: ({ children, ...props }: MockComponentProps) =>
    React.createElement('div', props, children),
  ModalHeader: ({ children, ...props }: MockComponentProps) =>
    React.createElement('h2', props, children),
  ModalBody: ({ children, ...props }: MockComponentProps) =>
    React.createElement('div', props, children),
  ModalFooter: ({ children, ...props }: MockComponentProps) =>
    React.createElement('div', props, children),
  Card: ({ children, ...props }: MockComponentProps) => React.createElement('div', props, children),
  CardBody: ({ children, ...props }: MockComponentProps) =>
    React.createElement('div', props, children),
}));
