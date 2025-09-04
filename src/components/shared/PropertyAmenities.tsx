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
  Car,
  Wind,
  Home
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Divider, Chip } from '@heroui/react';
import { useTranslation } from '../../lib/stores/translationStore';

interface PropertyAmenitiesProps {
  amenities: string[];
  amenityTranslations: { [key: string]: string };
}

const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({
  amenities,
  amenityTranslations
}) => {
  const { t } = useTranslation(['property', 'amenities']);

  const getAmenityIcon = (amenity: string) => {
    const amenityMap: { [key: string]: React.ReactNode } = {
      'wifi': <Wifi className="size-3 sm:size-4" />,
      'tv': <Tv className="size-3 sm:size-4" />,
      'kitchen': <Utensils className="size-3 sm:size-4" />,
      'air_conditioning': <Wind className="size-3 sm:size-4" />,
      'heating': <Flame className="size-3 sm:size-4" />,
      'washer': <Shirt className="size-3 sm:size-4" />,
      'dryer': <Shirt className="size-3 sm:size-4" />,
      'gym': <Dumbbell className="size-3 sm:size-4" />,
      'pool': <Pool className="size-3 sm:size-4" />,
      'parking': <Car className="size-3 sm:size-4" />,
      'elevator': <DoorClosed className="size-3 sm:size-4" />,
      'coffee_maker': <Coffee className="size-3 sm:size-4" />,
      'workspace': <Home className="size-3 sm:size-4" />,
      'pet_friendly': <PawPrint className="size-3 sm:size-4" />,
      'baby_friendly': <Baby className="size-3 sm:size-4" />,
      'garden_view': <TreePine className="size-3 sm:size-4" />
    }
    return amenityMap[amenity.toLowerCase()] || <CheckCircle2 className="size-3 sm:size-4" />
  };

  return (
    <Card className="max-w-full h-full">
      <CardHeader className="flex gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-main/10 sm:size-12">
          <Home className="size-6 text-main sm:size-6" />
        </div>
        <div className="flex flex-col flex-1 text-left">
          <p className="text-md font-semibold sm:text-lg">{t('property.amenities.title')}</p>
          <p className="text-small text-default-500 sm:text-sm">{t('amenities.count', { count: amenities.length })}</p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="px-4 py-3 sm:px-6 sm:py-4 flex-1">
        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity, index) => (
            <Chip
              key={index}
              startContent={getAmenityIcon(amenity)}
              variant="flat"
              color="default"
              size="sm"
              className="cursor-default text-xs sm:text-sm"
            >
              {amenityTranslations[amenity] || amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Chip>
          ))}
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="px-4 py-3 sm:px-6 sm:py-4">
        <p className="text-xs text-default-500 sm:text-sm">
          {t('amenities.footer.description', 'All amenities are included in your stay. Contact the host if you need specific information about any amenity.')}
        </p>
      </CardFooter>
    </Card>
  );
};

export default PropertyAmenities;
