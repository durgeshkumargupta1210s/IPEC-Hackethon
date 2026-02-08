/**
 * Mock regions data for testing
 * Use this data if the backend is unavailable
 */

export const mockRegions = [
  {
    id: '1',
    name: 'Eastern Valley Park',
    riskLevel: 'HIGH',
    vegetationLoss: 52.8,
    confidence: 89,
    trend: 'increasing',
    description: 'Significant vegetation damage detected.',
    location: { lat: 40.7128, lng: -74.0060 },
    area: 125.5,
    ndvi: { mean: 0.245, min: -0.120, max: 0.680, stdDev: 0.180 },
    riskClassification: {
      riskLevel: 'HIGH',
      riskScore: 0.85,
      confidenceScore: 0.89
    },
    areaAffected: 52.8,
    vegetationLossPercentage: 52.8,
  },
  {
    id: '2',
    name: 'Southern Grassland',
    riskLevel: 'LOW',
    vegetationLoss: 8.2,
    confidence: 91,
    trend: 'stable',
    description: 'Healthy vegetation cover.',
    location: { lat: 34.0522, lng: -118.2437 },
    area: 210.3,
    ndvi: { mean: 0.652, min: 0.410, max: 0.890, stdDev: 0.095 },
    riskClassification: {
      riskLevel: 'LOW',
      riskScore: 0.15,
      confidenceScore: 0.91
    },
    areaAffected: 8.2,
    vegetationLossPercentage: 8.2,
  },
  {
    id: '3',
    name: 'Western Forest Reserve',
    riskLevel: 'MEDIUM',
    vegetationLoss: 28.5,
    confidence: 85,
    trend: 'increasing',
    description: 'Moderate vegetation decline detected.',
    location: { lat: 47.6062, lng: -122.3321 },
    area: 445.7,
    ndvi: { mean: 0.485, min: 0.205, max: 0.750, stdDev: 0.142 },
    riskClassification: {
      riskLevel: 'MEDIUM',
      riskScore: 0.55,
      confidenceScore: 0.85
    },
    areaAffected: 28.5,
    vegetationLossPercentage: 28.5,
  },
  {
    id: '4',
    name: 'Northern Wetlands',
    riskLevel: 'LOW',
    vegetationLoss: 5.1,
    confidence: 88,
    trend: 'stable',
    description: 'Stable wetland ecosystem.',
    location: { lat: 41.8781, lng: -87.6298 },
    area: 89.2,
    ndvi: { mean: 0.612, min: 0.320, max: 0.810, stdDev: 0.108 },
    riskClassification: {
      riskLevel: 'LOW',
      riskScore: 0.12,
      confidenceScore: 0.88
    },
    areaAffected: 5.1,
    vegetationLossPercentage: 5.1,
  },
  {
    id: '5',
    name: 'Central Desert Basin',
    riskLevel: 'HIGH',
    vegetationLoss: 61.3,
    confidence: 92,
    trend: 'increasing',
    description: 'Critical vegetation loss in arid region.',
    location: { lat: 39.7392, lng: -104.9903 },
    area: 567.8,
    ndvi: { mean: 0.182, min: -0.250, max: 0.420, stdDev: 0.198 },
    riskClassification: {
      riskLevel: 'HIGH',
      riskScore: 0.92,
      confidenceScore: 0.92
    },
    areaAffected: 61.3,
    vegetationLossPercentage: 61.3,
  },
  {
    id: '6',
    name: 'Tropical Rainforest Edge',
    riskLevel: 'MEDIUM',
    vegetationLoss: 35.7,
    confidence: 83,
    trend: 'increasing',
    description: 'Deforestation activity detected.',
    location: { lat: -15.8267, lng: -47.8822 },
    area: 678.4,
    ndvi: { mean: 0.542, min: 0.280, max: 0.920, stdDev: 0.165 },
    riskClassification: {
      riskLevel: 'MEDIUM',
      riskScore: 0.68,
      confidenceScore: 0.83
    },
    areaAffected: 35.7,
    vegetationLossPercentage: 35.7,
  },
  {
    id: '7',
    name: 'Coastal Mangrove Zone',
    riskLevel: 'MEDIUM',
    vegetationLoss: 22.4,
    confidence: 87,
    trend: 'stable',
    description: 'Moderate mangrove degradation.',
    location: { lat: 13.4549, lng: 52.2294 },
    area: 234.5,
    ndvi: { mean: 0.498, min: 0.150, max: 0.780, stdDev: 0.136 },
    riskClassification: {
      riskLevel: 'MEDIUM',
      riskScore: 0.52,
      confidenceScore: 0.87
    },
    areaAffected: 22.4,
    vegetationLossPercentage: 22.4,
  },
  {
    id: '8',
    name: 'Alpine Meadow Region',
    riskLevel: 'LOW',
    vegetationLoss: 3.9,
    confidence: 90,
    trend: 'stable',
    description: 'High altitude ecosystem remains healthy.',
    location: { lat: 46.4431, lng: 10.2160 },
    area: 156.7,
    ndvi: { mean: 0.701, min: 0.520, max: 0.920, stdDev: 0.082 },
    riskClassification: {
      riskLevel: 'LOW',
      riskScore: 0.08,
      confidenceScore: 0.90
    },
    areaAffected: 3.9,
    vegetationLossPercentage: 3.9,
  },
];

export const getTrendIcon = (trend) => {
  if (trend === 'increasing') return '↑';
  if (trend === 'decreasing') return '↓';
  return '→';
};

export const getTrendColor = (trend) => {
  if (trend === 'increasing') return 'text-rose-500';
  if (trend === 'decreasing') return 'text-emerald-500';
  return 'text-slate-400';
};
