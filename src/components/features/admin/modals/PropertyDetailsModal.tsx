import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip, Checkbox, Avatar } from '@heroui/react'
import { CheckCircle, XCircle, Ban } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { formatPrice } from '../../../../utils/currencyUtils'
import { PropertyDetailsModalProps } from '../../../../interfaces/Component'
import { LocationVerificationMap } from '../LocationVerificationMap'

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  reviewChecklist,
  setReviewChecklist,
  allChecked,
  onRejectOpen,
  handleApproveConfirm
}) => {
  const { t } = useTranslation('admin')

  return (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    size="5xl"
    scrollBehavior="inside"
    classNames={{ base: "max-h-[90vh]", body: "py-6" }}
  >
    <ModalContent>
      <ModalHeader>
        {t('propertyDetailsModal.title', { title: selectedProperty?.title })}
      </ModalHeader>
      <ModalBody>
        {selectedProperty && (
          <div className="space-y-6">
            {/* Image Gallery */}
            <div>
              <h4 className="mb-3 font-semibold text-gray-900">{t('propertyDetailsModal.propertyImages')}</h4>
              <div className="grid grid-cols-4 gap-2">
                {selectedProperty.images.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-200 transition-opacity hover:opacity-80"
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="size-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                      <span className="text-lg text-white">{t('propertyDetailsModal.zoom')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location Details with Map */}
            <div>
              <LocationVerificationMap
                property={selectedProperty}
                onVerify={(verified) => {
                  setReviewChecklist(prev => ({ ...prev, location: verified }))
                }}
                className="mb-6"
              />
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('propertyDetailsModal.labels.propertyType')}</label>
                  <p className="text-sm text-gray-900">{selectedProperty.property_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('propertyDetailsModal.labels.location')}</label>
                  <p className="text-sm text-gray-900">{selectedProperty.location.city}, {selectedProperty.location.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('propertyDetailsModal.labels.host')}</label>
                  <div className="flex items-center gap-2">
                    <Avatar name="Host" size="sm" />
                                          <div>
                        <p className="text-sm font-medium text-gray-900">{t('propertyDetailsModal.labels.hostId')} {selectedProperty.host_id}</p>
                        <p className="text-xs text-gray-600">{t('propertyDetailsModal.labels.created')} {new Date(selectedProperty.created_at).toLocaleDateString()}</p>
                      </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('propertyDetailsModal.labels.pricePerNight')}</label>
                  <p className="text-sm text-gray-900">{formatPrice(selectedProperty.price_per_night, selectedProperty.currency || 'USD')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('propertyDetailsModal.labels.capacity')}</label>
                  <p className="text-sm text-gray-900">
                    {selectedProperty.bedrooms} {t('propertyDetailsModal.labels.bed')} • {selectedProperty.bathrooms} {t('propertyDetailsModal.labels.bath')} • {selectedProperty.max_guests} {t('propertyDetailsModal.labels.guests')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('propertyDetailsModal.labels.submitted')}</label>
                  <p className="text-sm text-gray-900">{new Date(selectedProperty.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">{t('propertyDetailsModal.labels.description')}</label>
              <p className="mt-1 text-sm text-gray-900">{selectedProperty.description}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">{t('propertyDetailsModal.labels.amenities')}</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedProperty.amenities.map((amenity: string) => (
                  <Chip key={amenity} size="sm" variant="flat">
                    {amenity}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Review Checklist */}
            <div className="rounded-xl bg-gray-50 p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary-500">
                  <CheckCircle className="size-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{t('propertyDetailsModal.reviewChecklist.title')}</h4>
                  <p className="text-sm text-gray-600">{t('propertyDetailsModal.reviewChecklist.subtitle')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { key: 'title', label: t('propertyDetailsModal.reviewChecklist.items.title'), icon: '📝' },
                  { key: 'description', label: t('propertyDetailsModal.reviewChecklist.items.description'), icon: '📄' },
                  { key: 'images', label: t('propertyDetailsModal.reviewChecklist.items.images'), icon: '📸' },
                  { key: 'location', label: t('propertyDetailsModal.reviewChecklist.items.location'), icon: '📍' },
                  { key: 'price', label: t('propertyDetailsModal.reviewChecklist.items.price'), icon: '💰' },
                  { key: 'amenities', label: t('propertyDetailsModal.reviewChecklist.items.amenities'), icon: '✨' },
                  { key: 'policies', label: t('propertyDetailsModal.reviewChecklist.items.policies'), icon: '📋' }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-lg border-2 p-4 transition-all duration-200 ${
                      reviewChecklist[item.key as keyof typeof reviewChecklist]
                        ? 'border-success-200 bg-success-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                  >
                    <Checkbox
                      isSelected={reviewChecklist[item.key as keyof typeof reviewChecklist]}
                      onValueChange={(checked) => 
                        setReviewChecklist(prev => ({ ...prev, [item.key]: checked }))
                      }
                      classNames={{
                        wrapper: "after:bg-primary-500 before:border-primary-500",
                        icon: "text-white"
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`size-3 rounded-full ${allChecked ? 'bg-success-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium">
                      {t('propertyDetailsModal.reviewChecklist.progress', { 
                        completed: Object.values(reviewChecklist).filter(Boolean).length, 
                        total: 7 
                      })}
                    </span>
                  </div>
                  <div className="h-2 w-32 rounded-full bg-gray-200">
                    <div 
                      className="h-2 rounded-full bg-primary-500 transition-all duration-300"
                      style={{ 
                        width: `${(Object.values(reviewChecklist).filter(Boolean).length / 7) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <div className="flex w-full gap-3">
          <Button variant="flat" onPress={onClose}>{t('propertyDetailsModal.buttons.close')}</Button>
          {selectedProperty?.status === 'pending' && (
            <>
              <Button color="danger" variant="flat" startContent={<XCircle className="size-4" />} onPress={() => { onClose(); onRejectOpen(); }}>{t('propertyDetailsModal.buttons.reject')}</Button>
              <Button color="success" startContent={<CheckCircle className="size-4" />} onPress={() => { if (selectedProperty) { handleApproveConfirm(selectedProperty); onClose(); } }} isDisabled={!allChecked}>{t('propertyDetailsModal.buttons.approveProperty')}</Button>
            </>
          )}
          {selectedProperty?.status === 'approved' && (
            <Button color="warning" variant="flat" startContent={<Ban className="size-4" />} onPress={() => {}}>{t('propertyDetailsModal.buttons.suspendProperty')}</Button>
          )}
        </div>
      </ModalFooter>
    </ModalContent>
      </Modal>
  )
}

export default PropertyDetailsModal 