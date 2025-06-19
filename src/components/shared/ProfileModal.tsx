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
  Users
} from 'lucide-react'
import { mockCurrentUser } from '../../lib/mockData'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const user = mockCurrentUser

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
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
          <p className="text-sm text-gray-500">Manage your account information</p>
        </ModalHeader>
        
        <ModalBody>
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <Avatar
                src={user.avatar_url}
                alt={user.display_name}
                className="w-24 h-24 text-large"
                isBordered
                color="primary"
              />
              {user.is_email_verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{user.display_name}</h3>
            <p className="text-secondary-600 font-medium mb-2">@{user.username}</p>
            
            <div className="flex gap-2 mb-4">
              {user.is_email_verified && (
                <Chip 
                  color="secondary" 
                  variant="flat" 
                  startContent={<Shield className="w-3 h-3" />}
                  size="sm"
                >
                  Verified
                </Chip>
              )}
              <Chip 
                color="primary" 
                variant="flat" 
                startContent={<Award className="w-3 h-3" />}
                size="sm"
              >
                Superhost
              </Chip>
            </div>
            
            {user.bio && (
              <p className="text-gray-600 text-sm max-w-md">{user.bio}</p>
            )}
          </div>

          <Divider className="my-6" />

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border border-primary-200">
              <CardBody className="text-center p-4">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Home className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-lg font-bold text-primary-700">12</p>
                <p className="text-xs text-primary-600">Properties</p>
              </CardBody>
            </Card>
            
            <Card className="border border-secondary-200">
              <CardBody className="text-center p-4">
                <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-5 h-5 text-secondary-600" />
                </div>
                <p className="text-lg font-bold text-secondary-700">47</p>
                <p className="text-xs text-secondary-600">Liked</p>
              </CardBody>
            </Card>
            
            <Card className="border border-yellow-200">
              <CardBody className="text-center p-4">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-lg font-bold text-yellow-700">4.9</p>
                <p className="text-xs text-yellow-600">Rating</p>
              </CardBody>
            </Card>
            
            <Card className="border border-green-200">
              <CardBody className="text-center p-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-lg font-bold text-green-700">156</p>
                <p className="text-xs text-green-600">Reviews</p>
              </CardBody>
            </Card>
          </div>

          {/* Contact Information */}
          <Card className="mb-6">
            <CardBody className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">alex.thompson@email.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{user.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member since</p>
                    <p className="font-medium text-gray-900">January 2022</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardBody className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Listed new property</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Liked 3 properties</p>
                    <p className="text-xs text-gray-500">1 week ago</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Received 5-star review</p>
                    <p className="text-xs text-gray-500">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </ModalBody>
        
        <ModalFooter>
          <Button 
            variant="bordered" 
            onPress={onClose}
            className="border-gray-300 text-gray-600"
          >
            Close
          </Button>
          <Button 
            color="primary" 
            startContent={<Edit className="w-4 h-4" />}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Edit Profile
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProfileModal 