import React from 'react';
import { Button } from '@heroui/react';
import { Grid, Map } from 'lucide-react';
import { useTranslation } from '../../../lib/stores/translationStore';

interface MapToggleProps {
  view: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
  className?: string;
}

export const MapToggle: React.FC<MapToggleProps> = ({ view, onViewChange, className = '' }) => {
  const { t } = useTranslation(['search', 'common']);
  
  return (
    <div className={`inline-flex rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <Button
        className={`flex items-center gap-2 rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
          view === 'list'
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onViewChange('list')}
      >
        <Grid className="size-4" />
        <span className="hidden sm:inline">{t('search.viewToggle.list', { defaultValue: 'List' })}</span>
      </Button>
      <Button
        className={`flex items-center gap-2 rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${
          view === 'map'
            ? 'bg-primary-500 text-white hover:bg-primary-600'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        onClick={() => onViewChange('map')}
      >
        <Map className="size-4" />
        <span className="hidden sm:inline">{t('search.viewToggle.map', { defaultValue: 'Map' })}</span>
      </Button>
    </div>
  );
}; 