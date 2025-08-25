import React, { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button, 
  ButtonGroup,
  Chip, 
  Avatar,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import { 
  MapPin, 
  Star, 
  Users, 
  Bed, 
  Bath, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Eye,
  Edit,
  MoreVertical,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { DatabaseProperty } from '../../interfaces/DatabaseProperty';
import toast from 'react-hot-toast';
import { useTranslation } from '../../lib/stores/translationStore';

interface AdminPropertyMarkerProps {
  property: DatabaseProperty;
  onStatusChange: (propertyId: string, newStatus: 'approved' | 'pending' | 'rejected' | 'suspended', reason?: string) => void;
  onPropertyEdit: (property: DatabaseProperty) => void;
  onPropertyView: (property: DatabaseProperty) => void;
  selected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  showQuickActions?: boolean;
}

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: DatabaseProperty;
  newStatus: 'approved' | 'pending' | 'rejected' | 'suspended';
  onConfirm: (reason?: string) => void;
}

const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  property,
  newStatus,
  onConfirm
}) => {
  const { t } = useTranslation('admin');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const statusConfig = {
    approved: { 
      title: t('marker.statusChange.approveProperty'), 
      color: 'success' as const, 
      description: t('marker.statusChange.descriptions.approve'),
      requiresReason: false,
      icon: <CheckCircle className="w-5 h-5" />
    },
    rejected: { 
      title: t('marker.statusChange.rejectProperty'), 
      color: 'danger' as const, 
      description: t('marker.statusChange.descriptions.reject'),
      requiresReason: true,
      icon: <XCircle className="w-5 h-5" />
    },
    suspended: { 
      title: t('marker.statusChange.suspendProperty'), 
      color: 'warning' as const, 
      description: t('marker.statusChange.descriptions.suspend'),
      requiresReason: true,
      icon: <Pause className="w-5 h-5" />
    },
    pending: { 
      title: t('marker.statusChange.setToPending'), 
      color: 'warning' as const, 
      description: t('marker.statusChange.descriptions.pending'),
      requiresReason: false,
      icon: <Clock className="w-5 h-5" />
    }
  };

  const config = statusConfig[newStatus];

  const handleConfirm = async () => {
    if (config.requiresReason && !reason.trim()) {
      toast.error(t('marker.statusChange.messages.reasonRequired'));
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(reason);
      onClose();
    } catch (error) {
      console.error('Status change failed:', error);
      toast.error(t('marker.statusChange.messages.statusChangeFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${config.color}-100`}>
              {config.icon}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{config.title}</h2>
              <p className="text-sm text-gray-600">{property.title}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-700">{config.description}</p>
            
            {/* Property Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{property.title}</h4>
                  <p className="text-sm text-gray-600">
                    {property.location.city}, {property.location.country}
                  </p>
                  <p className="text-sm font-semibold text-primary-600">
                    ${property.currency} ${property.price}/night
                  </p>
                </div>
                <Chip 
                  size="sm" 
                  variant="flat" 
                  color={
                    property.approval_status === 'approved' ? 'success' :
                    property.approval_status === 'pending' ? 'warning' :
                    property.approval_status === 'rejected' ? 'danger' : 'default'
                  }
                >
                  {t('marker.statusChange.current')}: {property.approval_status}
                </Chip>
              </div>
            </div>

            {/* Reason Input */}
            {config.requiresReason && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('marker.statusChange.reasonLabel', { action: newStatus })} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('marker.statusChange.reasonPlaceholder', { action: newStatus })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} disabled={isProcessing}>
            {t('marker.statusChange.cancel')}
          </Button>
          <Button 
            color={config.color}
            onPress={handleConfirm}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            {isProcessing ? t('marker.statusChange.processing') : config.title}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const AdminPropertyMarker: React.FC<AdminPropertyMarkerProps> = ({
  property,
  onStatusChange,
  onPropertyEdit,
  onPropertyView,
  selected = false,
  onSelectionChange,
  showQuickActions = true
}) => {
  const { t } = useTranslation('admin');
  const { isOpen: isStatusModalOpen, onOpen: onStatusModalOpen, onClose: onStatusModalClose } = useDisclosure();
  const [pendingStatus, setPendingStatus] = useState<'approved' | 'pending' | 'rejected' | 'suspended'>('approved');

  const handleStatusChange = (newStatus: 'approved' | 'pending' | 'rejected' | 'suspended') => {
    setPendingStatus(newStatus);
    onStatusModalOpen();
  };

  const handleStatusConfirm = (reason?: string) => {
    onStatusChange(property.id, pendingStatus, reason);
    toast.success(t('marker.statusChange.messages.propertyStatusChanged', { status: pendingStatus }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      case 'suspended': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'suspended': return <Pause className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <>
      <Card className={`w-80 shadow-lg ${selected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
                {onSelectionChange && (
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(e) => onSelectionChange(e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{property.location.city}, {property.location.country}</span>
              </div>
            </div>
            <Chip 
              size="sm" 
              variant="flat" 
              color={getStatusColor(property.approval_status) as any}
              startContent={getStatusIcon(property.approval_status)}
            >
              {property.approval_status}
            </Chip>
          </div>
        </CardHeader>
        
        <CardBody className="pt-0">
          {/* Property Image */}
          <div className="relative mb-3">
            <img 
              src={property.images[0]} 
              alt={property.title}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              {property.images.length} {t('marker.photos')}
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{property.max_guests}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{property.rating}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-lg font-bold">
                {property.currency} {property.price}
                <span className="text-sm font-normal text-gray-600">{t('marker.night')}</span>
              </div>
              <div className="text-sm text-gray-600">
                {t('marker.created')}: {new Date(property.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Host Info */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <Avatar 
                src={property.host.avatar_url} 
                name={property.host.display_name}
                size="sm"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{property.host.display_name}</p>
                <p className="text-xs text-gray-600">{t('marker.hostSince')} {new Date(property.host.created_at).getFullYear()}</p>
              </div>
            </div>

            {showQuickActions && (
              <>
                <Divider />
                
                {/* Quick Actions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{t('marker.quickActions')}</span>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button size="sm" variant="light" isIconOnly>
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu aria-label="Property actions">
                        <DropdownItem key="view" startContent={<Eye className="w-4 h-4" />} onPress={() => onPropertyView(property)}>
                          {t('marker.viewDetails')}
                        </DropdownItem>
                        <DropdownItem key="edit" startContent={<Edit className="w-4 h-4" />} onPress={() => onPropertyEdit(property)}>
                          {t('marker.editProperty')}
                        </DropdownItem>
                        <DropdownItem key="contact" startContent={<MessageSquare className="w-4 h-4" />}>
                          {t('marker.contactHost')}
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  
                  {/* Status Change Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {property.approval_status !== 'approved' && (
                      <Button
                        size="sm"
                        color="success"
                        variant="flat"
                        startContent={<CheckCircle className="w-4 h-4" />}
                        onPress={() => handleStatusChange('approved')}
                      >
                        {t('marker.statusChange.actions.approve')}
                      </Button>
                    )}
                    {property.approval_status !== 'rejected' && (
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        startContent={<XCircle className="w-4 h-4" />}
                        onPress={() => handleStatusChange('rejected')}
                      >
                        {t('marker.statusChange.actions.reject')}
                      </Button>
                    )}
                    {property.approval_status !== 'suspended' && (
                      <Button
                        size="sm"
                        color="warning"
                        variant="flat"
                        startContent={<Pause className="w-4 h-4" />}
                        onPress={() => handleStatusChange('suspended')}
                      >
                        {t('marker.statusChange.actions.suspend')}
                      </Button>
                    )}
                    {property.approval_status !== 'pending' && (
                      <Button
                        size="sm"
                        color="default"
                        variant="flat"
                        startContent={<Clock className="w-4 h-4" />}
                        onPress={() => handleStatusChange('pending')}
                      >
                        {t('marker.statusChange.actions.pending')}
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Status Change Modal */}
      <StatusChangeModal
        isOpen={isStatusModalOpen}
        onClose={onStatusModalClose}
        property={property}
        newStatus={pendingStatus}
        onConfirm={handleStatusConfirm}
      />
    </>
  );
};

export default AdminPropertyMarker; 