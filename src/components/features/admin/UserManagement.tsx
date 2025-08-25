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
  User
} from './modals'
import { Search, MoreHorizontal, Eye, Ban, UserCheck, Trash2, MessageSquare, Calendar, DollarSign, Home, Star, Download } from 'lucide-react'
import { useTranslation } from '../../../lib/stores/translationStore'



// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    role: 'both',
    joinDate: '2024-01-15',
    lastLogin: '2 hours ago',
    totalBookings: 12,
    totalProperties: 3,
    revenue: 15600,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    status: 'active',
    role: 'guest',
    joinDate: '2024-02-20',
    lastLogin: '1 day ago',
    totalBookings: 8,
    totalProperties: 0,
    revenue: 0,
    rating: 4.5
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@email.com',
    phone: '+1 (555) 345-6789',
    status: 'suspended',
    role: 'host',
    joinDate: '2023-11-10',
    lastLogin: '5 days ago',
    totalBookings: 0,
    totalProperties: 2,
    revenue: 8900,
    rating: 3.2
  },
  {
    id: '4',
    name: 'David Thompson',
    email: 'david.thompson@email.com',
    phone: '+1 (555) 456-7890',
    status: 'active',
    role: 'host',
    joinDate: '2024-03-05',
    lastLogin: '30 minutes ago',
    totalBookings: 0,
    totalProperties: 5,
    revenue: 23400,
    rating: 4.9
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
    hosts: mockUsers.filter(u => u.role === 'host' || u.role === 'both').length,
    guests: mockUsers.filter(u => u.role === 'guest' || u.role === 'both').length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('admin.users.allUsers')}</h1>
        <p className="text-gray-600 mt-1">{t('admin.dashboard.overview', { defaultValue: 'Manage platform users and their activities' })}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-slate-500 to-slate-600 text-white">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.all}</p>
            <p className="text-white/90 text-sm">{t('admin.dashboard.totalUsers')}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.active}</p>
            <p className="text-white/90 text-sm">{t('common.status.active')}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-red-500 to-rose-500 text-white">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.suspended}</p>
            <p className="text-white/90 text-sm">{t('common.status.suspended')}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-orange-500 to-amber-500 text-white">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-white/90 text-sm">{t('common.status.pending')}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.hosts}</p>
            <p className="text-white/90 text-sm">{t('admin.users.hosts')}</p>
          </CardBody>
        </Card>
        <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-purple-500 to-violet-500 text-white">
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{stats.guests}</p>
            <p className="text-white/90 text-sm">{t('admin.users.guests')}</p>
          </CardBody>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <Input
            placeholder={t('common.buttons.search') + ' users...'}
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            className="sm:max-w-xs"
          />
          <Select
            placeholder={t('common.buttons.filter')}
            className="sm:max-w-xs"
          >
            <SelectItem key="all" value="all">{t('admin.users.allUsers')}</SelectItem>
            <SelectItem key="active" value="active">{t('common.status.active')}</SelectItem>
            <SelectItem key="suspended" value="suspended">{t('common.status.suspended')}</SelectItem>
            <SelectItem key="pending" value="pending">{t('common.status.pending')}</SelectItem>
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
            startContent={<Download className="w-4 h-4" />}
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
      <Card className="shadow-sm border border-gray-200">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="text-left p-4">
                    <Checkbox
                      isSelected={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      isIndeterminate={selectedUsers.length > 0 && selectedUsers.length < filteredUsers.length}
                      onValueChange={handleSelectAll}
                      color="primary"
                    />
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">{t('admin.users.userDetails')}</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">{t('common.labels.status')}</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">{t('admin.users.userRole')}</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">{t('admin.dashboard.recentActivity')}</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">{t('admin.dashboard.overview', { defaultValue: 'Performance' })}</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">{t('admin.actions.view')}</th>
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
                          className="flex-shrink-0"
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
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{user.totalBookings} {t('admin.bookings.allBookings')}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <Home className="w-3 h-3 text-gray-400" />
                        <span>{user.totalProperties} {t('admin.navigation.properties')}</span>
                        </div>
                        {user.revenue > 0 && (
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-3 h-3 text-gray-400" />
                            <span>${user.revenue.toLocaleString()}</span>
                          </div>
                        )}
                        {user.rating > 0 && (
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 text-yellow-400" />
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
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<Eye className="w-4 h-4" />}
                            onClick={() => {
                              setSelectedUser(user)
                              onOpen()
                            }}
                          >
                            {t('admin.actions.view')}
                          </DropdownItem>
                          <DropdownItem
                            key="message"
                            startContent={<MessageSquare className="w-4 h-4" />}
                            onClick={() => handleUserAction(user, 'message')}
                          >
                            {t('admin.actions.message', { defaultValue: 'Send Message' })}
                          </DropdownItem>
                          {user.status === 'active' ? (
                            <DropdownItem
                              key="suspend"
                              startContent={<Ban className="w-4 h-4" />}
                              onClick={() => handleUserAction(user, 'suspend')}
                              className="text-warning"
                            >
                              {t('admin.actions.suspend')}
                            </DropdownItem>
                          ) : (
                            <DropdownItem
                              key="activate"
                              startContent={<UserCheck className="w-4 h-4" />}
                              onClick={() => handleUserAction(user, 'activate')}
                              className="text-success"
                            >
                              {t('admin.actions.activate')}
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="delete"
                            startContent={<Trash2 className="w-4 h-4" />}
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
                      className="capitalize mt-1"
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
                      className="capitalize mt-1"
                    >
                      {selectedUser.role}
                    </Chip>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-sm mt-1">{selectedUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Join Date</p>
                    <p className="text-sm mt-1">{selectedUser.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Login</p>
                    <p className="text-sm mt-1">{selectedUser.lastLogin}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rating</p>
                    <p className="text-sm mt-1">{selectedUser.rating}/5</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Activity Summary</h4>
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


