import React from 'react';
import { Star, MapPin, Users, Bed, Bath, Home } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Divider, Chip } from '@heroui/react';
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
    <Card className="max-w-full">
      <CardHeader className="flex flex-col justify-start items-start gap-4">
        {/* Icon and Title Section */}
        <div className="flex gap-3 items-start justify-start">
          <div className="flex size-10 items-center justify-center rounded-lg bg-main/10 sm:size-12">
            <Home className="size-5 text-main sm:size-6" />
          </div>
          <div className="flex flex-col flex-1 items-start">
            <h1 className="text-md font-semibold sm:text-lg text-left" style={{ fontFamily: 'Dancing Script, cursive' }}>
              {translatedTitle}
            </h1>
            <p className="text-small text-default-500 sm:text-sm text-left">
              {property.currency} {property.price} / {t('labels.night')}
            </p>
          </div>
        </div>

        {/* Rating and Location in Column Format */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 sm:text-base">{property.rating} ({property.review_count} {t('labels.reviews')})</span>

            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-gray-600" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 sm:text-base">{property.location.city} {property.location.country}</span>

            </div>
          </div>
        </div>
      </CardHeader>
      
      <Divider />
      
      <CardBody className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Chip
            startContent={<Users className="size-3 sm:size-4" />}
            variant="flat"
            color="default"
            size="sm"
            className="cursor-default text-xs sm:text-sm"
          >
            {property.max_guests} {t('guests')}
          </Chip>
          <Chip
            startContent={<Bed className="size-3 sm:size-4" />}
            variant="flat"
            color="default"
            size="sm"
            className="cursor-default text-xs sm:text-sm"
          >
            {property.bedrooms} {t('bedrooms')}
          </Chip>
          <Chip
            startContent={<Bath className="size-3 sm:size-4" />}
            variant="flat"
            color="default"
            size="sm"
            className="cursor-default text-xs sm:text-sm"
          >
            {property.bathrooms} {t('bathrooms')}
          </Chip>
        </div>
      </CardBody>
      
      <Divider />
      
      <CardFooter className="px-4 py-3 sm:px-6 sm:py-4">
        <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
          {translatedDescription}
        </p>
      </CardFooter>
    </Card>
  );
};

export default PropertyHeader;
