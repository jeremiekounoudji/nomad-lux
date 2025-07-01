import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Search, Filter, SlidersHorizontal, MapPin, X, AlertCircle, RefreshCw } from 'lucide-react'
import MainLayout from '../components/layout/MainLayout'
import { HomePagePropertyCard, PropertyCardSkeleton } from '../components/shared'
import PropertyDetailPage from './PropertyDetailPage'
import { useSearchFeed } from '../hooks/useSearchFeed'
import { useAuthStore } from '../lib/stores/authStore'
import { Property } from '../interfaces'
import { Button, Input, Chip, Select, SelectItem } from '@heroui/react'
import toast from 'react-hot-toast'
import { SearchFilters } from '../components/features/search'

import { SearchPageProps } from '../interfaces'

const SearchPage: React.FC<SearchPageProps> = ({ onPageChange }) => {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Infinite scroll ref
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const { isAuthenticated } = useAuthStore()

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
  } = useSearchFeed()

  console.log('🔍 SearchPage rendered', {
    resultsCount: searchResults?.length || 0,
    searchLoading,
    hasNextPage,
    totalResults,
    activeFiltersCount,
    sortBy,
    timestamp: new Date().toISOString()
  })

  // Infinite scroll implementation
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isLoadingMore || searchLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log('♾️ Search infinite scroll triggered')
          loadMoreResults()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [hasNextPage, isLoadingMore, searchLoading, loadMoreResults])

  // Handle property interactions
  const handleLike = useCallback((propertyId: string) => {
    console.log('❤️ Like button clicked for property:', propertyId)
    handleLikeProperty(propertyId)
  }, [handleLikeProperty])

  const handlePropertyClick = useCallback((property: Property) => {
    console.log('🏠 Property clicked:', property.title)
    handlePropertyView(property.id)
    setSelectedProperty(property)
  }, [handlePropertyView])

  const handleBackToSearch = () => {
    setSelectedProperty(null)
  }

  // Show property detail if selected
  if (selectedProperty) {
    return (
      <PropertyDetailPage 
        property={selectedProperty} 
        onBack={handleBackToSearch}
      />
    )
  }

  return (
    <MainLayout currentPage="search" onPageChange={onPageChange}>
      {/* Page Header */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Find Properties</h1>
          <p className="text-gray-600">
            Use filters to find your perfect stay from {totalResults > 0 ? totalResults : 'thousands of'} properties
          </p>
        </div>
      </div>

      {/* Search Filters */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
        <SearchFilters onSearch={() => setHasSearched(true)} />
      </div>

      {/* Results Header - Only show when search has been performed */}
      {hasSearched && activeFiltersCount > 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {totalResults > 0 ? `${totalResults} properties found` : 'Search Results'}
            </h2>
            
            {!searchLoading && totalResults > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Showing {Math.min((searchResults?.length || 0), totalResults)} of {totalResults}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State - Only show when search has been performed */}
      {hasSearched && activeFiltersCount > 0 && searchError && !searchLoading && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Failed to Load Properties
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
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Results Grid - Only show when search has been performed */}
      {hasSearched && !searchLoading && searchResults && searchResults.length > 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {searchResults.map((property) => (
            <HomePagePropertyCard
              key={property.id}
              property={property}
              onLike={handleLike}
              onClick={() => handlePropertyClick(property)}
              // isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}

      {/* Loading State - Only show when search is in progress */}
      {hasSearched && searchLoading && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              No Properties Found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters to find more properties
            </p>
          </div>
        </div>
      )}

      {/* Initial State - Show when no search has been performed */}
      {!hasSearched && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Find Your Perfect Stay?
            </h3>
            <p className="text-gray-600 mb-4">
              Use the filters above to start your search
            </p>
          </div>
        </div>
      )}

      {/* Load More Trigger */}
      {hasSearched && hasNextPage && !searchLoading && !searchError && (
        <div
          ref={loadMoreRef}
          className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center p-6"
        >
          <PropertyCardSkeleton />
        </div>
      )}
    </MainLayout>
  )
}

export default SearchPage 