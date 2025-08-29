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
import { useTranslation } from '../../../lib/stores/translationStore'

export const PropertyStatsModal: React.FC<PropertyStatsModalProps> = ({
  isOpen,
  onClose,
  property,
  stats
}) => {
  const { t } = useTranslation(['property', 'common'])
  // Provide default values if stats is undefined
  const safeStats = stats || {
    views: 0,
    bookings: 0,
    revenue: 0,
    rating: 0,
    status: 'pending' as const
  }
  
  const occupancyRate = (safeStats.bookings / 30) * 100 // Assuming 30 days in a month
  const averageNightlyRevenue = safeStats.revenue / (safeStats.bookings || 1)

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
                <BarChart3 className="size-6 text-primary-500" />
                <h2 className="text-xl font-bold">{t('property.stats.title')}</h2>
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
                        className="size-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{property.title}</h3>
                        <p className="line-clamp-2 text-sm text-gray-600">{property.description}</p>
                        <div className="mt-2 flex items-center gap-4">
                          <Chip 
                            color={safeStats.status === 'approved' ? 'success' : 
                                   safeStats.status === 'pending' ? 'warning' : 'default'}
                            variant="flat"
                            size="sm"
                          >
                            {t(`common.status.${safeStats.status}`)}
                          </Chip>
                          <div className="flex items-center gap-1">
                            <Star className="size-4 fill-current text-yellow-500" />
                            <span className="text-sm font-medium">{safeStats.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <Card>
                    <CardBody className="p-4 text-center">
                      <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-secondary-100">
                        <Eye className="size-6 text-secondary-600" />
                      </div>
                      <p className="text-2xl font-bold text-secondary-600">{safeStats.views}</p>
                      <p className="text-sm text-gray-600">{t('property.stats.cards.totalViews')}</p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="p-4 text-center">
                      <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-green-100">
                        <Calendar className="size-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">{safeStats.bookings}</p>
                      <p className="text-sm text-gray-600">{t('property.stats.cards.totalBookings')}</p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="p-4 text-center">
                      <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary-100">
                        <DollarSign className="size-6 text-primary-600" />
                      </div>
                      <p className="text-2xl font-bold text-primary-600">${safeStats.revenue}</p>
                      <p className="text-sm text-gray-600">{t('property.stats.cards.totalRevenue')}</p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody className="p-4 text-center">
                      <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-yellow-100">
                        <Star className="size-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">{safeStats.rating}</p>
                      <p className="text-sm text-gray-600">{t('property.stats.cards.averageRating')}</p>
                    </CardBody>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">{t('property.stats.performanceMetrics')}</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{t('property.stats.metrics.occupancyRate')}</span>
                        <span className="text-sm text-gray-600">{occupancyRate.toFixed(1)}%</span>
                      </div>
                      <Progress 
                        value={occupancyRate} 
                        color={occupancyRate > 70 ? 'success' : occupancyRate > 40 ? 'warning' : 'danger'}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{t('property.stats.metrics.responseRate')}</span>
                        <span className="text-sm text-gray-600">95%</span>
                      </div>
                      <Progress 
                        value={95} 
                        color="success"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium">{t('property.stats.metrics.guestSatisfaction')}</span>
                        <span className="text-sm text-gray-600">{((safeStats.rating / 5) * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={(safeStats.rating / 5) * 100} 
                        color={safeStats.rating >= 4.5 ? 'success' : safeStats.rating >= 4 ? 'warning' : 'danger'}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">{t('property.stats.sections.engagement')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="size-4 text-gray-500" />
                          <span className="text-sm">{t('property.stats.engagement.viewsThisMonth')}</span>
                        </div>
                        <span className="font-medium">{Math.floor(safeStats.views * 0.3)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Heart className="size-4 text-gray-500" />
                          <span className="text-sm">{t('property.stats.engagement.favorites')}</span>
                        </div>
                        <span className="font-medium">{Math.floor(safeStats.views * 0.1)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="size-4 text-gray-500" />
                          <span className="text-sm">{t('property.stats.engagement.inquiries')}</span>
                        </div>
                        <span className="font-medium">{Math.floor(safeStats.bookings * 2.5)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">{t('property.stats.sections.revenue')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="size-4 text-gray-500" />
                          <span className="text-sm">{t('property.stats.revenue.avgNightlyRate')}</span>
                        </div>
                        <span className="font-medium">${averageNightlyRevenue.toFixed(0)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="size-4 text-gray-500" />
                          <span className="text-sm">{t('property.stats.revenue.monthlyTrend')}</span>
                        </div>
                        <span className="font-medium text-success-600">+12%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="size-4 text-gray-500" />
                          <span className="text-sm">{t('property.stats.revenue.repeatGuests')}</span>
                        </div>
                        <span className="font-medium">{Math.floor(safeStats.bookings * 0.2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips for Improvement */}
                <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
                  <h4 className="mb-2 font-semibold text-primary-800">{t('property.stats.tips.title')}</h4>
                  <ul className="space-y-1 text-sm text-primary-700">
                    {occupancyRate < 50 && <li>• {t('property.stats.tips.adjustPricing')}</li>}
                    {safeStats.rating < 4.5 && <li>• {t('property.stats.tips.improveCommunicationAndCleanliness')}</li>}
                    {safeStats.views < 100 && <li>• {t('property.stats.tips.addPhotos')}</li>}
                    <li>• {t('property.stats.tips.updateDescription')}</li>
                    <li>• {t('property.stats.tips.respondQuickly')}</li>
                  </ul>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                {t('common.buttons.close')}
              </Button>
              <Button color="primary" onPress={onClose}>
                {t('property.actions.viewFullAnalytics')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 