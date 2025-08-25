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
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden rounded-xl">
        {mediaType === 'image' ? (
          <img
            src={property.images[currentImageIndex]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={property.videos[currentVideoIndex]}
            className="w-full h-full object-cover"
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Media Counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
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
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all ${
              mediaType === 'image' && property.images.length > 0
                ? 'bg-primary-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
            disabled={property.images.length === 0}
          >
            <ImageIcon className="w-4 h-4" />
            {t('labels.photos')} ({property.images.length})
          </button>
          <button 
            onClick={() => {
              if (property.videos.length > 0) {
                setMediaType('video')
                setCurrentVideoIndex(0)
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-lg transition-all ${
              mediaType === 'video' && property.videos.length > 0
                ? 'bg-primary-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
            disabled={property.videos.length === 0}
          >
            <Play className="w-4 h-4" />
            {t('labels.videos')} ({property.videos.length})
          </button>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
        {property.images.map((image, index) => (
          <button
            key={`img-${index}`}
            onClick={() => {
              setMediaType('image')
              setCurrentImageIndex(index)
            }}
            className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
              mediaType === 'image' && index === currentImageIndex 
                ? 'border-primary-500' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img src={image} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
        {property.videos.map((video, index) => (
          <button
            key={`vid-${index}`}
            onClick={() => {
              setMediaType('video')
              setCurrentVideoIndex(index)
            }}
            className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden border-2 transition-all ${
              mediaType === 'video' && index === currentVideoIndex 
                ? 'border-primary-500' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <video src={video} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play className="w-6 h-6 text-white" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PropertyMediaGallery;
