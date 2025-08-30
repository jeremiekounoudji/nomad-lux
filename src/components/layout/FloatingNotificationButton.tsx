import React from 'react'
import { NotificationCenter } from '../shared/NotificationCenter'

interface FloatingNotificationButtonProps {
  isAuthenticated: boolean
}

const FloatingNotificationButton: React.FC<FloatingNotificationButtonProps> = ({
  isAuthenticated
}) => {
  if (!isAuthenticated) return null

  return (
    <div className="fixed bottom-24 left-4 z-40 lg:hidden">
      <NotificationCenter 
        className="rounded-full bg-primary-600 shadow-lg transition-all duration-200 hover:bg-primary-700 hover:shadow-xl" 
        showBadge={true}
      />
    </div>
  )
}

export default FloatingNotificationButton
