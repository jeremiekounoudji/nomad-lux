import { DatabaseProperty } from '../interfaces/DatabaseProperty';
import { MeasurementLine, MeasurementArea } from '../components/map/MapMeasurementTools';
import { MapCoordinates } from '../interfaces/Map';
import toast from 'react-hot-toast';

export interface ExportRegion {
  id: string;
  name: string;
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: MapCoordinates;
  properties: DatabaseProperty[];
  measurements?: {
    lines: MeasurementLine[];
    areas: MeasurementArea[];
  };
}

export interface ExportData {
  metadata: {
    exportDate: string;
    exportedBy: string;
    totalProperties: number;
    regions?: number;
    filters?: any;
    mapBounds?: any;
  };
  properties: DatabaseProperty[];
  regions?: ExportRegion[];
  measurements?: {
    lines: MeasurementLine[];
    areas: MeasurementArea[];
  };
  summary: {
    statusBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
    priceStats: {
      min: number;
      max: number;
      average: number;
      median: number;
    };
    revenueStats: {
      total: number;
      average: number;
      topEarners: Array<{ id: string; title: string; revenue: number }>;
    };
  };
}

// Utility function to calculate property statistics
const calculatePropertyStats = (properties: DatabaseProperty[]) => {
  const statusBreakdown: Record<string, number> = {
    approved: 0,
    pending: 0,
    rejected: 0,
    suspended: 0
  };

  const locationBreakdown: Record<string, number> = {};
  const prices: number[] = [];
  const revenues: Array<{ id: string; title: string; revenue: number }> = [];

  properties.forEach(property => {
    // Status breakdown
    statusBreakdown[property.status] = (statusBreakdown[property.status] || 0) + 1;

    // Location breakdown
    const location = `${property.location.city}, ${property.location.country}`;
    locationBreakdown[location] = (locationBreakdown[location] || 0) + 1;

    // Price statistics
    prices.push(property.price_per_night);

    // Revenue statistics
    const revenue = property.total_revenue || 0;
    revenues.push({
      id: property.id,
      title: property.title,
      revenue
    });
  });

  // Sort prices for median calculation
  prices.sort((a, b) => a - b);
  const median = prices.length > 0 
    ? prices.length % 2 === 0 
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)]
    : 0;

  // Sort revenues for top earners
  revenues.sort((a, b) => b.revenue - a.revenue);

  return {
    statusBreakdown,
    locationBreakdown,
    priceStats: {
      min: Math.min(...prices) || 0,
      max: Math.max(...prices) || 0,
      average: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0,
      median
    },
    revenueStats: {
      total: revenues.reduce((sum, item) => sum + item.revenue, 0),
      average: revenues.length > 0 ? revenues.reduce((sum, item) => sum + item.revenue, 0) / revenues.length : 0,
      topEarners: revenues.slice(0, 10)
    }
  };
};

// CSV Export Functions
export const exportPropertiesAsCSV = (
  properties: DatabaseProperty[],
  options: {
    filename?: string;
    includeHost?: boolean;
    includeMetrics?: boolean;
    includeCoordinates?: boolean;
  } = {}
) => {
  const {
    filename = `properties-export-${new Date().toISOString().split('T')[0]}`,
    includeHost = true,
    includeMetrics = true,
    includeCoordinates = false
  } = options;

  // Define CSV headers
  const baseHeaders = [
    'ID', 'Title', 'Description', 'Status', 'Price', 'Currency',
    'Max Guests', 'Bedrooms', 'Bathrooms', 'Property Type',
    'City', 'Country', 'Created Date', 'Updated Date'
  ];

  const hostHeaders = includeHost 
    ? ['Host Name', 'Host Email', 'Host Rating', 'Host Verified']
    : [];

  const metricsHeaders = includeMetrics 
    ? ['Rating', 'Review Count', 'Total Bookings', 'View Count', 'Total Revenue']
    : [];

  const coordinateHeaders = includeCoordinates 
    ? ['Latitude', 'Longitude']
    : [];

  const headers = [...baseHeaders, ...hostHeaders, ...metricsHeaders, ...coordinateHeaders];

  // Generate CSV rows
  const rows = properties.map(property => {
    const baseData = [
      property.id,
      `"${property.title.replace(/"/g, '""')}"`,
      `"${property.description.replace(/"/g, '""')}"`,
      property.status,
      property.price_per_night,
      property.currency || 'USD',
      property.max_guests,
      property.bedrooms,
      property.bathrooms,
      property.property_type,
      property.location.city,
      property.location.country,
      new Date(property.created_at).toLocaleDateString(),
      new Date(property.updated_at).toLocaleDateString()
    ];

    const hostData = includeHost ? [
      property.host_id, // Using host_id instead of host.display_name
      '', // Email not available in DatabaseProperty
      0, // Rating not available
      'Unknown' // Verification status not available
    ] : [];

    const metricsData = includeMetrics ? [
      property.rating || 0,
      property.review_count || 0,
      property.booking_count || 0,
      property.view_count || 0,
      property.total_revenue || 0
    ] : [];

    const coordinateData = includeCoordinates ? [
      property.location.coordinates.lat,
      property.location.coordinates.lng
    ] : [];

    return [...baseData, ...hostData, ...metricsData, ...coordinateData];
  });

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Download file
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  toast.success(`Exported ${properties.length} properties as CSV`);
};

// JSON Export Function
export const exportPropertiesAsJSON = (
  properties: DatabaseProperty[],
  options: {
    filename?: string;
    includeFullData?: boolean;
    includeStatistics?: boolean;
    regions?: ExportRegion[];
    measurements?: { lines: MeasurementLine[]; areas: MeasurementArea[] };
  } = {}
) => {
  const {
    filename = `properties-export-${new Date().toISOString().split('T')[0]}`,
    includeFullData = true,
    includeStatistics = true,
    regions,
    measurements
  } = options;

  const exportData: ExportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      exportedBy: 'Admin User', // Could be passed as parameter
      totalProperties: properties.length,
      regions: regions?.length || 0
    },
    properties: includeFullData ? properties : properties.map(p => ({
      id: p.id,
      title: p.title,
      price: p.price_per_night,
      status: p.status,
      location: p.location,
      coordinates: p.location.coordinates,
      created_at: p.created_at
    } as any)),
    summary: includeStatistics ? calculatePropertyStats(properties) : {} as any
  };

  if (regions) {
    exportData.regions = regions;
  }

  if (measurements) {
    exportData.measurements = measurements;
  }

  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
  toast.success(`Exported ${properties.length} properties as JSON`);
};

// Excel Export Function (generates CSV with Excel-friendly formatting)
export const exportPropertiesAsExcel = (
  properties: DatabaseProperty[],
  options: {
    filename?: string;
    includeCharts?: boolean;
    multipleSheets?: boolean;
  } = {}
) => {
  const {
    filename = `properties-export-${new Date().toISOString().split('T')[0]}`,
    // includeCharts = false, // Commented out to avoid unused variable warning
    multipleSheets = true
  } = options;

  if (multipleSheets) {
    // Create multiple sheets structure
    const stats = calculatePropertyStats(properties);
    
    // Properties sheet
    const propertiesCSV = generatePropertiesSheet(properties);
    
    // Statistics sheet
    const statisticsCSV = generateStatisticsSheet(stats);
    
    // Locations sheet
    const locationsCSV = generateLocationsSheet(properties);

    // Combine sheets (simplified approach - in real implementation, use a proper Excel library)
    const combinedContent = [
      '--- PROPERTIES ---',
      propertiesCSV,
      '',
      '--- STATISTICS ---',
      statisticsCSV,
      '',
      '--- LOCATIONS ---',
      locationsCSV
    ].join('\n');

    downloadFile(combinedContent, `${filename}.csv`, 'text/csv');
  } else {
    // Single sheet with all data
    exportPropertiesAsCSV(properties, {
      filename,
      includeHost: true,
      includeMetrics: true,
      includeCoordinates: true
    });
  }
  
  toast.success(`Exported ${properties.length} properties as Excel-compatible format`);
};

// Region Export Function
export const exportRegionData = (
  region: ExportRegion,
  format: 'csv' | 'json' | 'excel' = 'json',
  options: { filename?: string } = {}
) => {
  const filename = options.filename || `region-${region.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`;

  const regionData = {
    region: {
      id: region.id,
      name: region.name,
      bounds: region.bounds,
      center: region.center,
      propertyCount: region.properties.length
    },
    properties: region.properties,
    measurements: region.measurements,
    summary: calculatePropertyStats(region.properties),
    metadata: {
      exportDate: new Date().toISOString(),
      exportType: 'region',
      format
    }
  };

  switch (format) {
    case 'csv':
      exportPropertiesAsCSV(region.properties, { filename });
      break;
    case 'excel':
      exportPropertiesAsExcel(region.properties, { filename });
      break;
    case 'json':
    default:
      const jsonContent = JSON.stringify(regionData, null, 2);
      downloadFile(jsonContent, `${filename}.json`, 'application/json');
      break;
  }

  toast.success(`Exported region "${region.name}" with ${region.properties.length} properties`);
};

// Bulk Export Function
export const bulkExportRegions = (
  regions: ExportRegion[],
  format: 'csv' | 'json' | 'excel' = 'json'
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const allProperties = regions.flatMap(region => region.properties);

  const bulkData = {
    metadata: {
      exportDate: new Date().toISOString(),
      totalRegions: regions.length,
      totalProperties: allProperties.length,
      format
    },
    regions: regions.map(region => ({
      ...region,
      summary: calculatePropertyStats(region.properties)
    })),
    overall_summary: calculatePropertyStats(allProperties)
  };

  const filename = `bulk-regions-export-${timestamp}`;
  const jsonContent = JSON.stringify(bulkData, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
  
  toast.success(`Exported ${regions.length} regions with ${allProperties.length} total properties`);
};

// Helper function to download files
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Helper functions for generating different sheets
const generatePropertiesSheet = (properties: DatabaseProperty[]): string => {
  const headers = [
    'ID', 'Title', 'Status', 'Price', 'City', 'Country', 
    'Rating', 'Bookings', 'Revenue', 'Created Date'
  ];
  
  const rows = properties.map(p => [
    p.id,
    `"${p.title.replace(/"/g, '""')}"`,
    p.status,
    p.price_per_night,
    p.location.city,
    p.location.country,
    p.rating || 0,
    p.booking_count || 0,
    p.total_revenue || 0,
    new Date(p.created_at).toLocaleDateString()
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

const generateStatisticsSheet = (stats: ReturnType<typeof calculatePropertyStats>): string => {
  const rows = [
    ['Metric', 'Value'],
    ['Total Properties', Object.values(stats.statusBreakdown).reduce((sum, count) => sum + count, 0)],
    ['Approved', stats.statusBreakdown.approved],
    ['Pending', stats.statusBreakdown.pending],
    ['Rejected', stats.statusBreakdown.rejected],
    ['Suspended', stats.statusBreakdown.suspended],
    ['Average Price', stats.priceStats.average.toFixed(2)],
    ['Median Price', stats.priceStats.median.toFixed(2)],
    ['Min Price', stats.priceStats.min],
    ['Max Price', stats.priceStats.max],
    ['Total Revenue', stats.revenueStats.total.toFixed(2)],
    ['Average Revenue', stats.revenueStats.average.toFixed(2)]
  ];

  return rows.map(row => row.join(',')).join('\n');
};

const generateLocationsSheet = (properties: DatabaseProperty[]): string => {
  const locationStats: Record<string, { count: number; revenue: number }> = {};
  
  properties.forEach(property => {
    const location = `${property.location.city}, ${property.location.country}`;
    if (!locationStats[location]) {
      locationStats[location] = { count: 0, revenue: 0 };
    }
    locationStats[location].count++;
    locationStats[location].revenue += property.total_revenue || 0;
  });

  const rows = [
    ['Location', 'Property Count', 'Total Revenue', 'Average Revenue'],
    ...Object.entries(locationStats).map(([location, stats]) => [
      location,
      stats.count,
      stats.revenue.toFixed(2),
      (stats.revenue / stats.count).toFixed(2)
    ])
  ];

  return rows.map(row => row.join(',')).join('\n');
};

export default {
  exportPropertiesAsCSV,
  exportPropertiesAsJSON,
  exportPropertiesAsExcel,
  exportRegionData,
  bulkExportRegions
}; 