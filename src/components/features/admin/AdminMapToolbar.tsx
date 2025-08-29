import React, { useState } from 'react';
import { 
  Button, 
  ButtonGroup, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Chip,
  Input,
  Badge,
  Tooltip
} from '@heroui/react';
import { 
  Filter, 
  Download, 
  Search, 
  MapPin, 
  Square, 
  Ruler,
  RefreshCw,
  CheckCircle,
  XCircle,
  Pause
} from 'lucide-react';
import { DatabaseProperty } from '../../../interfaces/DatabaseProperty';
import { useTranslation } from '../../../lib/stores/translationStore';

export interface MapFilter {
  status: ('approved' | 'pending' | 'rejected' | 'suspended')[];
  priceRange: { min: number; max: number };
  location: string;
  dateRange: { start: Date | null; end: Date | null };
}

export interface AdminMapToolbarProps {
  properties: DatabaseProperty[];
  selectedProperties: DatabaseProperty[];
  activeFilters: MapFilter;
  activeTools: {
    selection: boolean;
    measurement: boolean;
    areaSelection: boolean;
  };
  onFilterChange: (filters: MapFilter) => void;
  onToolToggle: (tool: 'selection' | 'measurement' | 'areaSelection', active: boolean) => void;
  onBulkAction: (action: 'approve' | 'reject' | 'suspend' | 'delete', properties: DatabaseProperty[]) => void;
  onExport: (properties: DatabaseProperty[], format: 'csv' | 'json' | 'excel') => void;
  onRefresh: () => void;
  className?: string;
}

export const AdminMapToolbar: React.FC<AdminMapToolbarProps> = ({
  properties,
  selectedProperties,
  activeFilters,
  activeTools,
  onFilterChange,
  onToolToggle,
  onBulkAction,
  onExport,
  onRefresh,
  className = ''
}) => {
  const { t } = useTranslation(['admin', 'common']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Calculate statistics
  const stats = {
    total: properties.length,
    approved: properties.filter(p => p.approval_status === 'approved').length,
    pending: properties.filter(p => p.approval_status === 'pending').length,
    rejected: properties.filter(p => p.approval_status === 'rejected').length,
    suspended: properties.filter(p => p.approval_status === 'suspended').length,
    selected: selectedProperties.length
  };

  const handleStatusFilter = (status: string) => {
    const currentStatuses = activeFilters.status;
    const newStatuses = currentStatuses.includes(status as any)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status as any];
    
    onFilterChange({
      ...activeFilters,
      status: newStatuses
    });
  };

  const handleLocationSearch = (location: string) => {
    onFilterChange({
      ...activeFilters,
      location
    });
  };

  const handleBulkActionClick = (action: 'approve' | 'reject' | 'suspend' | 'delete') => {
    if (selectedProperties.length === 0) {
      console.warn('No properties selected for bulk action');
      return;
    }
    onBulkAction(action, selectedProperties);
  };

  const clearAllFilters = () => {
    onFilterChange({
      status: ['approved', 'pending', 'rejected', 'suspended'],
      priceRange: { min: 0, max: 10000 },
      location: '',
      dateRange: { start: null, end: null }
    });
    setSearchQuery('');
  };

  return (
    <div className={`space-y-4 border-b border-gray-200 bg-white p-4 ${className}`}>
      {/* Main Toolbar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Section - Search and Filters */}
        <div className="flex flex-1 flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Input
              placeholder={t('admin.mapToolbar.searchPlaceholder', { defaultValue: 'Search by location, property name...' })}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleLocationSearch(e.target.value);
              }}
              startContent={<Search className="size-4 text-gray-400" />}
              className="w-full sm:w-80"
              size="sm"
            />
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary-100 text-primary-700' : ''}
            >
              <Filter className="size-4" />
              {t('admin.mapToolbar.filters', { defaultValue: 'Filters' })}
            </Button>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'approved', label: t('admin.mapToolbar.statusLabels.approved', { defaultValue: 'Approved' }), color: 'success', count: stats.approved },
              { key: 'pending', label: t('admin.mapToolbar.statusLabels.pending', { defaultValue: 'Pending' }), color: 'warning', count: stats.pending },
              { key: 'rejected', label: t('admin.mapToolbar.statusLabels.rejected', { defaultValue: 'Rejected' }), color: 'danger', count: stats.rejected },
              { key: 'suspended', label: t('admin.mapToolbar.statusLabels.suspended', { defaultValue: 'Suspended' }), color: 'default', count: stats.suspended }
            ].map(({ key, label, color, count }) => (
              <Chip
                key={key}
                variant={activeFilters.status.includes(key as any) ? 'solid' : 'bordered'}
                color={color as any}
                size="sm"
                onClick={() => handleStatusFilter(key)}
                className="cursor-pointer transition-opacity hover:opacity-80"
              >
                {label} ({count})
              </Chip>
            ))}
          </div>
        </div>

        {/* Right Section - Tools and Actions */}
        <div className="flex items-center gap-2">
          {/* Map Tools */}
          <ButtonGroup size="sm" variant="light">
            <Tooltip content={t('admin.mapToolbar.tools.selection', { defaultValue: 'Toggle selection mode' })}>
              <Button
                isIconOnly
                onClick={() => onToolToggle('selection', !activeTools.selection)}
                className={activeTools.selection ? 'bg-primary-100 text-primary-700' : ''}
              >
                <Square className="size-4" />
              </Button>
            </Tooltip>
            <Tooltip content={t('admin.mapToolbar.tools.measurement', { defaultValue: 'Distance measurement' })}>
              <Button
                isIconOnly
                onClick={() => onToolToggle('measurement', !activeTools.measurement)}
                className={activeTools.measurement ? 'bg-primary-100 text-primary-700' : ''}
              >
                <Ruler className="size-4" />
              </Button>
            </Tooltip>
            <Tooltip content={t('admin.mapToolbar.tools.areaSelection', { defaultValue: 'Area selection' })}>
              <Button
                isIconOnly
                onClick={() => onToolToggle('areaSelection', !activeTools.areaSelection)}
                className={activeTools.areaSelection ? 'bg-primary-100 text-primary-700' : ''}
              >
                <MapPin className="size-4" />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Button
            variant="light"
            size="sm"
            onClick={onRefresh}
            startContent={<RefreshCw className="size-4" />}
          >
            {t('admin.mapToolbar.refresh', { defaultValue: 'Refresh' })}
          </Button>

          {/* Export Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="light"
                size="sm"
                startContent={<Download className="size-4" />}
              >
                {t('admin.mapToolbar.export', { defaultValue: 'Export' })}
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label={t('admin.mapToolbar.exportOptions', { defaultValue: 'Export options' })}>
              <DropdownItem key="csv" onClick={() => onExport(selectedProperties.length > 0 ? selectedProperties : properties, 'csv')}>
                {t('admin.mapToolbar.exportAs.csv', { defaultValue: 'Export as CSV' })}
              </DropdownItem>
              <DropdownItem key="json" onClick={() => onExport(selectedProperties.length > 0 ? selectedProperties : properties, 'json')}>
                {t('admin.mapToolbar.exportAs.json', { defaultValue: 'Export as JSON' })}
              </DropdownItem>
              <DropdownItem key="excel" onClick={() => onExport(selectedProperties.length > 0 ? selectedProperties : properties, 'excel')}>
                {t('admin.mapToolbar.exportAs.excel', { defaultValue: 'Export as Excel' })}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Bulk Actions Bar (shown when properties are selected) */}
      {selectedProperties.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-primary-200 bg-primary-50 p-3">
          <div className="flex items-center gap-3">
            <Badge content={stats.selected} color="primary">
              <CheckCircle className="size-5 text-primary-600" />
            </Badge>
            <span className="text-sm font-medium text-primary-700">
              {t('admin.mapToolbar.selectedCount', { count: stats.selected, defaultValue: '{{count}} propert{{count === 1 ? "y" : "ies"}} selected' })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <ButtonGroup size="sm">
              <Tooltip content={t('admin.mapToolbar.bulkActions.approve', { defaultValue: 'Approve selected' })}>
                <Button
                  color="success"
                  variant="light"
                  onClick={() => handleBulkActionClick('approve')}
                  startContent={<CheckCircle className="size-4" />}
                >
                  {t('admin.mapToolbar.bulkActions.approveButton', { defaultValue: 'Approve' })}
                </Button>
              </Tooltip>
              <Tooltip content={t('admin.mapToolbar.bulkActions.reject', { defaultValue: 'Reject selected' })}>
                <Button
                  color="danger"
                  variant="light"
                  onClick={() => handleBulkActionClick('reject')}
                  startContent={<XCircle className="size-4" />}
                >
                  {t('admin.mapToolbar.bulkActions.rejectButton', { defaultValue: 'Reject' })}
                </Button>
              </Tooltip>
              <Tooltip content={t('admin.mapToolbar.bulkActions.suspend', { defaultValue: 'Suspend selected' })}>
                <Button
                  color="warning"
                  variant="light"
                  onClick={() => handleBulkActionClick('suspend')}
                  startContent={<Pause className="size-4" />}
                >
                  {t('admin.mapToolbar.bulkActions.suspendButton', { defaultValue: 'Suspend' })}
                </Button>
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>
      )}

      {/* Advanced Filters (collapsible) */}
      {showFilters && (
        <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">{t('admin.mapToolbar.advancedFilters.title', { defaultValue: 'Advanced Filters' })}</h3>
            <Button
              size="sm"
              variant="light"
              onClick={clearAllFilters}
              className="text-primary-600 hover:text-primary-700"
            >
              {t('admin.mapToolbar.advancedFilters.clearAll', { defaultValue: 'Clear All' })}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                {t('admin.mapToolbar.advancedFilters.priceRange', { defaultValue: 'Price Range (per night)' })}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  size="sm"
                  placeholder={t('admin.mapToolbar.advancedFilters.min', { defaultValue: 'Min' })}
                  type="number"
                  value={activeFilters.priceRange.min.toString()}
                  onChange={(e) => onFilterChange({
                    ...activeFilters,
                    priceRange: { ...activeFilters.priceRange, min: Number(e.target.value) || 0 }
                  })}
                />
                <span className="text-gray-400">-</span>
                <Input
                  size="sm"
                  placeholder={t('admin.mapToolbar.advancedFilters.max', { defaultValue: 'Max' })}
                  type="number"
                  value={activeFilters.priceRange.max.toString()}
                  onChange={(e) => onFilterChange({
                    ...activeFilters,
                    priceRange: { ...activeFilters.priceRange, max: Number(e.target.value) || 10000 }
                  })}
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                {t('admin.mapToolbar.advancedFilters.dateRange', { defaultValue: 'Created Date Range' })}
              </label>
              <div className="flex items-center gap-2">
                <Input
                  size="sm"
                  type="date"
                  onChange={(e) => onFilterChange({
                    ...activeFilters,
                    dateRange: { 
                      ...activeFilters.dateRange, 
                      start: e.target.value ? new Date(e.target.value) : null 
                    }
                  })}
                />
                <span className="text-gray-400">-</span>
                <Input
                  size="sm"
                  type="date"
                  onChange={(e) => onFilterChange({
                    ...activeFilters,
                    dateRange: { 
                      ...activeFilters.dateRange, 
                      end: e.target.value ? new Date(e.target.value) : null 
                    }
                  })}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                {t('admin.mapToolbar.advancedFilters.quickStats', { defaultValue: 'Quick Stats' })}
              </label>
              <div className="space-y-1 text-sm text-gray-600">
                <div>{t('admin.mapToolbar.advancedFilters.totalProperties', { defaultValue: 'Total Properties' })}: {stats.total}</div>
                <div>{t('admin.mapToolbar.advancedFilters.visible', { defaultValue: 'Visible' })}: {properties.length}</div>
                <div>{t('admin.mapToolbar.advancedFilters.selected', { defaultValue: 'Selected' })}: {stats.selected}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMapToolbar; 