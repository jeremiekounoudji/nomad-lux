import React from 'react'
import { Modal, ModalContent, ModalBody } from '@heroui/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../../../../lib/stores/translationStore'
// import { ImageLightboxModalProps } from '../../../interfaces/Component' // Interface not found

interface ImageLightboxModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProperty: any
  currentImageIndex: number
  prevImage: () => void
  nextImage: () => void
}

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
              className="h-[70vh] w-full bg-black object-contain"
            />
            {selectedProperty.images.length > 1 && (
              <>
                <button 
                  onClick={prevImage} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  aria-label={t('imageLightboxModal.navigation.previous')}
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button 
                  onClick={nextImage} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  aria-label={t('imageLightboxModal.navigation.next')}
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
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