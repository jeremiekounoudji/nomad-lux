import React from 'react';
import { Star, MapPin, Users, Bed, Bath } from 'lucide-react';
import { useTranslation } from '../../lib/stores/translationStore';
import { Property } from '../../interfaces/Property';

interface PropertyHeaderProps {
  property: Property;
  translatedTitle: string;
  translatedDescription: string;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  property,
  translatedTitle,
  translatedDescription
}) => {
  const { t } = useTranslation('property');

  return (
    <div className="mb-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl" style={{ fontFamily: 'Dancing Script, cursive' }}>
            {translatedTitle}
          </h1>
          <div className="flex flex-col gap-3 text-gray-600 sm:flex-row sm:items-center">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{property.rating}</span>
              <span>({property.review_count} {t('labels.reviews')})</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="size-4" />
              <span>{`${property.location.city}, ${property.location.country}`}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {property.currency} {property.price}
            <span className="ml-1 text-base font-normal text-gray-600">/ {t('labels.night')}</span>
          </div>
        </div>
      </div>

      {/* Property Stats */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <Users className="size-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-900">{property.max_guests} {t('guests')}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <Bed className="size-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-900">{property.bedrooms} {t('bedrooms')}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
          <Bath className="size-4 text-gray-700" />
          <span className="text-sm font-medium text-gray-900">{property.bathrooms} {t('bathrooms')}</span>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="leading-relaxed text-gray-700">
          {translatedDescription}
        </p>
      </div>
    </div>
  );
};

export default PropertyHeader;
