import React from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Progress,
  Divider
} from '@heroui/react'
import { 
  Eye, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Star,
  MessageCircle,
  Heart,
  BarChart3
} from 'lucide-react'
import { PropertyStatsModalProps } from '../../../interfaces/Component'

export const PropertyStatsModal: React.FC<PropertyStatsModalProps> = ({
  isOpen,
  onClose,
  property,
  stats
}) => {
  const occupancyRate = (stats.bookings / 30) * 100 // Assuming 30 days in a month
  const averageNightlyRevenue = stats.revenue / (stats.bookings || 1)

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-bold">Property Statistics</h2>
              </div>
              <p className="text-sm text-gray-600">{property.title}</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Property Info */}
                <Card>
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{property.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Chip 
                            color={stats.status === 'active' ? 'success' : 
                                   stats.status === 'pending' ? 'warning' : 'default'}
                            variant="flat"
                            size="sm"
                          >
                            {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}
                          </Chip>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{stats.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardBody className="p-4 text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-secondary-100 rounded-full mx-auto mb-2">
                        <Eye className="w-6 h-6 text-secondary-600" />
                      </div>
                      <p className="text-2xl font-bold text-secondary-600">{stats.views}</p>
                      <p className="text-sm text-gray-600">Total Views</p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="p-4 text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{stats.bookings}</p>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="p-4 text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mx-auto mb-2">
                        <DollarSign className="w-6 h-6 text-primary-600" />
                      </div>
                      <p className="text-2xl font-bold text-primary-600">${stats.revenue}</p>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="p-4 text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                        <Star className="w-6 h-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">{stats.rating}</p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </CardBody>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Performance Metrics</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Occupancy Rate</span>
                        <span className="text-sm text-gray-600">{occupancyRate.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={occupancyRate} 
                        color={occupancyRate > 70 ? 'success' : occupancyRate > 40 ? 'warning' : 'danger'}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Response Rate</span>
                        <span className="text-sm text-gray-600">95%</span>
                      </div>
                      <Progress 
                        value={95} 
                        color="success"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Guest Satisfaction</span>
                        <span className="text-sm text-gray-600">{((stats.rating / 5) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={(stats.rating / 5) * 100} 
                        color={stats.rating >= 4.5 ? 'success' : stats.rating >= 4 ? 'warning' : 'danger'}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Engagement</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Views this month</span>
                        </div>
                        <span className="font-medium">{Math.floor(stats.views * 0.3)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Favorites</span>
                        </div>
                        <span className="font-medium">{Math.floor(stats.views * 0.1)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Inquiries</span>
                        </div>
                        <span className="font-medium">{Math.floor(stats.bookings * 2.5)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Revenue</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Avg. nightly rate</span>
                        </div>
                        <span className="font-medium">${averageNightlyRevenue.toFixed(0)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Monthly trend</span>
                        </div>
                        <span className="font-medium text-success-600">+12%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">Repeat guests</span>
                        </div>
                        <span className="font-medium">{Math.floor(stats.bookings * 0.2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips for Improvement */}
                <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <h4 className="font-semibold text-primary-800 mb-2">Tips to Improve Performance</h4>
                  <ul className="text-sm text-primary-700 space-y-1">
                    {occupancyRate < 50 && <li>• Consider adjusting your pricing to attract more bookings</li>}
                    {stats.rating < 4.5 && <li>• Focus on guest communication and property cleanliness</li>}
                    {stats.views < 100 && <li>• Add more high-quality photos to increase visibility</li>}
                    <li>• Update your property description with recent amenities</li>
                    <li>• Respond quickly to guest inquiries to improve response rate</li>
                  </ul>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                View Full Analytics
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 