import React, { useState, useCallback } from 'react';
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
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Pause
} from 'lucide-react';
import { DatabaseProperty } from '../../../interfaces/DatabaseProperty';

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
    <div className={`bg-white border-b border-gray-200 p-4 space-y-4 ${className}`}>
      {/* Main Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Section - Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by location, property name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleLocationSearch(e.target.value);
              }}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              className="w-full sm:w-80"
              size="sm"
            />
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary-100 text-primary-700' : ''}
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'approved', label: 'Approved', color: 'success', count: stats.approved },
              { key: 'pending', label: 'Pending', color: 'warning', count: stats.pending },
              { key: 'rejected', label: 'danger', count: stats.rejected },
              { key: 'suspended', label: 'Suspended', color: 'default', count: stats.suspended }
            ].map(({ key, label, color, count }) => (
              <Chip
                key={key}
                variant={activeFilters.status.includes(key as any) ? 'solid' : 'bordered'}
                color={color as any}
                size="sm"
                onClick={() => handleStatusFilter(key)}
                className="cursor-pointer hover:opacity-80 transition-opacity"
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
            <Tooltip content="Toggle selection mode">
              <Button
                isIconOnly
                onClick={() => onToolToggle('selection', !activeTools.selection)}
                className={activeTools.selection ? 'bg-primary-100 text-primary-700' : ''}
              >
                <Square className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Distance measurement">
              <Button
                isIconOnly
                onClick={() => onToolToggle('measurement', !activeTools.measurement)}
                className={activeTools.measurement ? 'bg-primary-100 text-primary-700' : ''}
              >
                <Ruler className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Area selection">
              <Button
                isIconOnly
                onClick={() => onToolToggle('areaSelection', !activeTools.areaSelection)}
                className={activeTools.areaSelection ? 'bg-primary-100 text-primary-700' : ''}
              >
                <MapPin className="w-4 h-4" />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Button
            variant="light"
            size="sm"
            onClick={onRefresh}
            startContent={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>

          {/* Export Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="light"
                size="sm"
                startContent={<Download className="w-4 h-4" />}
              >
                Export
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Export options">
              <DropdownItem key="csv" onClick={() => onExport(selectedProperties.length > 0 ? selectedProperties : properties, 'csv')}>
                Export as CSV
              </DropdownItem>
              <DropdownItem key="json" onClick={() => onExport(selectedProperties.length > 0 ? selectedProperties : properties, 'json')}>
                Export as JSON
              </DropdownItem>
              <DropdownItem key="excel" onClick={() => onExport(selectedProperties.length > 0 ? selectedProperties : properties, 'excel')}>
                Export as Excel
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Bulk Actions Bar (shown when properties are selected) */}
      {selectedProperties.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Badge content={stats.selected} color="primary">
              <CheckCircle className="w-5 h-5 text-primary-600" />
            </Badge>
            <span className="text-sm font-medium text-primary-700">
              {stats.selected} propert{stats.selected === 1 ? 'y' : 'ies'} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <ButtonGroup size="sm">
              <Tooltip content="Approve selected">
                <Button
                  color="success"
                  variant="light"
                  onClick={() => handleBulkActionClick('approve')}
                  startContent={<CheckCircle className="w-4 h-4" />}
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip content="Reject selected">
                <Button
                  color="danger"
                  variant="light"
                  onClick={() => handleBulkActionClick('reject')}
                  startContent={<XCircle className="w-4 h-4" />}
                >
                  Reject
                </Button>
              </Tooltip>
              <Tooltip content="Suspend selected">
                <Button
                  color="warning"
                  variant="light"
                  onClick={() => handleBulkActionClick('suspend')}
                  startContent={<Pause className="w-4 h-4" />}
                >
                  Suspend
                </Button>
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>
      )}

      {/* Advanced Filters (collapsible) */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Advanced Filters</h3>
            <Button
              size="sm"
              variant="light"
              onClick={clearAllFilters}
              className="text-primary-600 hover:text-primary-700"
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Price Range (per night)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  size="sm"
                  placeholder="Min"
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
                  placeholder="Max"
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
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Created Date Range
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
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Quick Stats
              </label>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Total Properties: {stats.total}</div>
                <div>Visible: {properties.length}</div>
                <div>Selected: {stats.selected}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMapToolbar; 