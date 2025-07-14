import React from 'react';
import { Button } from '@heroui/react';
import { Grid, Map } from 'lucide-react';

interface MapToggleProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
  className?: string;
}

export const MapToggle: React.FC<MapToggleProps> = ({ view, onViewChange, className = '' }) => {
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <Button
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-l-lg ${
          view === 'list'
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onViewChange('list')}
      >
        <Grid className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </Button>
      <Button
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-r-lg ${
          view === 'map'
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onViewChange('map')}
      >
        <Map className="w-4 h-4" />
        <span className="hidden sm:inline">Map</span>
      </Button>
    </div>
  );
}; 