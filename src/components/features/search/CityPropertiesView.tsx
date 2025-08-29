import { useEffect } from "react";
import { ArrowLeft, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@heroui/react";
import toast from 'react-hot-toast';
import { City, Property } from "../../../interfaces/Property";
import { CityPropertySkeleton } from "../../shared/LoadingSkeleton";
import CityPropertyCard from "../../shared/CityPropertyCard";
import { useTranslation } from "../../../lib/stores/translationStore";
import { formatPrice } from '../../../utils/currencyUtils'

interface CityPropertiesViewProps {
  selectedCity: City;
  cityProperties: Property[];
  cityPropertiesError: string | null;
  cityPropertiesLoading: boolean;
  onBackToHome: () => void;
  onRefetch: (city: City) => void;
  onLike: (id: string) => void;
  onShare?: (property: Property) => void;
  onPropertyClick: (property: Property) => void;
}

export const CityPropertiesView = ({
  selectedCity,
  cityProperties,
  cityPropertiesError,
  cityPropertiesLoading,
  onBackToHome,
  onRefetch,
  onLike,
  onShare,
  onPropertyClick,
}: CityPropertiesViewProps) => {
  const { t } = useTranslation(['search', 'common']);

  // Show error toast when there's an error
  useEffect(() => {
    if (cityPropertiesError) {
      toast.error(cityPropertiesError)
    }
  }, [cityPropertiesError]);
  
  return (
    <>
      {/* City Header */}
      <div className="col-span-1 mb-6 md:col-span-2 lg:col-span-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="size-5" />
              <span>{t('search.backToHome', { defaultValue: 'Back to Home' })}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <img
              src={selectedCity.featured_image}
              alt={selectedCity.name}
              className="size-20 rounded-xl object-cover"
            />
            <div>
              <h1 className="mb-2 text-start font-script text-3xl font-bold text-gray-900">
                {selectedCity.name}, {selectedCity.country}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <span>{selectedCity.property_count} {t('search.propertiesAvailable', { defaultValue: 'properties available' })}</span>
                </div>
                <div>
                  <span>{t('search.averagePrice', { defaultValue: 'Average' })} {formatPrice(selectedCity.average_price, 'USD')}/{t('search.perNight', { defaultValue: 'night' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City Properties Error State */}
      {cityPropertiesError && !cityPropertiesLoading && (
        <div className="col-span-1 mb-6 md:col-span-2 lg:col-span-3">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 size-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-red-900">
              {t('search.noPropertiesFound', { defaultValue: 'No Properties Found' })}
            </h3>

            <Button
              variant="flat"
              color="primary"
              onPress={() => onRefetch(selectedCity)}
              startContent={<RefreshCw className="size-4" />}
            >
              {t('search.tryAgain', { defaultValue: 'Try Again' })}
            </Button>
          </div>
        </div>
      )}

      {/* City Properties Grid */}
      {!cityPropertiesError && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {cityPropertiesLoading ? (
              // Loading skeletons
              Array(6).fill(null).map((_, index) => (
                <CityPropertySkeleton key={`skeleton-${index}`} />
              ))
            ) : (
              // Actual properties
              cityProperties.map(property => (
                <CityPropertyCard
                  key={property.id}
                  property={property}
                  onLike={onLike}
                  onShare={onShare}
                  onClick={onPropertyClick}
                />
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}; 