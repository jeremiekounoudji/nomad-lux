import React from 'react';
import { 
  Wifi, 
  Utensils, 
  CheckCircle2,
  Tv,
  Coffee,
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
      'wifi': <Wifi className="size-5" />,
      'tv': <Tv className="size-5" />,
      'kitchen': <Utensils className="size-5" />,
      'air_conditioning': <Wind className="size-5" />,
      'heating': <Flame className="size-5" />,
      'washer': <Shirt className="size-5" />,
      'dryer': <Shirt className="size-5" />,
      'gym': <Dumbbell className="size-5" />,
      'pool': <Pool className="size-5" />,
      'parking': <Parking className="size-5" />,
      'elevator': <DoorClosed className="size-5" />,
      'coffee_maker': <Coffee className="size-5" />,
      'workspace': <Home className="size-5" />,
      'pet_friendly': <PawPrint className="size-5" />,
      'baby_friendly': <Baby className="size-5" />,
      'garden_view': <TreePine className="size-5" />
    }
    return amenityMap[amenity.toLowerCase()] || <CheckCircle2 className="size-5" />
  };

  return (
    <div className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold">{t('property.amenities.title')}</h2>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((amenity, index) => (
            <div key={index} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
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
