import React, { useState } from 'react'
import { 
  Card, 
  CardBody, 
  Button, 
  Chip, 
  Avatar, 
  Tabs, 
  Tab, 
  Input,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Checkbox
} from '@heroui/react'
import {
  UserSuspensionModal,
  UserActivationModal,
  UserDeletionModal,
  SendMessageModal,
  BulkUserActionsModal,
  // User // Import not found
} from './modals'
import { Search, MoreHorizontal, Eye, Ban, UserCheck, Trash2, MessageSquare, Calendar, DollarSign, Home, Star, Download } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'



// Mock user data
interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar_url: string
  display_name: string
  status: 'active' | 'suspended' | 'pending'
  role: 'host' | 'guest' | 'admin'
  joinDate: string
  lastLogin: string
  totalBookings: number
  totalProperties: number
  revenue: number
  rating: number
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0101',
    avatar_url: '/avatars/john.jpg',
    display_name: 'John Doe',
    status: 'active' as const,
    role: 'guest', // Changed from 'both' to valid role
    joinDate: '2024-01-15',
    lastLogin: '2024-02-10 16:45',
    totalBookings: 12,
    totalProperties: 0,
    revenue: 0,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1-555-0102',
    avatar_url: '/avatars/jane.jpg',
    display_name: 'Jane Smith',
    status: 'active' as const,
    role: 'guest' as const,
    joinDate: '2024-01-20',
    lastLogin: '2024-02-10 14:30',
    totalBookings: 8,
    totalProperties: 0,
    revenue: 0,
    rating: 4.5
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1-555-0103',
    avatar_url: '/avatars/mike.jpg',
    display_name: 'Mike Johnson',
    status: 'suspended' as const,
    role: 'host' as const,
    joinDate: '2024-01-10',
    lastLogin: '2024-02-08 09:15',
    totalBookings: 0,
    totalProperties: 3,
    revenue: 2450,
    rating: 0
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    phone: '+1-555-0104',
    avatar_url: '/avatars/sarah.jpg',
    display_name: 'Sarah Wilson',
    status: 'active' as const,
    role: 'guest' as const,
    joinDate: '2024-02-01',
    lastLogin: '2024-02-09 11:20',
    totalBookings: 5,
    totalProperties: 0,
    revenue: 0,
    rating: 4.8
  },
  {
    id: '2',
    name: 'David Brown',
    email: 'david@example.com',
    phone: '+1-555-0105',
    avatar_url: '/avatars/david.jpg',
    display_name: 'David Brown',
    status: 'active' as const,
    role: 'guest' as const,
    joinDate: '2024-01-25',
    lastLogin: '2024-02-09 15:45',
    totalBookings: 3,
    totalProperties: 0,
    revenue: 0,
    rating: 4.5
  }
]

export const UserManagement: React.FC = () => {
  const { t } = useTranslation(['admin', 'common'])
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Modal states for user actions
  const { isOpen: isSuspendOpen, onOpen: onSuspendOpen, onClose: onSuspendClose } = useDisclosure()
  const { isOpen: isActivateOpen, onOpen: onActivateOpen, onClose: onActivateClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const { isOpen: isMessageOpen, onOpen: onMessageOpen, onClose: onMessageClose } = useDisclosure()
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure()
  
  const [actionUser, setActionUser] = useState<User | null>(null)
  const [bulkAction, setBulkAction] = useState<'suspend' | 'activate' | 'delete' | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'suspended': return 'danger'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'host': return 'primary'
      case 'guest': return 'secondary'
      case 'both': return 'warning'
      default: return 'default'
    }
  }

  const filteredUsers = mockUsers.filter(user => {
    const fullName = (user.display_name ?? user.name ?? '').toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = selectedTab === 'all' || user.status === selectedTab || user.role === selectedTab
    return matchesSearch && matchesTab
  })

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) return
    
    setBulkAction(action as 'suspend' | 'activate' | 'delete')
    onBulkOpen()
  }

  const handleUserAction = (user: User, action: string) => {
    setActionUser(user)
    switch (action) {
      case 'suspend':
        onSuspendOpen()
        break
      case 'activate':
        onActivateOpen()
        break
      case 'delete':
        onDeleteOpen()
        break
      case 'message':
        onMessageOpen()
        break
      default:
        console.log(`Action: ${action} for user:`, user.display_name)
    }
  }

  const handleUserSuspension = (reason: string) => {
    if (actionUser) {
      console.log(`Suspending user ${(actionUser.display_name ?? actionUser.name)} with reason:`, reason)
      // Update user status logic here
    }
  }

  const handleUserActivation = () => {
    if (actionUser) {
      console.log(`Activating user ${actionUser.display_name}`)
      // Update user status logic here
    }
  }

  const handleUserDeletion = (reason: string) => {
    if (actionUser) {
      console.log(`Deleting user ${actionUser.display_name} with reason:`, reason)
      // Delete user logic here
    }
  }

  const handleSendMessage = (messageData: any) => {
    console.log('Sending message:', messageData)
    // Send message logic here
  }

  const handleBulkUserAction = (reason?: string) => {
    const selectedUserObjects = mockUsers.filter(user => selectedUsers.includes(user.id))
    console.log(`Bulk ${bulkAction} action for ${selectedUserObjects.length} users${reason ? ` with reason: ${reason}` : ''}`)
    
    // Bulk action logic here
    setSelectedUsers([])
    setBulkAction(null)
  }

  const stats = {
    all: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    suspended: mockUsers.filter(u => u.status === 'suspended').length,
    pending: mockUsers.filter(u => u.status === 'pending').length,
    hosts: mockUsers.filter(u => u.role === 'host').length,
    guests: mockUsers.filter(u => u.role === 'guest').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.users.allUsers')}</h1>
        <p className="mt-1 text-gray-600">{t('admin.dashboard.overview', { defaultValue: 'Manage platform users and their activities' })}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card className="border border-gray-200 bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-sm">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.all}</p>
            <p className="text-sm text-white/90">{t('admin.dashboard.totalUsers')}</p>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-sm">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.active}</p>
            <p className="text-sm text-white/90">{t('common.status.active')}</p>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 bg-gradient-to-br from-red-500 to-rose-500 text-white shadow-sm">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.suspended}</p>
            <p className="text-sm text-white/90">{t('common.status.suspended')}</p>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-sm">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-sm text-white/90">{t('common.status.pending')}</p>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.hosts}</p>
            <p className="text-sm text-white/90">{t('admin.users.hosts')}</p>
          </CardBody>
        </Card>
        <Card className="border border-gray-200 bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-sm">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.guests}</p>
            <p className="text-sm text-white/90">{t('admin.users.guests')}</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <Input
            placeholder={t('common.buttons.search') + ' users...'}
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search className="size-4 text-gray-400" />}
            className="sm:max-w-xs"
          />
          <Select
            placeholder={t('common.buttons.filter')}
            className="sm:max-w-xs"
          >
            <SelectItem key="all">{t('admin.users.allUsers')}</SelectItem>
            <SelectItem key="active">{t('common.status.active')}</SelectItem>
            <SelectItem key="suspended">{t('common.status.suspended')}</SelectItem>
            <SelectItem key="pending">{t('common.status.pending')}</SelectItem>
          </Select>
        </div>
        <div className="flex gap-2">
          {selectedUsers.length > 0 && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat">
                  {t('admin.actions.bulkAction')} ({selectedUsers.length})
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="activate" onClick={() => handleBulkAction('activate')}>
                  {t('admin.actions.activate')}
                </DropdownItem>
                <DropdownItem key="suspend" onClick={() => handleBulkAction('suspend')}>
                  {t('admin.actions.suspend')}
                </DropdownItem>
                <DropdownItem key="delete" onClick={() => handleBulkAction('delete')} className="text-danger">
                  {t('admin.actions.delete')}
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
          <Button
            startContent={<Download className="size-4" />}
            variant="flat"
          >
            {t('admin.actions.export')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        selectedKey={selectedTab} 
        onSelectionChange={(key) => setSelectedTab(key as string)}
        variant="underlined"
      >
        <Tab key="all" title={`${t('admin.users.allUsers')} (${stats.all})`} />
        <Tab key="active" title={`${t('common.status.active')} (${stats.active})`} />
        <Tab key="suspended" title={`${t('common.status.suspended')} (${stats.suspended})`} />
        <Tab key="pending" title={`${t('common.status.pending')} (${stats.pending})`} />
        <Tab key="host" title={`${t('admin.users.hosts')} (${stats.hosts})`} />
        <Tab key="guest" title={`${t('admin.users.guests')} (${stats.guests})`} />
      </Tabs>

      {/* Users Table */}
      <Card className="border border-gray-200 shadow-sm">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="p-4 text-left">
                    <Checkbox
                      isSelected={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      isIndeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      onValueChange={handleSelectAll}
                      color="primary"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">{t('admin.users.userDetails')}</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">{t('common.labels.status')}</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">{t('admin.users.userRole')}</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">{t('admin.dashboard.recentActivity')}</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">{t('admin.dashboard.overview', { defaultValue: 'Performance' })}</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-600">{t('admin.actions.view')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4">
                      <Checkbox
                        isSelected={selectedUsers.includes(user.id)}
                        onValueChange={(checked) => handleUserSelect(user.id, checked)}
                        color="primary"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.avatar_url}
                          name={user.display_name ?? user.name}
                          size="sm"
                          className="shrink-0"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.display_name ?? user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Chip
                        color={getStatusColor(user.status) as any}
                        size="sm"
                        variant="flat"
                        className="capitalize"
                      >
                        {user.status}
                      </Chip>
                    </td>
                    <td className="p-4">
                      <Chip
                        color={getRoleColor(user.role) as any}
                        size="sm"
                        variant="flat"
                        className="capitalize"
                      >
                        {user.role}
                      </Chip>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-gray-900">Joined {user.joinDate}</p>
                        <p className="text-gray-500">Last login: {user.lastLogin}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="mb-1 flex items-center gap-2">
                          <Calendar className="size-3 text-gray-400" />
                        <span>{user.totalBookings} {t('admin.bookings.allBookings')}</span>
                        </div>
                        <div className="mb-1 flex items-center gap-2">
                          <Home className="size-3 text-gray-400" />
                        <span>{user.totalProperties} {t('admin.navigation.properties')}</span>
                        </div>
                        {user.revenue > 0 && (
                          <div className="mb-1 flex items-center gap-2">
                            <DollarSign className="size-3 text-gray-400" />
                            <span>${user.revenue.toLocaleString()}</span>
                          </div>
                        )}
                        {user.rating > 0 && (
                          <div className="flex items-center gap-2">
                            <Star className="size-3 text-yellow-400" />
                            <span>{user.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            className="text-gray-400"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="size-4" />}
                            onClick={() => {
                              setSelectedUser(user)
                              onOpen()
                            }}
                          >
                            {t('admin.actions.view')}
                          </DropdownItem>
                          <DropdownItem
                            key="message"
                            startContent={<MessageSquare className="size-4" />}
                            onClick={() => handleUserAction(user, 'message')}
                          >
                            {t('admin.actions.message', { defaultValue: 'Send Message' })}
                          </DropdownItem>
                          {user.status === 'active' ? (
                            <DropdownItem
                              key="suspend"
                              startContent={<Ban className="size-4" />}
                              onClick={() => handleUserAction(user, 'suspend')}
                              className="text-warning"
                            >
                              {t('admin.actions.suspend')}
                            </DropdownItem>
                          ) : (
                            <DropdownItem
                              key="activate"
                              startContent={<UserCheck className="size-4" />}
                              onClick={() => handleUserAction(user, 'activate')}
                              className="text-success"
                            >
                              {t('admin.actions.activate')}
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="delete"
                            startContent={<Trash2 className="size-4" />}
                            onClick={() => handleUserAction(user, 'delete')}
                            className="text-danger"
                          >
                            {t('admin.actions.delete')}
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* User Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-3">
              <Avatar src={selectedUser?.avatar_url} name={selectedUser?.display_name} />
              <div>
                <h3 className="text-lg font-semibold">{selectedUser?.display_name}</h3>
                <p className="text-sm text-gray-500">{selectedUser?.email}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <Chip
                      color={getStatusColor(selectedUser.status) as any}
                      size="sm"
                      variant="flat"
                      className="mt-1 capitalize"
                    >
                      {selectedUser.status}
                    </Chip>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Role</p>
                    <Chip
                      color={getRoleColor(selectedUser.role) as any}
                      size="sm"
                      variant="flat"
                      className="mt-1 capitalize"
                    >
                      {selectedUser.role}
                    </Chip>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="mt-1 text-sm">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Join Date</p>
                    <p className="mt-1 text-sm">{selectedUser.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Login</p>
                    <p className="mt-1 text-sm">{selectedUser.lastLogin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="mt-1 text-sm">{selectedUser.rating}/5</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-600">Activity Summary</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{selectedUser.totalBookings}</p>
                      <p className="text-xs text-gray-500">Bookings</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{selectedUser.totalProperties}</p>
                      <p className="text-xs text-gray-500">Properties</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">${selectedUser.revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              {t('common.buttons.close')}
            </Button>
            <Button color="primary" onPress={onClose}>
              {t('admin.users.editProfile')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* User Action Confirmation Modals */}
      <UserSuspensionModal
        isOpen={isSuspendOpen}
        onClose={onSuspendClose}
        user={actionUser}
        onConfirm={handleUserSuspension}
      />

      <UserActivationModal
        isOpen={isActivateOpen}
        onClose={onActivateClose}
        user={actionUser}
        onConfirm={handleUserActivation}
      />

      <UserDeletionModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        user={actionUser}
        onConfirm={handleUserDeletion}
      />

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={isMessageOpen}
        onClose={onMessageClose}
        user={actionUser}
        onSend={handleSendMessage}
      />

      {/* Bulk Actions Modal */}
      <BulkUserActionsModal
        isOpen={isBulkOpen}
        onClose={onBulkClose}
        users={mockUsers.filter(user => selectedUsers.includes(user.id))}
        action={bulkAction}
        onConfirm={handleBulkUserAction}
      />
    </div>
  )
} 


