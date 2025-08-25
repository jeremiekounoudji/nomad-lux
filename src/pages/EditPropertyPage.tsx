import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, CardBody } from '@heroui/react'
import { ArrowLeft, Home, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import MainLayout from '../components/layout/MainLayout'
import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import PropertySubmissionForm from '../components/features/property/PropertySubmissionForm'
import { PropertyEditConfirmationModal } from '../components/shared'
import { useUserListings } from '../hooks/useUserListings'
import { useTranslation } from '../lib/stores/translationStore'
import { convertDatabasePropertyToSubmissionData } from '../utils/propertyUtils'
import { DatabaseProperty, PropertyEditConfirmation } from '../interfaces'
import { ROUTES } from '../router/types'
import { useAuthStore } from '../lib/stores/authStore'
import { usePropertyEditStore } from '../lib/stores/propertyEditStore'

const EditPropertyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['property', 'common'])
  
  console.log('🔧 EditPropertyPage rendered with ID:', id)
  
  // User listings hook
  const {
    updateListing,
    checkEditConfirmation,
    getUserProperty
  } = useUserListings()

  const { user } = useAuthStore()

  // Property edit store
  const { property, setProperty, clearProperty } = usePropertyEditStore()

  const [isFetching, setIsFetching] = useState(false)

  // Component state
  const [editConfirmation, setEditConfirmation] = useState<PropertyEditConfirmation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [hasShownConfirm, setHasShownConfirm] = useState(false)

  // Ensure property is available (fallback fetch if missing)
  useEffect(() => {
    const ensureProperty = async () => {
      if (!id) return

      if (!property && !isFetching) {
        setIsFetching(true)
        const fetched = await getUserProperty(id)
        if (fetched) {
          setProperty(fetched)
        } else {
          toast.error(t('property.messages.propertyNotFound'))
          navigate(ROUTES.MY_LISTINGS)
        }
        setIsFetching(false)
        return
      }

      if (property && !hasShownConfirm) {
        const confirmation = checkEditConfirmation(property)
        if (confirmation.willResetToPending) {
          setEditConfirmation(confirmation)
          setShowConfirmModal(true)
          setHasShownConfirm(true)
        }
      }
    }

    ensureProperty()
  }, [id, property, isFetching, getUserProperty, setProperty, checkEditConfirmation, navigate, t])

  // Clear property from store when component unmounts
  useEffect(() => {
    return () => {
      clearProperty()
    }
  }, [clearProperty])

  const handleConfirmEdit = () => {
    setShowConfirmModal(false)
    // Continue with editing after confirmation
  }

  const handleCancelEdit = () => {
    navigate(ROUTES.MY_LISTINGS)
  }

  const handleEditSubmitSuccess = async (propertyData: any) => {
    if (!property) return

    console.log('📝 Processing edit form data:', propertyData)
    
    setIsSubmitting(true)
    
    try {
      // Convert the form data back to database format and update
      const updates = {
        title: propertyData.title,
        description: propertyData.description,
        price: propertyData.price,
        currency: propertyData.currency,
        location: propertyData.location,
        amenities: propertyData.amenities,
        images: propertyData.images || [],
        videos: propertyData.videos || [],
        propertyType: propertyData.propertyType,
        maxGuests: propertyData.maxGuests,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        cleaningFee: propertyData.cleaningFee,
        serviceFee: propertyData.serviceFee
      }
      
      console.log('📤 Sending updates:', updates)
      
      const result = await updateListing(property.id, updates)
      
      if (result.success) {
        console.log('✅ Property updated successfully')
        toast.success(t('property.messages.updateSuccess'))
        navigate(ROUTES.MY_LISTINGS)
      } else {
        console.error('❌ Update failed:', result.error)
        toast.error(result.error || t('property.messages.updateError'))
      }
    } catch (error) {
      console.error('❌ Error updating property:', error)
      toast.error(t('property.messages.updateError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToListings = () => {
    navigate(ROUTES.MY_LISTINGS)
  }

  // Show loading if property is not yet available
  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        {isFetching && <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mt-6" />}
      </div>
    )
  }



  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="light"
            startContent={<ArrowLeft className="w-4 h-4" />}
            onPress={handleBackToListings}
            className="mb-4"
          >
            {t('property.actions.backToListings')}
          </Button>
          
          <PageBanner
            backgroundImage={getBannerConfig('editProperty').image}
            title={t('property.editProperty.banner.title')}
            subtitle={t('property.editProperty.banner.subtitle')}
            imageAlt={t('common.pageBanner.editProperty')}
            overlayOpacity={getBannerConfig('editProperty').overlayOpacity}
            height={getBannerConfig('editProperty').height}
            className="mb-8"
          />
        </div>

        {/* Edit Form */}
        <Card className="shadow-sm overflow-visible">
          <CardBody className="p-6 overflow-visible">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t('property.editProperty.title')}
              </h1>
              <p className="text-gray-600">
                {t('property.editProperty.description')}
              </p>
            </div>

            <div className="overflow-visible">
              <PropertySubmissionForm 
                initialData={convertDatabasePropertyToSubmissionData(property)}
                isEditMode={true}
                onSubmitSuccess={handleEditSubmitSuccess}
                onCancel={handleCancelEdit}
                externalLoading={isSubmitting}
              />
            </div>
          </CardBody>
        </Card>

        {/* Property Edit Confirmation Modal */}
        <PropertyEditConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmEdit}
          confirmation={editConfirmation}
          isLoading={false}
        />
      </div>
  )
}

export default EditPropertyPage
