import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, MapPin, X, AlertCircle, RefreshCw } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { HomePagePropertyCard, PropertyCardSkeleton, PageBanner } from '../components/shared';
import { useSearchFeed } from '../hooks/useSearchFeed';
import { useAuthStore } from '../lib/stores/authStore';
import { usePropertyStore } from '../lib/stores/propertyStore';
import { Property } from '../interfaces';
import { Button, Input, Chip, Select, SelectItem } from '@heroui/react';
import toast from 'react-hot-toast';
import { SearchFilters, MapToggle, PropertiesMap } from '../components/features/search';
import { getBannerConfig } from '../utils/bannerConfig';
import { useTranslation } from '../lib/stores/translationStore';

import { SearchPageProps } from '../interfaces';

const SearchPage: React.FC<SearchPageProps> = ({ onPageChange }) => {
  const { t } = useTranslation(['search', 'property', 'common'])
  const navigate = useNavigate();
  const { setSelectedProperty } = usePropertyStore();
  const [hasSearched, setHasSearched] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false); // filter visibility state
  
  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuthStore();

  // Use our search feed hook
  const {
    searchResults,
    searchLoading,
    searchError,
    isLoadingMore,
    hasNextPage,
    totalResults,
    activeFilters,
    activeFiltersCount,
    sortBy,
    performSearch,
    loadMoreResults,
    handleLikeProperty,
    handlePropertyView
  } = useSearchFeed();

  console.log('🔍 SearchPage rendered', {
    resultsCount: searchResults?.length || 0,
    searchLoading,
    hasNextPage,
    totalResults,
    activeFiltersCount,
    sortBy,
    view,
    timestamp: new Date().toISOString()
  });

  // Infinite scroll implementation (only for list view)
  useEffect(() => {
    if (view === 'map') return; // Disable infinite scroll in map view
    if (!loadMoreRef.current || !hasNextPage || isLoadingMore || searchLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('♾️ Search infinite scroll triggered');
          loadMoreResults();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasNextPage, isLoadingMore, searchLoading, loadMoreResults, view]);

  // Handle property interactions
  const handleLike = useCallback((propertyId: string) => {
    console.log('❤️ Like button clicked for property:', propertyId);
    handleLikeProperty(propertyId);
  }, [handleLikeProperty]);

  const handlePropertyClick = useCallback((property: Property) => {
    console.log('🏠 Property clicked:', property.title);
    handlePropertyView(property.id);
    setSelectedProperty(property); // Set in Zustand store
    navigate(`/properties/${property.id}`);
  }, [handlePropertyView, setSelectedProperty, navigate]);

  // Handler to use for filter search (auto-hide filters after search)
  const handleFilterSearch = () => {
    setHasSearched(true);
    setShowFilters(false); // auto-hide filters after search
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Page Header with Banner */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
        <PageBanner
          backgroundImage={getBannerConfig('search').image}
          title={t('search.findProperties')}
          subtitle={t('search.useFiltersToFind', { count: totalResults > 0 ? Number(totalResults) : 1000 })}
          imageAlt={t('common.pageBanner.search')}
          overlayOpacity={getBannerConfig('search').overlayOpacity}
          height={getBannerConfig('search').height}
        />
      </div>

      {/* Filter Toggle Button */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-2 flex justify-end">
        <Button
          color="primary"
          variant="solid"
          onPress={() => setShowFilters((prev) => !prev)}
          className="w-full sm:w-auto bg-primary-500 text-white hover:bg-primary-600"
        >
          {showFilters ? t('search.hideFilters') : t('search.showFilters')}
        </Button>
      </div>

      {/* Search Filters */}
      {showFilters && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
          <SearchFilters onSearch={handleFilterSearch} />
        </div>
      )}

      {/* Results Header - Only show when search has been performed */}
      {hasSearched && activeFiltersCount > 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {totalResults > 0 ? t('search.propertiesFound', { count: totalResults }) : t('search.searchResults')}
            </h2>
            <div className="flex items-center gap-4">
              {!searchLoading && totalResults > 0 && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <span>{t('search.showingResults', { 
                    showing: Math.min((searchResults?.length || 0), totalResults), 
                    total: totalResults 
                  })}</span>
                </div>
              )}
            </div>
          </div>
          {/* Always show MapToggle when there are results */}
          {hasSearched && searchResults && searchResults.length > 0 && (
            <div className="flex justify-end mt-2">
              <MapToggle
                view={view}
                onViewChange={setView}
                // Removed md:hidden so it's always visible
              />
            </div>
          )}
        </div>
      )}

      {/* Error State - Only show when search has been performed */}
      {hasSearched && activeFiltersCount > 0 && searchError && !searchLoading && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              {t('property.messages.failedToLoad')}
            </h3>
            <p className="text-red-700 mb-4">
              {searchError}
            </p>
            <Button
              color="primary"
              variant="solid"
              onPress={() => performSearch()}
              startContent={<RefreshCw className="w-4 h-4" />}
            >
              {t('common.buttons.tryAgain')}
            </Button>
          </div>
        </div>
      )}

      {/* Results Display - Only show when search has been performed */}
      {hasSearched && !searchLoading && searchResults && searchResults.length > 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          {view === 'list' ? (
            // List View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((property) => (
                <HomePagePropertyCard
                  key={property.id}
                  property={property}
                  onLike={handleLike}
                  onClick={() => handlePropertyClick(property)}
                />
              ))}
            </div>
          ) : (
            // Map View
            <PropertiesMap
              properties={searchResults}
              onPropertyClick={handlePropertyClick}
              className="w-full"
              height="calc(100vh - 300px)"
            />
          )}
        </div>
      )}

      {/* Loading State - Only show when search is in progress */}
      {hasSearched && searchLoading && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <PropertyCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* No Results State - Only show when search has been performed */}
      {hasSearched && !searchLoading && (!searchResults || searchResults.length === 0) && activeFiltersCount > 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('property.messages.noProperties')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('search.tryAdjustingFilters')}
            </p>
          </div>
        </div>
      )}

      {/* Initial State - Show when no search has been performed */}
      {!hasSearched && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t('search.readyToFind')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('search.useFiltersToStart')}
            </p>
          </div>
        </div>
      )}

        {/* Load More Trigger - Only show in list view */}
        {view === 'list' && hasSearched && hasNextPage && !searchLoading && !searchError && (
          <div
            ref={loadMoreRef}
            className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center p-6"
          >
            <PropertyCardSkeleton />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 