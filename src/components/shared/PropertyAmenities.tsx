import React from 'react';
import { 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  CheckCircle2,
  Tv,
  Coffee,
  Snowflake,
  Flame,
  DoorClosed,
  Shirt,
  Dumbbell,
  Waves as Pool,
  TreeDeciduous as TreePine,
  Dog as PawPrint,
  Baby,
  Car as Parking,
  Wind,
  Home
} from 'lucide-react';
import { useTranslation } from '../../lib/stores/translationStore';

interface PropertyAmenitiesProps {
  amenities: string[];
  amenityTranslations: { [key: string]: string };
}

const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({
  amenities,
  amenityTranslations
}) => {
  const { t } = useTranslation('property');

  const getAmenityIcon = (amenity: string) => {
    const amenityMap: { [key: string]: React.ReactNode } = {
      'wifi': <Wifi className="w-5 h-5" />,
      'tv': <Tv className="w-5 h-5" />,
      'kitchen': <Utensils className="w-5 h-5" />,
      'air_conditioning': <Wind className="w-5 h-5" />,
      'heating': <Flame className="w-5 h-5" />,
      'washer': <Shirt className="w-5 h-5" />,
      'dryer': <Shirt className="w-5 h-5" />,
      'gym': <Dumbbell className="w-5 h-5" />,
      'pool': <Pool className="w-5 h-5" />,
      'parking': <Parking className="w-5 h-5" />,
      'elevator': <DoorClosed className="w-5 h-5" />,
      'coffee_maker': <Coffee className="w-5 h-5" />,
      'workspace': <Home className="w-5 h-5" />,
      'pet_friendly': <PawPrint className="w-5 h-5" />,
      'baby_friendly': <Baby className="w-5 h-5" />,
      'garden_view': <TreePine className="w-5 h-5" />
    }
    return amenityMap[amenity.toLowerCase()] || <CheckCircle2 className="w-5 h-5" />
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">{t('property.amenities.title')}</h2>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              {getAmenityIcon(amenity)}
              <span className="text-gray-700">
                {amenityTranslations[amenity] || amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyAmenities;
