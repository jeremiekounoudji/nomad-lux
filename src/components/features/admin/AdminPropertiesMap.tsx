import React, { useState, useCallback, useEffect } from 'react';
import { LazyMapWrapper } from '../../map';
import { DatabaseProperty } from '../../../interfaces/DatabaseProperty';
import AdminMapToolbar, { MapFilter } from './AdminMapToolbar';
import { 
  Button, 
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@heroui/react';
import {
  CheckCircle,
  XCircle,
  Pause,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../../lib/stores/translationStore';

interface AdminPropertiesMapProps {
  properties: DatabaseProperty[];
  onPropertyClick?: (property: DatabaseProperty) => void;
  onPropertiesUpdate?: (properties: DatabaseProperty[]) => void;
  className?: string;
  height?: string;
}

interface BulkActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'approve' | 'reject' | 'suspend' | 'delete';
  properties: DatabaseProperty[];
  onConfirm: (action: string, properties: DatabaseProperty[], reason?: string) => void;
}

const BulkActionModal: React.FC<BulkActionModalProps> = ({
  isOpen,
  onClose,
  action,
  properties,
  onConfirm
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const actionConfig = {
    approve: { 
      title: t('admin.properties.bulkActions.approve.title', { defaultValue: 'Approve Properties' }), 
      color: 'success' as const, 
      description: t('admin.properties.bulkActions.approve.description', { defaultValue: 'These properties will be made visible to users and available for booking.' }),
      requiresReason: false 
    },
    reject: { 
      title: t('admin.properties.bulkActions.reject.title', { defaultValue: 'Reject Properties' }), 
      color: 'danger' as const, 
      description: t('admin.properties.bulkActions.reject.description', { defaultValue: 'These properties will be rejected and hosts will be notified.' }),
      requiresReason: true 
    },
    suspend: { 
      title: t('admin.properties.bulkActions.suspend.title', { defaultValue: 'Suspend Properties' }), 
      color: 'warning' as const, 
      description: t('admin.properties.bulkActions.suspend.description', { defaultValue: 'These properties will be temporarily suspended from bookings.' }),
      requiresReason: true 
    },
    delete: { 
      title: t('admin.properties.bulkActions.delete.title', { defaultValue: 'Delete Properties' }), 
      color: 'danger' as const, 
      description: t('admin.properties.bulkActions.delete.description', { defaultValue: 'These properties will be permanently deleted. This action cannot be undone.' }),
      requiresReason: true 
    }
  };

  const config = actionConfig[action];

  const handleConfirm = async () => {
    if (config.requiresReason && !reason.trim()) {
      toast.error(t('admin.properties.bulkActions.errors.provideReason', { defaultValue: 'Please provide a reason for this action' }));
      return;
    }

    setIsProcessing(true);
    try {
      await onConfirm(action, properties, reason);
      onClose();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(t('admin.properties.bulkActions.errors.failed', { defaultValue: 'Failed to complete bulk action' }));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalContent>
        <ModalHeader>
          <div className="flex items-center gap-3">
            <div className={`bg- rounded-lg p-2${config.color}-100`}>
              {action === 'approve' && <CheckCircle className={`text- size-5${config.color}-600`} />}
              {action === 'reject' && <XCircle className={`text- size-5${config.color}-600`} />}
              {action === 'suspend' && <Pause className={`text- size-5${config.color}-600`} />}
              {action === 'delete' && <AlertTriangle className={`text- size-5${config.color}-600`} />}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{config.title}</h2>
              <p className="text-sm text-gray-600">{t('admin.properties.bulkActions.selectedCount', { count: properties.length, defaultValue: '{{count}} properties selected' })}</p>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <p className="text-gray-700">{config.description}</p>
            
            {/* Property List */}
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {properties.map(property => (
                <div key={property.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                  <img 
                    src={property.images[0]} 
                    alt={property.title}
                    className="size-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium">{property.title}</h4>
                    <p className="text-xs text-gray-600">
                      {property.location.city}, {property.location.country}
                    </p>
                  </div>
                  <Chip size="sm" variant="flat" color={
                    property.approval_status === 'approved' ? 'success' :
                    property.approval_status === 'pending' ? 'warning' :
                    property.approval_status === 'rejected' ? 'danger' : 'default'
                  }>
                    {property.approval_status}
                  </Chip>
                </div>
              ))}
            </div>

            {/* Reason Input */}
            {config.requiresReason && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('admin.properties.bulkActions.reason.label', { action: action, defaultValue: 'Reason for {{action}}' })} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('admin.properties.bulkActions.reason.placeholder', { action: action, defaultValue: 'Please provide a reason for {{action}}ing these properties...' })}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} disabled={isProcessing}>
            {t('common.buttons.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button 
            color={config.color}
            onPress={handleConfirm}
            isLoading={isProcessing}
            disabled={isProcessing}
          >
            {isProcessing ? t('common.messages.processing', { defaultValue: 'Processing...' }) : t('admin.properties.bulkActions.confirmButton', { action: config.title.split(' ')[0], count: properties.length, defaultValue: '{{action}} {{count}} Properties' })}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const AdminPropertiesMap: React.FC<AdminPropertiesMapProps> = ({
  properties,
  onPropertyClick,
  onPropertiesUpdate,
  className = '',
  height = '600px'
}) => {
  const { t } = useTranslation(['admin', 'common']);
  // State management
  const [selectedProperties, setSelectedProperties] = useState<DatabaseProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<DatabaseProperty[]>(properties);
  const [activeFilters, setActiveFilters] = useState<MapFilter>({
    status: ['approved', 'pending', 'rejected', 'suspended'],
    priceRange: { min: 0, max: 10000 },
    location: '',
    dateRange: { start: null, end: null }
  });
  const [activeTools, setActiveTools] = useState({
    selection: false,
    measurement: false,
    areaSelection: false
  });

  // Modal states
  const { isOpen: isBulkActionOpen, onOpen: onBulkActionOpen, onClose: onBulkActionClose } = useDisclosure();
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'suspend' | 'delete'>('approve');

  // Filter properties based on active filters
  useEffect(() => {
    let filtered = properties;

    // Status filter
    if (activeFilters.status.length > 0 && activeFilters.status.length < 4) {
      filtered = filtered.filter(p => activeFilters.status.includes(p.approval_status as any));
    }

    // Price range filter
    filtered = filtered.filter(p => 
      p.price >= activeFilters.priceRange.min && 
      p.price <= activeFilters.priceRange.max
    );

    // Location filter
    if (activeFilters.location.trim()) {
      const searchTerm = activeFilters.location.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.location.city.toLowerCase().includes(searchTerm) ||
        p.location.country.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
      filtered = filtered.filter(p => {
        const createdDate = new Date(p.created_at);
        const start = activeFilters.dateRange.start;
        const end = activeFilters.dateRange.end;
        
        if (start && end) {
          return createdDate >= start && createdDate <= end;
        } else if (start) {
          return createdDate >= start;
        } else if (end) {
          return createdDate <= end;
        }
        return true;
      });
    }

    setFilteredProperties(filtered);
  }, [properties, activeFilters]);

  // Handle property selection
  const handlePropertySelect = useCallback((property: DatabaseProperty, selected: boolean) => {
    if (selected) {
      setSelectedProperties(prev => [...prev, property]);
    } else {
      setSelectedProperties(prev => prev.filter(p => p.id !== property.id));
    }
  }, []);

  // Handle bulk selection by area
  const handleAreaSelection = useCallback((bounds: any) => {
    const propertiesInArea = filteredProperties.filter(property => {
      const lat = property.coordinates.lat;
      const lng = property.coordinates.lng;
      return lat >= bounds.south && lat <= bounds.north && 
             lng >= bounds.west && lng <= bounds.east;
    });
    setSelectedProperties(propertiesInArea);
    toast.success(t('admin.properties.map.selectedInArea', { count: propertiesInArea.length, defaultValue: 'Selected {{count}} properties in area' }));
  }, [filteredProperties, t]);

  // Toolbar handlers
  const handleFilterChange = useCallback((filters: MapFilter) => {
    setActiveFilters(filters);
  }, []);

  const handleToolToggle = useCallback((tool: 'selection' | 'measurement' | 'areaSelection', active: boolean) => {
    setActiveTools(prev => ({ ...prev, [tool]: active }));
    
    if (tool === 'selection' && !active) {
      setSelectedProperties([]);
    }
  }, []);

  const handleBulkAction = useCallback((action: 'approve' | 'reject' | 'suspend' | 'delete', properties: DatabaseProperty[]) => {
    setBulkAction(action);
    onBulkActionOpen();
  }, [onBulkActionOpen]);

  const handleBulkActionConfirm = useCallback(async (action: string, properties: DatabaseProperty[], reason?: string) => {
    try {
      console.log(`Performing ${action} on ${properties.length} properties:`, { properties, reason });
      
      // Simulate API call to bulk update properties
      const updatedProperties = properties.map(property => ({
        ...property,
        approval_status: action as any,
        rejection_reason: reason || undefined,
        updated_at: new Date().toISOString()
      }));

      // Update local state
      onPropertiesUpdate?.(updatedProperties);
      
      // Clear selection
      setSelectedProperties([]);
      
      toast.success(t('admin.properties.bulkActions.success', { action: action, count: properties.length, defaultValue: 'Successfully {{action}}ed {{count}} properties' }));
    } catch (error) {
      console.error('Bulk action failed:', error);
      throw error;
    }
  }, [onPropertiesUpdate, t]);

  const handleExport = useCallback((properties: DatabaseProperty[], format: 'csv' | 'json' | 'excel') => {
    console.log(`Exporting ${properties.length} properties as ${format}:`, properties);
    
    if (format === 'json') {
      const dataStr = JSON.stringify(properties, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `properties-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'csv') {
      const headers = ['ID', 'Title', 'City', 'Country', 'Price', 'Status', 'Created Date'];
      const csvContent = [
        headers.join(','),
        ...properties.map(p => [
          p.id,
          `"${p.title}"`,
          p.location.city,
          p.location.country,
          p.price,
          p.approval_status,
          new Date(p.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const exportFileDefaultName = `properties-${new Date().toISOString().split('T')[0]}.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
    
    toast.success(t('admin.properties.export.success', { count: properties.length, format: format.toUpperCase(), defaultValue: 'Exported {{count}} properties as {{format}}' }));
  }, [t]);

  const handleRefresh = useCallback(() => {
    console.log('Refreshing properties...');
    // In real implementation, this would refetch data from the API
    toast.success(t('admin.properties.refresh.success', { defaultValue: 'Properties refreshed' }));
  }, [t]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Admin Map Toolbar */}
      <AdminMapToolbar
        properties={filteredProperties}
        selectedProperties={selectedProperties}
        activeFilters={activeFilters}
        activeTools={activeTools}
        onFilterChange={handleFilterChange}
        onToolToggle={handleToolToggle}
        onBulkAction={handleBulkAction}
        onExport={handleExport}
        onRefresh={handleRefresh}
      />

      {/* Map Container */}
      <div className="relative">
        <LazyMapWrapper
          type="properties"
          properties={filteredProperties}
          selectedProperties={selectedProperties}
          height={height}
          enableSelection={activeTools.selection}
          enableMeasurement={activeTools.measurement}
          enableAreaSelection={activeTools.areaSelection}
          onPropertyClick={onPropertyClick}
          onPropertySelect={handlePropertySelect}
          onAreaSelection={handleAreaSelection}
          showPropertyDetails={true}
          showFilters={false}
          customMarkerRenderer={(property) => ({
            status: property.approval_status,
            selected: selectedProperties.some(p => p.id === property.id)
          })}
        />
      </div>

      {/* Bulk Action Modal */}
      <BulkActionModal
        isOpen={isBulkActionOpen}
        onClose={onBulkActionClose}
        action={bulkAction}
        properties={selectedProperties}
        onConfirm={handleBulkActionConfirm}
      />
    </div>
  );
};

export default AdminPropertiesMap; 