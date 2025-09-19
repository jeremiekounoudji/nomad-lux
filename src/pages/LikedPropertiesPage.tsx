import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import PropertyCard from '../components/shared/PropertyCard';
import { PropertyCardSkeleton } from '../components/shared/LoadingSkeleton';
import { PageBanner } from '../components/shared';
import { LikedPropertiesPageProps, Property } from '../interfaces';
import { usePropertyStore } from '../lib/stores/propertyStore';
import { usePropertyLike } from '../hooks/usePropertyLike';
import { getBannerConfig } from '../utils/bannerConfig';
import toast from 'react-hot-toast';
import { useTranslation } from '../lib/stores/translationStore';

const LikedPropertiesPage: React.FC<LikedPropertiesPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['property', 'common'])
  const navigate = useNavigate();
  const { properties, likedPropertyIds, likedProperties, isLikeLoading, setSelectedProperty } = usePropertyStore();
  const { fetchLikedProperties } = usePropertyLike();

  useEffect(() => {
    fetchLikedProperties();
  }, [fetchLikedProperties]);

  const likedList = ((likedProperties?.length || 0) > 0 ? (likedProperties || []) : (properties || []).filter(p => (likedPropertyIds || []).includes(p.id)))
    .map(p => ({
      ...p,
      id: p.id || (p as any).property_id, // Type-safe fallback for property_id
      // Ensure arrays are always defined
      images: p.images || [],
      videos: p.videos || [],
      amenities: p.amenities || [],
      // Ensure host object exists
      host: p.host || {
        id: '',
        name: 'Unknown Host',
        username: '',
        avatar_url: '',
        display_name: 'Unknown Host',
        is_identity_verified: false,
        is_email_verified: false,
        email: '',
        phone: '',
        rating: 0,
        response_rate: 0,
        response_time: '',
        bio: ''
      }
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
      toast.error(t('property.messages.propertyIdMissing'));
      console.error('Property object missing id and property_id:', property);
      return;
    }
    // handlePropertyView(resolvedId);
    // Ensure we store a property with a valid id in state
    const normalizedProperty = { ...property, id: resolvedId } as Property;
    setSelectedProperty(normalizedProperty);
    navigate(`/property/${resolvedId}`);
  };

  return (
          <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Header Banner */}
        <div className="col-span-full mb-6">
        <PageBanner
          backgroundImage={getBannerConfig('likedProperties').image}
          title={t('property.likedProperties')}
          subtitle={t('property.favoritePlaces')}
          imageAlt={t('common.pageBanner.likedProperties')}
          overlayOpacity={getBannerConfig('likedProperties').overlayOpacity}
          height={getBannerConfig('likedProperties').height}
          className="mb-8"
        >
          <Heart className="size-6 fill-current text-red-400" />
        </PageBanner>
      </div>

      {/* Properties Grid */}
      <div className="col-span-full">
        {isLikeLoading ? (
          // Loading Skeleton Grid
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : likedList.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gray-100">
              <Heart className="size-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {t('property.noLikedProperties')}
            </h3>
            <p className="mb-6 text-gray-500">
              {t('property.startExploringAndLike')}
            </p>
            <button 
              onClick={() => onPageChange?.('home')}
              className="rounded-lg bg-primary-600 px-6 py-2 text-white transition-colors hover:bg-primary-700"
            >
              {t('property.exploreProperties')}
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default LikedPropertiesPage; 