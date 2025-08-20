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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Dancing Script, cursive' }}>
            {translatedTitle}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{property.rating}</span>
              <span>({property.review_count} reviews)</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{`${property.location.city}, ${property.location.country}`}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            ${property.price}
            <span className="text-base font-normal text-gray-600 ml-1">/ {t('night')}</span>
          </div>
        </div>
      </div>

      {/* Property Stats */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
          <Users className="w-4 h-4 text-gray-700" />
          <span className="text-gray-900 font-medium text-sm">{property.max_guests} {t('guests')}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
          <Bed className="w-4 h-4 text-gray-700" />
          <span className="text-gray-900 font-medium text-sm">{property.bedrooms} {t('bedrooms')}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
          <Bath className="w-4 h-4 text-gray-700" />
          <span className="text-gray-900 font-medium text-sm">{property.bathrooms} {t('bathrooms')}</span>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <p className="text-gray-700 leading-relaxed">
          {translatedDescription}
        </p>
      </div>
    </div>
  );
};

export default PropertyHeader;
