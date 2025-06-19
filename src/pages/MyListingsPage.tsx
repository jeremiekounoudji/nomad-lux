import React, { useState } from 'react'
import { Home, Plus, Eye, Edit, Trash2, Star, Calendar, DollarSign, Filter } from 'lucide-react'
import { Card, CardBody, CardHeader, Chip, Button, Select, SelectItem, Avatar, Tabs, Tab, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'
import MainLayout from '../components/layout/MainLayout'
import PropertyCard from '../components/shared/PropertyCard'
import PropertySubmissionForm from '../components/features/property/PropertySubmissionForm'
import { mockProperties, Property } from '../lib/mockData'
import { PropertyStatsModal } from '../components/shared'

import { MyListingsPageProps, ListingStats } from '../interfaces'

// Mock user's listings (properties owned by current user)
const mockUserListings: Property[] = [
  {
    ...mockProperties[0],
    id: 'user-1',
    title: 'My Luxury Beachfront Villa',
    description: 'My beautiful beachfront villa with stunning ocean views and modern amenities.',
  },
  {
    ...mockProperties[2],
    id: 'user-2', 
    title: 'My Cozy Mountain Cabin',
    description: 'A peaceful retreat in the mountains, perfect for nature lovers.',
  },
  {
    ...mockProperties[1],
    id: 'user-3',
    title: 'My Urban Loft',
    description: 'Modern loft in the heart of the city with great amenities.',
  },
  {
    ...mockProperties[3],
    id: 'user-4',
    title: 'My Countryside Villa',
    description: 'Peaceful villa surrounded by nature and tranquility.',
  }
]



const mockListingStats: Record<string, ListingStats> = {
  'user-1': {
    views: 1247,
    bookings: 23,
    revenue: 12450,
    rating: 4.9,
    status: 'active'
  },
  'user-2': {
    views: 856,
    bookings: 15,
    revenue: 7800,
    rating: 4.7,
    status: 'active'
  },
  'user-3': {
    views: 432,
    bookings: 8,
    revenue: 3200,
    rating: 4.5,
    status: 'pending'
  },
  'user-4': {
    views: 234,
    bookings: 3,
    revenue: 1500,
    rating: 4.2,
    status: 'paused'
  }
}

const MyListingsPage: React.FC<MyListingsPageProps> = ({ onPageChange }) => {
  const [selectedTab, setSelectedTab] = useState<string>('all')
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null)
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null)
  const [propertyForStats, setPropertyForStats] = useState<Property | null>(null)
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isStatsOpen, onOpen: onStatsOpen, onClose: onStatsClose } = useDisclosure()
  
  const filteredListings = mockUserListings.filter(listing => 
    selectedTab === 'all' || mockListingStats[listing.id]?.status === selectedTab
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'pending': return 'warning'
      case 'paused': return 'secondary'
      case 'rejected': return 'danger'
      default: return 'default'
    }
  }

  const totalRevenue = Object.values(mockListingStats).reduce((sum, stats) => sum + stats.revenue, 0)
  const totalBookings = Object.values(mockListingStats).reduce((sum, stats) => sum + stats.bookings, 0)
  const totalViews = Object.values(mockListingStats).reduce((sum, stats) => sum + stats.views, 0)
  const avgRating = Object.values(mockListingStats).reduce((sum, stats) => sum + stats.rating, 0) / Object.values(mockListingStats).length

  const handleEdit = (property: Property) => {
    setPropertyToEdit(property)
    onEditOpen()
  }

  const handleDelete = (property: Property) => {
    setPropertyToDelete(property)
    onDeleteOpen()
  }

  const confirmDelete = () => {
    if (propertyToDelete) {
      console.log('Deleting property:', propertyToDelete.title)
      // TODO: Implement actual delete functionality
      onDeleteClose()
      setPropertyToDelete(null)
    }
  }

  const handleViewStats = (property: Property) => {
    setPropertyForStats(property)
    onStatsOpen()
  }

  const handleAddListing = () => {
    if (onPageChange) {
      onPageChange('create')
    }
  }

  const stats = {
    all: mockUserListings.length,
    active: mockUserListings.filter(l => mockListingStats[l.id]?.status === 'active').length,
    pending: mockUserListings.filter(l => mockListingStats[l.id]?.status === 'pending').length,
    paused: mockUserListings.filter(l => mockListingStats[l.id]?.status === 'paused').length,
    rejected: mockUserListings.filter(l => mockListingStats[l.id]?.status === 'rejected').length
  }

  return (
    <>
      <MainLayout currentPage="listings" onPageChange={onPageChange}>
        <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-6">
          {/* Banner Header */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-lg mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-2">My Listings</h1>
              <p className="text-primary-100 text-lg mb-4">Manage your properties and track performance</p>
              <Button
                color="secondary"
                startContent={<Plus className="w-4 h-4" />}
                className="bg-white/20 border-white/20 text-white hover:bg-white/30"
                onPress={handleAddListing}
              >
                Add Listing
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="w-full">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary-500",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-primary-600"
              }}
            >
              <Tab key="all" title={`All (${stats.all})`} />
              <Tab key="active" title={`Active (${stats.active})`} />
              <Tab key="pending" title={`Pending (${stats.pending})`} />
              <Tab key="paused" title={`Paused (${stats.paused})`} />
              <Tab key="rejected" title={`Rejected (${stats.rejected})`} />
            </Tabs>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          filteredListings.map((listing) => {
            const stats = mockListingStats[listing.id]
            return (
              <div key={listing.id} className="col-span-1">
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  {/* Property Image */}
                  <div className="relative">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Chip 
                        color={getStatusColor(stats.status)}
                        variant="solid"
                        size="sm"
                        className="text-white font-medium"
                      >
                        {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}
                      </Chip>
                    </div>
                  </div>

                  <CardBody className="p-4">
                    {/* Property Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                          {listing.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {listing.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{stats.rating}</span>
                          <span className="text-sm text-gray-500">({listing.reviewCount} reviews)</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm font-bold text-secondary-600">{stats.views}</p>
                          <p className="text-xs text-gray-500">Views</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-600">{stats.bookings}</p>
                          <p className="text-xs text-gray-500">Bookings</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary-600">${stats.revenue}</p>
                          <p className="text-xs text-gray-500">Revenue</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="secondary"
                          startContent={<Eye className="w-4 h-4" />}
                          onPress={() => handleViewStats(listing)}
                          className="flex-1"
                        >
                          Stats
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<Edit className="w-4 h-4" />}
                          onPress={() => handleEdit(listing)}
                          className="flex-1"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          startContent={<Trash2 className="w-4 h-4" />}
                          onPress={() => handleDelete(listing)}
                          className="flex-1"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )
          })
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {selectedTab === 'all' ? '' : selectedTab} listings
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedTab === 'all' && "You haven't created any listings yet."}
              {selectedTab === 'active' && "You don't have any active listings."}
              {selectedTab === 'pending' && "You don't have any pending listings."}
              {selectedTab === 'paused' && "You don't have any paused listings."}
              {selectedTab === 'rejected' && "You don't have any rejected listings."}
            </p>
            <Button
              color="primary"
              startContent={<Plus className="w-4 h-4" />}
              onPress={handleAddListing}
            >
              Create Your First Listing
            </Button>
          </div>
        )}
      </MainLayout>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Delete Listing</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </ModalHeader>
              <ModalBody>
                {propertyToDelete && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <img
                        src={propertyToDelete.images[0]}
                        alt={propertyToDelete.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">{propertyToDelete.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {propertyToDelete.description}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Are you sure you want to delete this listing? This will permanently remove the property from your listings and cannot be undone.
                    </p>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="danger" onPress={confirmDelete}>
                  Delete Listing
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Listing Modal */}
      <Modal 
        isOpen={isEditOpen} 
        onClose={onEditClose}
        size="5xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <h2 className="text-xl font-bold">Edit Listing</h2>
                {propertyToEdit && (
                  <p className="text-sm text-gray-600">Update your property details</p>
                )}
              </ModalHeader>
              <ModalBody>
                {propertyToEdit && (
                  <div className="space-y-6">
                    <PropertySubmissionForm 
                      initialData={propertyToEdit}
                      isEditMode={true}
                    />
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Property Stats Modal */}
      {propertyForStats && (
        <PropertyStatsModal
          isOpen={isStatsOpen}
          onClose={onStatsClose}
          property={propertyForStats}
          stats={mockListingStats[propertyForStats.id]}
        />
      )}
    </>
  )
}

export default MyListingsPage 