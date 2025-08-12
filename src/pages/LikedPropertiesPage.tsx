import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import PropertyCard from '../components/shared/PropertyCard';
import { PropertyCardSkeleton } from '../components/shared/LoadingSkeleton';
import { PageBanner } from '../components/shared';
import { LikedPropertiesPageProps, Property } from '../interfaces';
import { usePropertyStore } from '../lib/stores/propertyStore';
import { useHomeFeed } from '../hooks/useHomeFeed';
import { usePropertyLike } from '../hooks/usePropertyLike';
import { getBannerConfig } from '../utils/bannerConfig';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const LikedPropertiesPage: React.FC<LikedPropertiesPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['property'])
  const navigate = useNavigate();
  const { properties, likedPropertyIds, likedProperties, isLikeLoading, setSelectedProperty } = usePropertyStore();
  const { fetchLikedProperties } = usePropertyLike();

  useEffect(() => {
    fetchLikedProperties();
  }, [fetchLikedProperties]);

  const likedList = (likedProperties.length > 0 ? likedProperties : properties.filter(p => likedPropertyIds.includes(p.id)))
    .map(p => ({
      ...p,
      id: p.id || (p as any).property_id, // Type-safe fallback for property_id
    }));

  const handleLike = (propertyId: string) => {
    console.log('Unliked property:', propertyId);
    // TODO: Implement unlike functionality
  };

  const handleShare = (property: Property) => {
    console.log('Share property:', property.title);
    // TODO: Implement share functionality
  };

  const handleBook = (property: Property) => {
    console.log('Book property:', property.title);
    // TODO: Implement booking functionality
  };

  const handlePropertyClick = (property: Property | any) => {
    const resolvedId = property.id ?? property.property_id;
    console.log('View property:', property, 'resolvedId:', resolvedId);
    if (!resolvedId) {
      toast.error('Property ID is missing. Cannot open details.');
      console.error('Property object missing id and property_id:', property);
      return;
    }
    // handlePropertyView(resolvedId);
    // Ensure we store a property with a valid id in state
    const normalizedProperty = { ...property, id: resolvedId } as Property;
    setSelectedProperty(normalizedProperty);
    navigate(`/properties/${resolvedId}`);
  };

  return (
    <>
      {/* Header Banner */}
      <div className="col-span-full mb-6">
        <PageBanner
          backgroundImage={getBannerConfig('likedProperties').image}
          title={t('property.likedProperties')}
          subtitle={t('property.favoritePlaces')}
          imageAlt={getBannerConfig('likedProperties').alt}
          overlayOpacity={getBannerConfig('likedProperties').overlayOpacity}
          height={getBannerConfig('likedProperties').height}
          className="mb-8"
        >
          <Heart className="w-6 h-6 text-red-400 fill-current" />
        </PageBanner>
      </div>

      {/* Properties Grid */}
      <div className="col-span-full">
        {isLikeLoading ? (
          // Loading Skeleton Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : likedList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedList.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                variant="feed"
                onLike={handleLike}
                onShare={handleShare}
                onBook={handleBook}
                onClick={handlePropertyClick}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('property.noLikedProperties')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('property.startExploringAndLike')}
            </p>
            <button 
              onClick={() => onPageChange?.('home')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('property.exploreProperties')}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default LikedPropertiesPage; 