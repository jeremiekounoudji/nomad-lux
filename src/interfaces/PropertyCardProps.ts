import { Property } from './Property'

export interface PropertyCardProps {
  property: Property
  onView?: (id: string) => void
  onLike?: (id: string) => void
  onShare?: (property: Property) => void
  onBook?: (property: Property) => void
  onClick?: (property: Property) => void
  showStats?: boolean
  showActions?: boolean
  className?: string
  variant?: 'feed' | 'grid' | 'list'
} 