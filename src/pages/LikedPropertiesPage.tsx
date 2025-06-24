import React, { useState } from 'react'
import { Heart, Search } from 'lucide-react'
import { Input } from '@heroui/react'
import MainLayout from '../components/layout/MainLayout'
import PropertyCard from '../components/shared/PropertyCard'
import { mockProperties } from '../lib/mockData'
import { LikedPropertiesPageProps, Property } from '../interfaces'

const LikedPropertiesPage: React.FC<LikedPropertiesPageProps> = ({ onPageChange }) => {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter only liked properties
  const likedProperties = mockProperties.filter(property => property.is_liked)
  
  // Filter by search query
  const filteredProperties = likedProperties.filter(property =>
    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location.country.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLike = (propertyId: string) => {
    console.log('Unliked property:', propertyId)
    // TODO: Implement unlike functionality
  }

  const handleShare = (property: Property) => {
    console.log('Share property:', property.title)
    // TODO: Implement share functionality
  }

  const handleBook = (property: Property) => {
    console.log('Book property:', property.title)
    // TODO: Implement booking functionality
  }

  const handlePropertyClick = (property: Property) => {
    console.log('View property:', property.title)
    // TODO: Navigate to property detail
  }

  return (
    <MainLayout currentPage="liked" onPageChange={onPageChange}>
      <div className="col-span-1 md:col-span-2 lg:col-span-3 mb-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-lg mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold mb-2">Liked Properties</h1>
            <p className="text-primary-100 text-lg mb-4">Your favorite places to stay</p>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <Input
                placeholder="Search your liked properties..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-400" />}
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-full",
                  input: "text-small",
                  inputWrapper: "h-full font-normal text-default-500 bg-white/10 backdrop-blur-sm border-white/20",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        filteredProperties.map((property) => (
          <div key={property.id} className="col-span-1">
            <PropertyCard
              property={property}
              variant="feed"
              onLike={handleLike}
              onShare={handleShare}
              onBook={handleBook}
              onClick={handlePropertyClick}
            />
          </div>
        ))
      ) : (
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No properties found' : 'No liked properties yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Start exploring and like properties to see them here'
              }
            </p>
            {!searchQuery && (
              <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                Explore Properties
              </button>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  )
}

export default LikedPropertiesPage 