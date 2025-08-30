import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Avatar,
  Divider
} from '@heroui/react'
import { 
  MapPin, 
  Star, 
  Users, 
  Bed, 
  Bath, 
  Car, 
  Wifi, 
  Coffee,
  Heart,
  Share2,
  MessageCircle,
  Calendar
} from 'lucide-react'
import { PropertyQuickViewModalProps } from '../../../interfaces/Component'
import { useTranslation } from '../../../lib/stores/translationStore'

export const PropertyQuickViewModal: React.FC<PropertyQuickViewModalProps> = ({
  isOpen,
  onClose,
  property,
  onBookNow,
  onLike
}) => {
  const { t } = useTranslation(['property', 'booking', 'common'])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.()
  }

  const amenityIcons: Record<string, React.ReactNode> = {
    'WiFi': <Wifi className="size-4" />,
    'Kitchen': <Coffee className="size-4" />,
    'Parking': <Car className="size-4" />,
    'Pool': <Users className="size-4" />,
    'Air conditioning': <Users className="size-4" />
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex w-full items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{property.title}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="size-4 fill-current text-yellow-500" />
                      <span className="text-sm font-medium">{property.rating}</span>
                      <span className="text-sm text-gray-500">({t('booking.reviews.count', { count: property.review_count })})</span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{`${property.location.city}, ${property.location.country}`}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={handleLike}
                    className={isLiked ? 'text-red-500' : 'text-gray-500'}
                  >
                    <div className="flex items-center gap-1">
                      <Heart className={`size-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs font-semibold text-gray-700">{property.like_count ?? 0}</span>
                    </div>
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    color="default"
                  >
                    <Share2 className="size-5" />
                  </Button>
                </div>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Image Gallery */}
                <div className="relative">
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="h-64 w-full rounded-lg object-cover"
                  />
                  
                  {/* Image Navigation */}
                  {property.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="flex gap-2">
                        {property.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`size-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Counter */}
                  <div className="absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-3">
                  <Avatar src={property.host?.avatar_url} size="md" />
                  <div className="flex-1">
                    <p className="font-medium">{t('property.labels.hostedBy', { name: property.host?.display_name, defaultValue: 'Hosted by {{name}}' })}</p>
                    <p className="text-sm text-gray-600">{t('property.labels.yearsHosting', { years: property.host?.experience || 4, defaultValue: '{{years}} years hosting' })}</p>
                  </div>
                  <Chip color="success" variant="flat" size="sm">
                    {t('booking.labels.superhost')}
                  </Chip>
                </div>

                <Divider />

                {/* Property Details */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{property.max_guests} {t('property.labels.guests')}</p>
                      <p className="text-xs text-gray-500">{t('property.labels.max', 'Maximum')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Bed className="size-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{property.bedrooms} {t('property.labels.bedrooms')}</p>
                      <p className="text-xs text-gray-500">{t('property.labels.private', 'Private')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Bath className="size-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{property.bathrooms} {t('property.labels.bathrooms')}</p>
                      <p className="text-xs text-gray-500">{t('property.labels.full', 'Full')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="size-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">{property.rating} {t('property.labels.rating', 'rating')}</p>
                      <p className="text-xs text-gray-500">{t('booking.reviews.count', { count: property.review_count })}</p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Description */}
                <div>
                  <h4 className="mb-2 font-semibold">{t('property.labels.aboutThisPlace', 'About this place')}</h4>
                  <p className="line-clamp-4 text-sm text-gray-700">{property.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="mb-3 font-semibold">{t('property.labels.amenities')}</h4>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {property.amenities.slice(0, 6).map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        {amenityIcons[amenity] || <Users className="size-4" />}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                    {property.amenities.length > 6 && (
                      <div className="text-sm text-gray-500">
                        +{property.amenities.length - 6} {t('property.labels.more', 'more')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">
                        ${property.price}
                      </span>
                      <span className="ml-1 text-gray-600">{t('property.labels.perNight')}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{t('property.labels.freeCancellation', 'Free cancellation')}</p>
                      <p className="text-sm text-gray-600">{t('property.labels.forHours', { hours: 48, defaultValue: 'for {{hours}} hours' })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                {t('common.buttons.close')}
              </Button>
              <Button 
                color="secondary" 
                variant="flat"
                startContent={<MessageCircle className="size-4" />}
              >
                {t('property.actions.contactHost')}
              </Button>
              <Button 
                color="primary" 
                onPress={() => {
                  onBookNow?.()
                  onClose()
                }}
                startContent={<Calendar className="size-4" />}
              >
                {t('booking.actions.bookNow')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 