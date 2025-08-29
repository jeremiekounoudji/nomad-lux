import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, CardBody } from '@heroui/react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageBanner } from '../components/shared'
import { getBannerConfig } from '../utils/bannerConfig'
import PropertySubmissionForm from '../components/features/property/PropertySubmissionForm'
import { PropertyEditConfirmationModal } from '../components/shared'
import { useUserListings } from '../hooks/useUserListings'
import { useTranslation } from '../lib/stores/translationStore'
import { convertDatabasePropertyToSubmissionData } from '../utils/propertyUtils'
import { PropertyEditConfirmation } from '../interfaces'
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
      <div className="mx-auto max-w-7xl">
        <div className="animate-pulse">
          <div className="mb-6 h-48 rounded-lg bg-gray-200"></div>
          <div className="space-y-4">
            <div className="h-4 w-1/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="h-32 rounded bg-gray-200"></div>
          </div>
        </div>
        {isFetching && <Loader2 className="mx-auto mt-6 size-6 animate-spin text-gray-400" />}
      </div>
    )
  }



  return (
            <div className="mx-auto min-h-screen w-full">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="light"
            startContent={<ArrowLeft className="size-4" />}
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
        <Card className="overflow-visible shadow-sm">
          <CardBody className="overflow-visible p-6">
            <div className="mb-6">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
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
