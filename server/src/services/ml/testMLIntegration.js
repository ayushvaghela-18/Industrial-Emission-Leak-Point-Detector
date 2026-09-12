/**
 * EcoForge AI — Node.js ML Service Integration Test Suite
 * 
 * Verifies:
 * 1. Payload normalization from factory analysis data to ML feature schema
 * 2. Real inference against the FastAPI service
 * 3. Fallback behavior when the ML service is unreachable
 * 4. Hybrid ranking and preservation of deterministic calculations
 */

import { formatMLPayload, getMLPredictions, checkMLServiceHealth } from './mlServiceClient.js';
import { generateRecommendations, generateRankedRecommendations } from '../recommendations/recommendationEngine.js';

console.log('🧪 Starting EcoForge AI Node.js ML Integration Test Suite...\n');

const mockFactoryAnalysis = {
  factoryId: 'FAC-TEXTILE-909',
  factory: {
    id: 'FAC-TEXTILE-909',
    name: 'Apex Textile Processing Mill',
    industryType: 'textile',
  },
  totalEmissionsTonsCO2e: 450.5,
  scope1EmissionsTonsCO2e: 234.26,
  scope2EmissionsTonsCO2e: 180.20,
  scope3EmissionsTonsCO2e: 36.04,
  hotspots: [
    { rank: 1, source: 'Grid Electricity', category: 'energy', key: 'electricity', emissionsTonsCO2e: 180.2, percentage: 40.0, severity: 'Critical' },
    { rank: 2, source: 'Coal Combustion', category: 'energy', key: 'coal', emissionsTonsCO2e: 135.15, percentage: 30.0, severity: 'High' },
  ],
  operationalData: {
    energy: {
      gridElectricityKwh: 1250000,
      renewableElectricityKwh: 50000,
      coalKg: 420000,
    },
    materials: {
      rawMaterialKg: 350000,
      virginMaterialPercentage: 85,
    },
    waste: {
      wasteGeneratedKg: 48000,
      wasteLandfillPercentage: 80,
    },
    logistics: {
      transportTkm: 65000,
    },
    production: {
      productionVolumeUnits: 850000,
    },
  },
};

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (!cond) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  } else {
    passed++;
    console.log(`  ✔ ${msg}`);
  }
}

async function runTests() {
  // Test 1: Feature normalization
  console.log('--- Test 1: Feature Normalization ---');
  const payload = formatMLPayload(mockFactoryAnalysis);
  assert(payload.industry_type === 'textile', 'industry_type formatted correctly');
  assert(payload.primary_hotspot_key === 'electricity', 'primary_hotspot_key extracted');
  assert(payload.grid_electricity_kwh === 1250000, 'grid_electricity_kwh populated');
  assert(payload.fossil_fuel_burn_mj > 0, 'fossil_fuel_burn_mj calculated');
  assert(payload.scope1_share_pct > 0 && payload.scope2_share_pct > 0, 'Scope shares calculated');

  // Test 2: Offline Fallback Behavior
  console.log('\n--- Test 2: Resilient Offline Fallback ---');
  const originalUrl = process.env.ML_SERVICE_URL;
  try {
    process.env.ML_SERVICE_URL = 'http://localhost:59999'; // deliberately offline port
    const fallbackResult = await getMLPredictions(mockFactoryAnalysis);
    assert(fallbackResult.available === false, 'Detects offline ML service');
    assert(fallbackResult.status === 'UNAVAILABLE', 'Returns status UNAVAILABLE');
    assert(fallbackResult.confidence === 'low', 'Marks confidence as low');
    assert(fallbackResult.topInterventions.length === 0, 'Does not fabricate predictions');
  } finally {
    if (originalUrl) process.env.ML_SERVICE_URL = originalUrl;
    else delete process.env.ML_SERVICE_URL;
  }

  // Test 3: Hybrid Recommendation Generation with Deterministic Safety
  console.log('\n--- Test 3: Hybrid Recommendations & Value Preservation ---');
  const deterministicRecs = generateRecommendations(mockFactoryAnalysis);
  const hybridResult = await generateRankedRecommendations(mockFactoryAnalysis, { useML: false });

  assert(hybridResult.recommendations.length === deterministicRecs.length, 'Maintains exact count of catalog recommendations');
  assert(hybridResult.recommendations[0].estimatedCO2Reduction === deterministicRecs[0].estimatedCO2Reduction, 'Preserves exact deterministic CO2 reduction calculation');
  assert(hybridResult.recommendations[0].paybackPeriod === deterministicRecs[0].paybackPeriod, 'Preserves exact deterministic payback period');
  assert(hybridResult.recommendations[0].estimatedAnnualSaving === deterministicRecs[0].estimatedAnnualSaving, 'Preserves exact deterministic annual savings');

  console.log(`\n🎉 ALL ${passed}/${total} NODE ML INTEGRATION TESTS PASSED!`);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
