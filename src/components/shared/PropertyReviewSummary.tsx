import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter, Avatar, Button } from '@heroui/react';
import { useTranslation } from '../../lib/stores/translationStore';
import { Property } from '../../interfaces/Property';

interface PropertyReviewSummaryProps {
  property: Property;
  reviewStats: {
    average_rating: number;
    total_reviews: number;
  } | null;
  onWriteReview: () => void;
}

const PropertyReviewSummary: React.FC<PropertyReviewSummaryProps> = ({
  property,
  reviewStats,
  onWriteReview
}) => {
  const { t } = useTranslation(['property', 'common']);

  // Early return if no review stats
  if (!reviewStats) {
    return (
      <Card className="h-full shadow-sm border border-gray-200">
        <CardBody className="py-8 text-center">
          <p className="text-gray-500">{t('review.reviews.noReviews', 'No reviews available')}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="justify-between">
        <div className="flex gap-5">
          <Avatar
            isBordered
            radius="full"
            size="md"
            src={property.images?.[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(property.title || 'Property')}&background=3B82F6&color=fff`}
          />
          <div className="flex flex-col gap-1 items-start justify-center">
            <h4 className="text-small font-semibold leading-none text-gray-900 truncate max-w-[200px]">
              {property.title || t('property.defaultTitle', 'Property')}
            </h4>
            <h5 className="text-small tracking-tight text-gray-600">
              {reviewStats.average_rating.toFixed(1)}{t('common.symbols.percent', '%')}
            </h5>
          </div>
        </div>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-gray-600 flex-1">
        <p className="line-clamp-4">{property.description || t('property.defaultDescription', 'Beautiful property with amazing amenities and great location.')}</p>
        <span className="pt-2 flex flex-col items-start gap-2">
          <span className="flex items-center gap-1">
            <Star className="size-4 text-main" />
            {t('review.reviews.averageRating', { rating: reviewStats.average_rating.toFixed(1) })}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="size-4 text-main" />
            <span>{t('review.reviews.totalReviews', { count: reviewStats.total_reviews })}</span>
          </span>
        </span>
        
        {/* Write Review Button */}
        <div className="mt-4 flex justify-start">
          <Button
            className="bg-main text-white hover:bg-main/90"
            radius="md"
            size="sm"
            variant="solid"
            onPress={onWriteReview}
          >
            {t('review.createReview')}
          </Button>
        </div>
      </CardBody>
      <CardFooter className="gap-3">
        <div className="flex gap-1">
          <p className="font-semibold text-gray-600 text-small">
            {reviewStats.average_rating.toFixed(1)}
          </p>
          <p className="text-sm text-gray-600">{t('review.reviews.rating')}</p>
        </div>
        <div className="flex gap-1">
          <p className="font-semibold text-gray-600 text-small">
            {reviewStats.total_reviews}
          </p>
          <p className="text-sm text-gray-600">{t('review.reviews.reviews')}</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PropertyReviewSummary;
