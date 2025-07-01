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

export const PropertyQuickViewModal: React.FC<PropertyQuickViewModalProps> = ({
  isOpen,
  onClose,
  property,
  onBookNow,
  onLike
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.()
  }

  const amenityIcons: Record<string, React.ReactNode> = {
    'WiFi': <Wifi className="w-4 h-4" />,
    'Kitchen': <Coffee className="w-4 h-4" />,
    'Parking': <Car className="w-4 h-4" />,
    'Pool': <Users className="w-4 h-4" />,
    'Air conditioning': <Users className="w-4 h-4" />
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
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-xl font-bold">{property.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{property.rating}</span>
                      <span className="text-sm text-gray-500">({property.review_count} reviews)</span>
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
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
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs text-gray-700 font-semibold">{property.like_count ?? 0}</span>
                    </div>
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    color="default"
                  >
                    <Share2 className="w-5 h-5" />
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
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  
                  {/* Image Navigation */}
                  {property.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                      <div className="flex gap-2">
                        {property.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image Counter */}
                  <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {property.images.length}
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-3">
                  <Avatar src={property.host?.avatar_url} size="md" />
                  <div className="flex-1">
                    <p className="font-medium">Hosted by {property.host?.display_name}</p>
                    <p className="text-sm text-gray-600">{property.host?.experience || 4} years hosting</p>
                  </div>
                  <Chip color="success" variant="flat" size="sm">
                    Superhost
                  </Chip>
                </div>

                <Divider />

                {/* Property Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{property.max_guests} guests</p>
                      <p className="text-xs text-gray-500">Maximum</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{property.bedrooms} bedrooms</p>
                      <p className="text-xs text-gray-500">Private</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{property.bathrooms} bathrooms</p>
                      <p className="text-xs text-gray-500">Full</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">{property.rating} rating</p>
                      <p className="text-xs text-gray-500">{property.review_count} reviews</p>
                    </div>
                  </div>
                </div>

                <Divider />

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">About this place</h4>
                  <p className="text-sm text-gray-700 line-clamp-4">{property.description}</p>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-semibold mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.slice(0, 6).map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2">
                        {amenityIcons[amenity] || <Users className="w-4 h-4" />}
                        <span className="text-sm">{amenity}</span>
                      </div>
                    ))}
                    {property.amenities.length > 6 && (
                      <div className="text-sm text-gray-500">
                        +{property.amenities.length - 6} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary-600">
                        ${property.price}
                      </span>
                      <span className="text-gray-600 ml-1">per night</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Free cancellation</p>
                      <p className="text-sm text-gray-600">for 48 hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button 
                color="secondary" 
                variant="flat"
                startContent={<MessageCircle className="w-4 h-4" />}
              >
                Contact Host
              </Button>
              <Button 
                color="primary" 
                onPress={() => {
                  onBookNow?.()
                  onClose()
                }}
                startContent={<Calendar className="w-4 h-4" />}
              >
                Book Now
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 