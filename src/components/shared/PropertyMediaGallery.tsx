import React from 'react';
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon } from 'lucide-react';
import { Property } from '../../interfaces/Property';
import { useTranslation } from '../../lib/stores/translationStore';

interface PropertyMediaGalleryProps {
  property: Property;
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  mediaType: 'image' | 'video';
  setMediaType: (type: 'image' | 'video') => void;
  currentVideoIndex: number;
  setCurrentVideoIndex: (index: number) => void;
  nextMedia: () => void;
  prevMedia: () => void;
}

const PropertyMediaGallery: React.FC<PropertyMediaGalleryProps> = ({
  property,
  currentImageIndex,
  setCurrentImageIndex,
  mediaType,
  setMediaType,
  currentVideoIndex,
  setCurrentVideoIndex,
  nextMedia,
  prevMedia
}) => {
  const { t } = useTranslation('property');
  
  // Combine all media for the counter
  const allMedia = [...(property?.images || []), ...(property?.videos || [])];
  const currentOverallIndex = mediaType === 'image' 
    ? currentImageIndex 
    : (property?.images?.length || 0) + currentVideoIndex;

  return (
    <div className="relative mb-8">
      <div className="relative h-64 overflow-hidden rounded-xl sm:h-80 lg:h-96">
        {mediaType === 'image' ? (
          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="size-full object-cover"
          />
        ) : (
          <video
            src={property.videos[currentVideoIndex]}
            className="size-full object-cover"
            controls
            autoPlay
            playsInline
          />
        )}
        
        {/* Navigation Buttons */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
            >
              <ChevronLeft className="size-5 text-gray-700" />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
            >
              <ChevronRight className="size-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Media Counter */}
        <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
          {currentOverallIndex + 1} / {allMedia.length}
        </div>

        {/* Media Type Indicator */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <button 
            onClick={() => {
              if (property.images.length > 0) {
                setMediaType('image')
                setCurrentImageIndex(0)
              }
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all ${
              mediaType === 'image' && property.images.length > 0
                ? 'bg-primary-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
            disabled={property.images.length === 0}
          >
            <ImageIcon className="size-4" />
            {t('labels.photos')} ({property.images.length})
          </button>
          <button 
            onClick={() => {
              if (property.videos.length > 0) {
                setMediaType('video')
                setCurrentVideoIndex(0)
              }
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all ${
              mediaType === 'video' && property.videos.length > 0
                ? 'bg-primary-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
            disabled={property.videos.length === 0}
          >
            <Play className="size-4" />
            {t('labels.videos')} ({property.videos.length})
          </button>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {property.images.map((image, index) => (
          <button
            key={`img-${index}`}
            onClick={() => {
              setMediaType('image')
              setCurrentImageIndex(index)
            }}
            className={`h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-20 ${
              mediaType === 'image' && index === currentImageIndex 
                ? 'border-primary-500' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img src={image} alt="" className="size-full object-cover" />
          </button>
        ))}
        {property.videos.map((video, index) => (
          <button
            key={`vid-${index}`}
            onClick={() => {
              setMediaType('video')
              setCurrentVideoIndex(index)
            }}
            className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all sm:h-16 sm:w-20 ${
              mediaType === 'video' && index === currentVideoIndex 
                ? 'border-primary-500' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <video src={video} className="size-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="size-6 text-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PropertyMediaGallery;
