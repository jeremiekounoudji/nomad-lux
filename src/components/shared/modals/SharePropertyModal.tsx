import React, { useState } from 'react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Chip,
  Divider
} from '@heroui/react'
import { 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Instagram,
  Link,
  Check,
  Star,
  MapPin
} from 'lucide-react'
import { SharePropertyModalProps } from '../../../interfaces/Component'

export const SharePropertyModal: React.FC<SharePropertyModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const [copied, setCopied] = useState(false)
  const [customMessage, setCustomMessage] = useState('')

  const propertyUrl = `https://nomadlux.com/property/${property.id}`
  const defaultMessage = `Check out this amazing property: ${property.title} in ${property.location.city}, ${property.location.country}. ${propertyUrl}`

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: <Copy className="w-5 h-5" />,
      color: 'default',
      action: () => handleCopyLink()
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'success',
      action: () => handleWhatsAppShare()
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'primary',
      action: () => handleFacebookShare()
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'secondary',
      action: () => handleTwitterShare()
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      color: 'warning',
      action: () => handleEmailShare()
    },
    {
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: 'danger',
      action: () => handleInstagramShare()
    }
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(propertyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleWhatsAppShare = () => {
    const message = customMessage || defaultMessage
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(propertyUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const handleTwitterShare = () => {
    const message = customMessage || `Check out this amazing property: ${property.title} in ${property.location.city}, ${property.location.country}`
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(propertyUrl)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const handleEmailShare = () => {
    const subject = `Check out this property: ${property.title}`
    const body = customMessage || defaultMessage
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
  }

  const handleInstagramShare = () => {
    // Instagram doesn't allow direct URL sharing, so we'll copy the link instead
    handleCopyLink()
    alert('Link copied! You can paste it in your Instagram story or bio.')
  }

  const handleClose = () => {
    setCustomMessage('')
    setCopied(false)
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="lg"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Share2 className="w-6 h-6 text-primary-500" />
                <h2 className="text-xl font-bold">Share Property</h2>
              </div>
              <p className="text-sm text-gray-600">Share this amazing property with friends and family</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Property Preview */}
                <Card>
                  <CardBody className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{`${property.location.city}, ${property.location.country}`}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{property.rating}</span>
                          </div>
                          <span className="text-lg font-bold text-primary-600">
                            ${property.price}/night
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Share URL */}
                <div className="space-y-2">
                  <label className="font-semibold">Property Link</label>
                  <div className="flex gap-2">
                    <Input
                      value={propertyUrl}
                      readOnly
                      startContent={<Link className="w-4 h-4 text-gray-400" />}
                      className="flex-1"
                    />
                    <Button
                      isIconOnly
                      color={copied ? 'success' : 'default'}
                      variant="flat"
                      onPress={handleCopyLink}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  {copied && (
                    <p className="text-sm text-success-600">Link copied to clipboard!</p>
                  )}
                </div>

                {/* Custom Message */}
                <div className="space-y-2">
                  <label className="font-semibold">Custom Message (Optional)</label>
                  <Input
                    placeholder="Add a personal message to share with the link..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500">
                    {customMessage.length}/200 characters
                  </p>
                </div>

                <Divider />

                {/* Share Options */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Share via</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {shareOptions.map((option) => (
                      <Button
                        key={option.name}
                        variant="flat"
                        color={option.color as any}
                        onPress={option.action}
                        className="flex flex-col gap-2 h-20"
                      >
                        {option.icon}
                        <span className="text-xs">{option.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Share Stats (could be real data from backend) */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Share Impact</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary-600">247</p>
                      <p className="text-xs text-gray-600">Times Shared</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary-600">1.2k</p>
                      <p className="text-xs text-gray-600">Views from Shares</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success-600">23</p>
                      <p className="text-xs text-gray-600">Bookings from Shares</p>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Sharing Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Add a personal message to increase engagement</li>
                    <li>• Share in relevant travel or local community groups</li>
                    <li>• Tag friends who might be interested in this location</li>
                    <li>• Share at peak times (evenings and weekends) for better visibility</li>
                  </ul>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                Close
              </Button>
              <Button 
                color="primary" 
                onPress={handleCopyLink}
                startContent={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 