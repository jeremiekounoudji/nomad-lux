import React from 'react'
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Avatar,
  Chip,
  Divider,
  Card,
  CardBody
} from '@heroui/react'
import { 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Star, 
  Home, 
  Heart,
  Edit,
  Shield,
  Award,
  Users,
  Clock,
  DollarSign,
  Globe,
  CheckCircle
} from 'lucide-react'
import { useAuthStore } from '../../lib/stores/authStore'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
      onClose()
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

  if (!user) {
    return null
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getVerificationLevel = () => {
    let level = 0
    if (user.is_email_verified) level++
    if (user.is_phone_verified) level++
    if (user.is_identity_verified) level++
    return level
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white",
        header: "border-b border-gray-200",
        body: "py-6",
        footer: "border-t border-gray-200"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-t-lg">
          <h2 className="text-2xl font-bold">My Profile</h2>
          <p className="text-white/90">View and manage your account information</p>
        </ModalHeader>
        
        <ModalBody>
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-8 -mt-4">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full ring-4 ring-white shadow-xl bg-white p-1">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name)}&background=3B82F6&color=fff&size=128`}
                  alt={user.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              {user.is_email_verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{user.display_name}</h3>
            <p className="text-primary-600 font-medium mb-2">@{user.username || user.email.split('@')[0]}</p>
            
            {/* Verification & Role Badges */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              <Chip 
                color="primary" 
                variant="flat" 
                startContent={<Award className="w-3 h-3" />}
                size="md"
                className="font-medium"
              >
                {user.user_role === 'both' ? 'Host & Guest' : user.user_role.charAt(0).toUpperCase() + user.user_role.slice(1)}
              </Chip>
              
              {getVerificationLevel() > 0 && (
                <Chip 
                  color="success" 
                  variant="flat" 
                  startContent={<Shield className="w-3 h-3" />}
                  size="md"
                  className="font-medium"
                >
                  {getVerificationLevel()}/3 Verified
                </Chip>
              )}
              
              {user.account_status === 'active' && (
                <Chip 
                  color="success" 
                  variant="flat" 
                  size="md"
                  className="font-medium"
                >
                  Active
                </Chip>
              )}
            </div>
            
            {user.bio && (
              <div className="bg-gray-50 rounded-lg p-4 max-w-md">
                <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>

          <Divider className="my-8" />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border border-primary-200 hover:shadow-lg transition-shadow">
              <CardBody className="text-center p-5">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-primary-700">{user.total_properties}</p>
                <p className="text-sm text-primary-600 font-medium">Properties</p>
              </CardBody>
            </Card>
            
            <Card className="border border-secondary-200 hover:shadow-lg transition-shadow">
              <CardBody className="text-center p-5">
                <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-secondary-700">{user.total_bookings}</p>
                <p className="text-sm text-secondary-600 font-medium">Bookings</p>
              </CardBody>
            </Card>
            
            <Card className="border border-yellow-200 hover:shadow-lg transition-shadow">
              <CardBody className="text-center p-5">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-yellow-700">
                  {user.is_host ? 
                    ((user.guest_rating + user.host_rating) / 2).toFixed(1) : 
                    user.guest_rating.toFixed(1)
                  }
                </p>
                <p className="text-sm text-yellow-600 font-medium">Avg Rating</p>
              </CardBody>
            </Card>
            
            <Card className="border border-green-200 hover:shadow-lg transition-shadow">
              <CardBody className="text-center p-5">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-green-700">{user.total_guest_reviews + user.total_host_reviews}</p>
                <p className="text-sm text-green-600 font-medium">Reviews</p>
              </CardBody>
            </Card>
          </div>

          {/* Revenue Card for Hosts */}
          {user.is_host && user.total_revenue > 0 && (
            <Card className="border border-purple-200 mb-8 bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-purple-700">${user.total_revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Host since</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.host_since)}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Contact & Personal Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary-600" />
                  Contact Information
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{user.email}</p>
                      {user.is_email_verified && (
                        <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-secondary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                      {user.phone && user.is_phone_verified && (
                        <span className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{user.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-gray-200">
              <CardBody className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Account Details
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Member since</p>
                      <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Last active</p>
                      <p className="font-medium text-gray-900">{formatDate(user.last_login)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">Preferred Language</p>
                      <p className="font-medium text-gray-900">{user.language_preference || 'English'}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Account Summary */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200">
            <CardBody className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600" />
                Account Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Verification Level</p>
                  <p className="font-bold text-blue-700">{getVerificationLevel()}/3 Complete</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Account Status</p>
                  <p className="font-bold text-green-700 capitalize">{user.account_status}</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600">Currency</p>
                  <p className="font-bold text-purple-700">{user.preferred_currency}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </ModalBody>
        
        <ModalFooter className="bg-gray-50 rounded-b-lg">
          <div className="flex justify-between w-full">
            <Button 
              variant="bordered" 
              onPress={onClose}
              className="border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Close
            </Button>
            <div className="flex gap-2">
              <Button 
                color="danger" 
                variant="flat"
                onPress={handleLogout}
                className="text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
              <Button 
                color="primary" 
                startContent={<Edit className="w-4 h-4" />}
                className="bg-primary-600 hover:bg-primary-700"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProfileModal 