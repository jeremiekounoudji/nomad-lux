import React, { useState, useEffect } from 'react'
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
  MapPin,
  Send
} from 'lucide-react'
import { SharePropertyModalProps } from '../../../interfaces/Component'
import { 
  shareContent, 
  createPropertyShareData, 
  createSocialShareUrls, 
  openSocialShare,
  isWebShareSupported 
} from '../../../utils/shareUtils'
import toast from 'react-hot-toast'
import { useTranslation } from '../../../lib/stores/translationStore'

export const SharePropertyModal: React.FC<SharePropertyModalProps> = ({
  isOpen,
  onClose,
  property
}) => {
  const { t } = useTranslation(['property', 'common'])
  const [copied, setCopied] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [webShareSupported, setWebShareSupported] = useState(false)

  // Initialize Web Share API support
  useEffect(() => {
    setWebShareSupported(isWebShareSupported())
  }, [])

  // Generate share data
  const baseShareData = createPropertyShareData(property)
  const shareData = {
    ...baseShareData,
    text: customMessage || baseShareData.text
  }
  const socialUrls = createSocialShareUrls(shareData)

  const shareOptions = [
    {
      name: t('property.share.copyLink'),
      icon: <Copy className="w-5 h-5" />,
      color: 'default',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
      textColor: 'text-gray-700',
      action: () => handleCopyLink()
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'success',
      bgColor: 'bg-green-100 hover:bg-green-200',
      textColor: 'text-green-700',
      action: () => openSocialShare(socialUrls.whatsapp)
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'primary',
      bgColor: 'bg-blue-100 hover:bg-blue-200',
      textColor: 'text-blue-700',
      action: () => openSocialShare(socialUrls.facebook)
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      color: 'secondary',
      bgColor: 'bg-sky-100 hover:bg-sky-200',
      textColor: 'text-sky-700',
      action: () => openSocialShare(socialUrls.twitter)
    },
    {
      name: t('property.share.email'),
      icon: <Mail className="w-5 h-5" />,
      color: 'warning',
      bgColor: 'bg-orange-100 hover:bg-orange-200',
      textColor: 'text-orange-700',
      action: () => window.location.href = socialUrls.email
    },
    {
      name: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      color: 'danger',
      bgColor: 'bg-pink-100 hover:bg-pink-200',
      textColor: 'text-pink-700',
      action: () => handleInstagramShare()
    }
  ]

  const handleNativeShare = async () => {
    const success = await shareContent(shareData, {
      showSuccessToast: true,
      showErrorToast: false
    })
    
    if (success) {
      onClose()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url)
      setCopied(true)
      toast.success(t('property.share.linkCopied'))
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error(t('property.share.copyFailed'))
    }
  }

  const handleInstagramShare = () => {
    handleCopyLink()
    toast.success(t('property.share.instagramCopied'))
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
                <h2 className="text-xl font-bold">{t('property.share.title')}</h2>
              </div>
              <p className="text-sm text-gray-600">{t('property.share.subtitle')}</p>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* Property Preview */}
                <Card className="border border-gray-200">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-4">
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
                            ${property.price}{t('property.labels.perNight')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Native Share Button - Show if supported */}
                {webShareSupported && (
                  <div className="space-y-3">
                    <Button
                      color="primary"
                      size="lg"
                      fullWidth
                      onPress={handleNativeShare}
                      startContent={<Send className="w-5 h-5" />}
                      className="font-semibold"
                    >
                      {t('property.share.quickShare')}
                    </Button>
                    <Divider />
                  </div>
                )}

                {/* Custom Message */}
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700">{t('property.share.customMessageLabel')}</label>
                  <Input
                    placeholder={t('property.share.customMessagePlaceholder')}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    maxLength={280}
                    variant="bordered"
                  />
                  <p className="text-xs text-gray-500">
                    {t('property.share.charactersCount', { count: customMessage.length, max: 280 })}
                  </p>
                </div>

                {/* Share URL */}
                <div className="space-y-2">
                  <label className="font-semibold text-gray-700">{t('property.share.propertyLink')}</label>
                  <div className="flex gap-2">
                    <Input
                      value={shareData.url}
                      readOnly
                      startContent={<Link className="w-4 h-4 text-gray-400" />}
                      className="flex-1"
                      variant="bordered"
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
                    <p className="text-sm text-success-600">✓ {t('property.share.linkCopied')}</p>
                  )}
                </div>

                <Divider />

                {/* Social Share Options */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700">{t('property.share.shareOnSocial')}</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {shareOptions.map((option) => (
                      <button
                        key={option.name}
                        onClick={option.action}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-200 ${option.bgColor} ${option.textColor} hover:scale-105 hover:shadow-md`}
                      >
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          {option.icon}
                        </div>
                        <span className="text-sm font-medium">{option.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sharing Tips */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 {t('property.share.tipsTitle')}</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {t('property.share.tipAddMessage')}</li>
                    <li>• {t('property.share.tipShareGroups')}</li>
                    <li>• {t('property.share.tipTagFriends')}</li>
                  </ul>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={handleClose}>
                {t('common.buttons.close')}
              </Button>
              <Button 
                color="primary" 
                onPress={handleCopyLink}
                startContent={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              >
                {copied ? t('property.share.copied') : t('property.share.copyLink')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
} 