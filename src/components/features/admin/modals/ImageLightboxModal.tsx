import React from 'react'
import { Modal, ModalContent, ModalBody } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
import { ImageLightboxModalProps } from '../../../interfaces/Component'

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  currentImageIndex,
  prevImage,
  nextImage
}) => {
  const { t } = useTranslation('admin')

  return (
  <Modal isOpen={isOpen} onClose={onClose} size="4xl">
    <ModalContent>
      <ModalBody className="p-0">
        {selectedProperty && (
          <div className="relative">
            <img
              src={selectedProperty.images[currentImageIndex]}
              alt={t('imageLightboxModal.altText', { index: currentImageIndex + 1 })}
              className="w-full h-[70vh] object-contain bg-black"
            />
            {selectedProperty.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage} 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label={t('imageLightboxModal.navigation.previous')}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextImage} 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                  aria-label={t('imageLightboxModal.navigation.next')}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {t('imageLightboxModal.counter', { current: currentImageIndex + 1, total: selectedProperty.images.length })}
            </div>
          </div>
        )}
      </ModalBody>
    </ModalContent>
  </Modal>
  )
}

export default ImageLightboxModal 