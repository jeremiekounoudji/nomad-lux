import React from 'react'
import { Card, CardBody, Avatar, Button, Chip } from '@heroui/react'
import { Bell, Heart, Calendar, MessageCircle, Star, Home, Clock, ChevronRight } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import { NotificationsPageProps, Notification } from '../interfaces'

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'New Booking Request',
    message: 'Sarah Johnson wants to book your Modern Loft in Downtown for 3 nights',
    time: '2 minutes ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150'
  },
  {
    id: '2',
    type: 'like',
    title: 'Property Liked',
    message: 'Michael Chen liked your Cozy Beach House listing',
    time: '15 minutes ago',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: '3',
    type: 'review',
    title: 'New Review',
    message: 'Emma Wilson left a 5-star review for your Mountain Cabin',
    time: '1 hour ago',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
  },
  {
    id: '4',
    type: 'message',
    title: 'New Message',
    message: 'David Park sent you a message about the Ocean View Villa',
    time: '2 hours ago',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: '5',
    type: 'system',
    title: 'Payment Received',
    message: 'You received $450 for the booking at Luxury Penthouse',
    time: '1 day ago',
    read: true
  }
]

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onPageChange }) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4" />
      case 'like':
        return <Heart className="w-4 h-4" />
      case 'review':
        return <Star className="w-4 h-4" />
      case 'message':
        return <MessageCircle className="w-4 h-4" />
      case 'system':
        return <Bell className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-primary-500'
      case 'like':
        return 'bg-red-500'
      case 'review':
        return 'bg-yellow-500'
      case 'message':
        return 'bg-secondary-500'
      case 'system':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const unreadCount = mockNotifications.filter(n => !n.read).length

  return (
    <MainLayout currentPage="notifications" onPageChange={onPageChange}>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-lg mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-primary-100 text-lg">
              {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {mockNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer border-0 ${
                !notification.read 
                  ? 'bg-white shadow-lg ring-2 ring-primary-100' 
                  : 'bg-white shadow-md hover:shadow-lg'
              }`}
            >
              <CardBody className="p-0">
                <div className="flex items-start">
                  {/* Left colored indicator */}
                  <div className={`w-1 h-full ${getTypeColor(notification.type)} rounded-l-lg`}></div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar Section */}
                      <div className="relative flex-shrink-0">
                        {notification.avatar ? (
                          <Avatar
                            src={notification.avatar}
                            size="lg"
                            className="ring-3 ring-white shadow-lg"
                          />
                        ) : (
                          <div className={`w-14 h-14 ${getTypeColor(notification.type)} rounded-full flex items-center justify-center shadow-lg`}>
                            <div className="text-white">
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                        )}
                        
                        {/* Notification type badge */}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${getTypeColor(notification.type)} rounded-full flex items-center justify-center shadow-md border-2 border-white`}>
                          <div className="text-white text-xs">
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-bold text-lg leading-tight ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 animate-pulse"></div>
                              )}
                            </div>
                            
                            <p className="text-gray-600 text-base leading-relaxed mb-4 pr-2 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-3 h-3" />
                                <span className="text-sm font-medium">
                                  {notification.time}
                                </span>
                              </div>
                              
                              <Chip
                                size="sm"
                                variant="flat"
                                className={`text-xs font-semibold ${
                                  notification.type === 'booking' ? 'bg-primary-100 text-primary-700' :
                                  notification.type === 'like' ? 'bg-red-100 text-red-700' :
                                  notification.type === 'review' ? 'bg-yellow-100 text-yellow-700' :
                                  notification.type === 'message' ? 'bg-secondary-100 text-secondary-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                              </Chip>
                            </div>
                          </div>

                          {/* Chevron for navigation hint */}
                          <div className="flex-shrink-0 mt-2">
                            <ChevronRight className="w-5 h-5 text-gray-300" />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {(notification.type === 'booking' || notification.type === 'message') && (
                          <div className="flex gap-3 pt-4 border-t border-gray-100">
                            {notification.type === 'booking' && (
                              <>
                                <Button 
                                  size="md" 
                                  color="primary" 
                                  variant="solid" 
                                  className="flex-1 font-semibold shadow-md hover:shadow-lg transition-all"
                                >
                                  Accept
                                </Button>
                                <Button 
                                  size="md" 
                                  color="secondary" 
                                  variant="bordered" 
                                  className="flex-1 font-semibold border-2 hover:bg-secondary-50 transition-all"
                                >
                                  Decline
                                </Button>
                              </>
                            )}
                            {notification.type === 'message' && (
                              <Button 
                                size="md" 
                                color="secondary" 
                                variant="solid" 
                                className="flex-1 font-semibold shadow-md hover:shadow-lg transition-all"
                              >
                                Reply
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center pt-6">
          <Button 
            variant="flat" 
            color="primary" 
            size="lg"
            className="font-semibold px-8 py-3 shadow-md hover:shadow-lg transition-all"
          >
            Load More Notifications
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}

export default NotificationsPage 