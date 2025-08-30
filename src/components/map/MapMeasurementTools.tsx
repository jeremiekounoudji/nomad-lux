import React, { useState, useCallback } from 'react';
import { 
  Button, 
  ButtonGroup, 
  Card, 
  CardBody,
  Chip,
  Tooltip,
  Divider
} from '@heroui/react';
import { 
  Ruler, 
  Square,
  RotateCcw,
  Trash2,
  Copy,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from '../../lib/stores/translationStore';

export interface MeasurementPoint {
  lat: number;
  lng: number;
  id: string;
}

export interface MeasurementLine {
  id: string;
  points: MeasurementPoint[];
  distance: number;
  color: string;
}

export interface MeasurementArea {
  id: string;
  points: MeasurementPoint[];
  area: number;
  perimeter: number;
  color: string;
  type: 'rectangle' | 'circle' | 'polygon';
}

export interface MapMeasurementToolsProps {
  activeTool: 'distance' | 'area' | null;
  onToolChange: (tool: 'distance' | 'area' | null) => void;
  measurements: {
    lines: MeasurementLine[];
    areas: MeasurementArea[];
  };
  onMeasurementsChange: (measurements: { lines: MeasurementLine[]; areas: MeasurementArea[] }) => void;
  className?: string;
}

// Utility functions for calculations
const calculateDistance = (point1: MeasurementPoint, point2: MeasurementPoint): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const calculateLineDistance = (points: MeasurementPoint[]): number => {
  let totalDistance = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalDistance += calculateDistance(points[i], points[i + 1]);
  }
  return totalDistance;
};

const calculatePolygonArea = (points: MeasurementPoint[]): number => {
  if (points.length < 3) return 0;
  
  let area = 0;
  const n = points.length;
  
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].lat * points[j].lng;
    area -= points[j].lat * points[i].lng;
  }
  
  area = Math.abs(area) / 2;
  
  // Convert to square kilometers (rough approximation)
  const R = 6371; // Earth's radius in km
  const factor = (Math.PI * R * R) / (180 * 180);
  return area * factor;
};

const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(2)} km`;
};

const formatArea = (areaKm2: number): string => {
  if (areaKm2 < 1) {
    return `${Math.round(areaKm2 * 1000000)} m²`;
  }
  return `${areaKm2.toFixed(2)} km²`;
};

export const MapMeasurementTools: React.FC<MapMeasurementToolsProps> = ({
  activeTool,
  onToolChange,
  measurements,
  onMeasurementsChange,
  className = ''
}) => {
  const { t } = useTranslation('common');
  const [currentLine, setCurrentLine] = useState<MeasurementPoint[]>([]);
  const [currentArea, setCurrentArea] = useState<MeasurementPoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<string | null>(null);

  // Generate random color for new measurements
  const generateColor = (): string => {
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle tool activation
  const handleToolActivation = (tool: 'distance' | 'area') => {
    if (activeTool === tool) {
      onToolChange(null);
      setIsDrawing(false);
      setCurrentLine([]);
      setCurrentArea([]);
    } else {
      onToolChange(tool);
      setIsDrawing(true);
      setCurrentLine([]);
      setCurrentArea([]);
    }
  };

  // Complete current measurement
  const completeMeasurement = useCallback(() => {
    if (activeTool === 'distance' && currentLine.length >= 2) {
      const newLine: MeasurementLine = {
        id: `line_${Date.now()}`,
        points: [...currentLine],
        distance: calculateLineDistance(currentLine),
        color: generateColor()
      };
      
      onMeasurementsChange({
        ...measurements,
        lines: [...measurements.lines, newLine]
      });
      
      setCurrentLine([]);
      toast.success(t('map.measurement.messages.distanceCompleted', { distance: formatDistance(newLine.distance) }));
    } else if (activeTool === 'area' && currentArea.length >= 3) {
      const area = calculatePolygonArea(currentArea);
      const perimeter = calculateLineDistance([...currentArea, currentArea[0]]);
      
      const newArea: MeasurementArea = {
        id: `area_${Date.now()}`,
        points: [...currentArea],
        area,
        perimeter,
        color: generateColor(),
        type: 'polygon'
      };
      
      onMeasurementsChange({
        ...measurements,
        areas: [...measurements.areas, newArea]
      });
      
      setCurrentArea([]);
      toast.success(t('map.measurement.messages.areaCompleted', { area: formatArea(area) }));
    }
    
    setIsDrawing(false);
  }, [activeTool, currentLine, currentArea, measurements, onMeasurementsChange]);

  // Cancel current measurement
  const cancelMeasurement = () => {
    setCurrentLine([]);
    setCurrentArea([]);
    setIsDrawing(false);
    onToolChange(null);
  };

  // Clear all measurements
  const clearAllMeasurements = () => {
    onMeasurementsChange({ lines: [], areas: [] });
    setSelectedMeasurement(null);
    toast.success(t('map.measurement.messages.allCleared'));
  };

  // Delete specific measurement
  const deleteMeasurement = (id: string, type: 'line' | 'area') => {
    if (type === 'line') {
      onMeasurementsChange({
        ...measurements,
        lines: measurements.lines.filter(line => line.id !== id)
      });
    } else {
      onMeasurementsChange({
        ...measurements,
        areas: measurements.areas.filter(area => area.id !== id)
      });
    }
    
    if (selectedMeasurement === id) {
      setSelectedMeasurement(null);
    }
    
    toast.success(t('map.measurement.messages.deleted'));
  };

  // Copy measurement data
  const copyMeasurementData = () => {
    const data = {
      lines: measurements.lines.map(line => ({
        points: line.points,
        distance: line.distance
      })),
      areas: measurements.areas.map(area => ({
        points: area.points,
        area: area.area,
        perimeter: area.perimeter
      }))
    };
    
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success(t('map.measurement.messages.dataCopied'));
  };

  // Export measurements
  const exportMeasurements = () => {
    const data = {
      timestamp: new Date().toISOString(),
      measurements: {
        lines: measurements.lines,
        areas: measurements.areas
      },
      summary: {
        totalLines: measurements.lines.length,
        totalAreas: measurements.areas.length,
        totalDistance: measurements.lines.reduce((sum, line) => sum + line.distance, 0),
        totalArea: measurements.areas.reduce((sum, area) => sum + area.area, 0)
      }
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `map-measurements-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success(t('map.measurement.messages.exported'));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Tool Selection */}
      <Card className="shadow-sm">
        <CardBody className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t('map.measurement.title')}</h3>
            <div className="flex items-center gap-2">
              <Tooltip content={t('map.measurement.actions.copyData')}>
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onClick={copyMeasurementData}
                  isDisabled={measurements.lines.length === 0 && measurements.areas.length === 0}
                >
                  <Copy className="size-4" />
                </Button>
              </Tooltip>
              <Tooltip content={t('map.measurement.actions.exportMeasurements')}>
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onClick={exportMeasurements}
                  isDisabled={measurements.lines.length === 0 && measurements.areas.length === 0}
                >
                  <Download className="size-4" />
                </Button>
              </Tooltip>
              <Tooltip content={t('map.measurement.actions.clearAll')}>
                <Button
                  size="sm"
                  variant="light"
                  isIconOnly
                  onClick={clearAllMeasurements}
                  isDisabled={measurements.lines.length === 0 && measurements.areas.length === 0}
                >
                  <Trash2 className="size-4" />
                </Button>
              </Tooltip>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Tool Buttons */}
            <ButtonGroup className="w-full">
              <Button
                onClick={() => handleToolActivation('distance')}
                variant={activeTool === 'distance' ? 'solid' : 'bordered'}
                color={activeTool === 'distance' ? 'primary' : 'default'}
                startContent={<Ruler className="size-4" />}
                className="flex-1"
              >
                {t('map.measurement.distance')}
              </Button>
              <Button
                onClick={() => handleToolActivation('area')}
                variant={activeTool === 'area' ? 'solid' : 'bordered'}
                color={activeTool === 'area' ? 'primary' : 'default'}
                startContent={<Square className="size-4" />}
                className="flex-1"
              >
                {t('map.measurement.area')}
              </Button>
            </ButtonGroup>

            {/* Active Tool Instructions */}
            {activeTool && (
              <div className="rounded-lg border border-primary-200 bg-primary-50 p-3">
                <div className="flex items-center justify-between">
                                  <div className="text-sm text-primary-700">
                  {activeTool === 'distance' ? (
                    <>{t('map.measurement.instructions.distance')}</>
                  ) : (
                    <>{t('map.measurement.instructions.area')}</>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="light"
                  onClick={cancelMeasurement}
                  startContent={<RotateCcw className="size-4" />}
                >
                  {t('map.measurement.cancel')}
                </Button>
                </div>
                
                {/* Current measurement info */}
                {isDrawing && (
                  <div className="mt-2 text-xs text-primary-600">
                    {activeTool === 'distance' && currentLine.length > 0 && (
                      <div>{t('map.measurement.current.points')}: {currentLine.length} | {t('map.measurement.current.currentDistance')}: {formatDistance(calculateLineDistance(currentLine))}</div>
                    )}
                    {activeTool === 'area' && currentArea.length > 0 && (
                      <div>{t('map.measurement.current.points')}: {currentArea.length} | {currentArea.length >= 3 ? `${t('map.measurement.area')}: ${formatArea(calculatePolygonArea(currentArea))}` : t('map.measurement.current.needMorePoints')}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Measurements List */}
      {(measurements.lines.length > 0 || measurements.areas.length > 0) && (
        <Card className="shadow-sm">
          <CardBody className="p-4">
            <h4 className="mb-3 font-semibold">{t('map.measurement.measurements')}</h4>
            
            <div className="max-h-64 space-y-3 overflow-y-auto">
              {/* Distance Measurements */}
              {measurements.lines.map((line, index) => (
                <div 
                  key={line.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    selectedMeasurement === line.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMeasurement(selectedMeasurement === line.id ? null : line.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-4 rounded-full border-2"
                        style={{ backgroundColor: line.color }}
                      />
                      <div>
                        <div className="text-sm font-medium">{t('map.measurement.items.distance', { index: index + 1 })}</div>
                        <div className="text-xs text-gray-600">{formatDistance(line.distance)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="flat">
                        {t('map.measurement.items.points', { count: line.points.length })}
                      </Chip>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMeasurement(line.id, 'line');
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Area Measurements */}
              {measurements.areas.map((area, index) => (
                <div 
                  key={area.id}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    selectedMeasurement === area.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedMeasurement(selectedMeasurement === area.id ? null : area.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="size-4 rounded border-2"
                        style={{ backgroundColor: `${area.color}33`, borderColor: area.color }}
                      />
                      <div>
                        <div className="text-sm font-medium">{t('map.measurement.items.area', { index: index + 1 })}</div>
                        <div className="text-xs text-gray-600">
                          {formatArea(area.area)} | {t('map.measurement.items.perimeter')}: {formatDistance(area.perimeter)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Chip size="sm" variant="flat">
                        {t('map.measurement.items.points', { count: area.points.length })}
                      </Chip>
                      <Button
                        size="sm"
                        variant="light"
                        isIconOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMeasurement(area.id, 'area');
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <Divider className="my-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">{t('map.measurement.summary.totalDistanceLines')}</div>
                <div className="font-semibold">{measurements.lines.length}</div>
              </div>
              <div>
                <div className="text-gray-600">{t('map.measurement.summary.totalAreas')}</div>
                <div className="font-semibold">{measurements.areas.length}</div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default MapMeasurementTools; 