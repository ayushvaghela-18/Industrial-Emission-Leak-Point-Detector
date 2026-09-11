/**
 * Backend Constants
 * Primary Ownership: Member 2 (Backend & Emissions)
 */

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export const HOTSPOT_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
};

// Percentage thresholds for hotspot classification
export const HOTSPOT_THRESHOLDS = {
  CRITICAL: 30.0, // >= 30% of total emissions
  HIGH: 15.0,     // 15% - 29.9%
  MEDIUM: 5.0,    // 5% - 14.9%
  LOW: 0.0,       // < 5%
};

export const EMISSION_CATEGORIES = {
  ENERGY: 'Energy & Fuels',
  MATERIALS: 'Raw Materials',
  WASTE: 'Waste & Disposal',
  LOGISTICS: 'Logistics & Transport',
};

export const SCOPES = {
  SCOPE_1: 'Scope 1 (Direct)',
  SCOPE_2: 'Scope 2 (Electricity)',
  SCOPE_3: 'Scope 3 (Supply Chain & Waste)',
};

export const INDUSTRY_TYPES = [
  'Textile',
  'Food Processing',
  'Manufacturing',
  'Chemical',
  'Metal & Engineering',
  'Plastics & Packaging',
  'Other',
];

export const UNITS = {
  ELECTRICITY: 'kWh',
  DIESEL: 'Liters',
  COAL: 'kg',
  NATURAL_GAS: 'm³',
  RAW_MATERIAL: 'kg',
  WASTE: 'kg',
  TRANSPORT: 'tkm', // Ton-Kilometers
  EMISSION_KG: 'kg CO₂e',
  EMISSION_TONS: 't CO₂e',
};
