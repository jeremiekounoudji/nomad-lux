import { ArrowLeft, MapPin, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@heroui/react";
import { City, Property } from "../../../interfaces/Property";
import { PropertyCardSkeleton, CityPropertySkeleton } from "../../shared/LoadingSkeleton";
import CityPropertyCard from "../../shared/CityPropertyCard";
import { useTranslation } from "../../../lib/stores/translationStore";

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
  
  return (
    <>
      {/* City Header */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{t('search.backToHome', { defaultValue: 'Back to Home' })}</span>
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <img
              src={selectedCity.featured_image}
              alt={selectedCity.name}
              className="w-20 h-20 object-cover rounded-xl"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 text-start font-script">
                {selectedCity.name}, {selectedCity.country}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedCity.property_count} {t('search.propertiesAvailable', { defaultValue: 'properties available' })}</span>
                </div>
                <div>
                  <span>{t('search.averagePrice', { defaultValue: 'Average' })} ${selectedCity.average_price}/{t('search.perNight', { defaultValue: 'night' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* City Properties Error State */}
      {cityPropertiesError && !cityPropertiesLoading && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              {t('search.noPropertiesFound', { defaultValue: 'No Properties Found' })}
            </h3>
            <p className="text-red-700 mb-4">{cityPropertiesError}</p>
            <Button
              variant="flat"
              color="primary"
              onPress={() => onRefetch(selectedCity)}
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              {t('search.tryAgain', { defaultValue: 'Try Again' })}
            </Button>
          </div>
        </div>
      )}

      {/* City Properties Grid */}
      {!cityPropertiesError && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
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