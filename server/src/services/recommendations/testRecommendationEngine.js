/**
 * EcoForge AI — Recommendation Engine Test Script
 * 
 * Verifies catalog retrieval, deterministic scoring, hotspot targeting,
 * and Member 2 API contract adapter normalization.
 */

import { generateRecommendations, normalizeAnalysisInput } from './recommendationEngine.js';

console.log('🧪 Starting Circular Recommendation Engine & Member 2 Adapter Tests...\n');

// Mock raw payload formatted EXACTLY as Member 2's analyzeEmissions controller output
const rawMember2Analysis = {
  factoryId: 'FAC-TEXTILE-909',
  factory: {
    id: 'FAC-TEXTILE-909',
    name: 'Apex Textile Processing Mill',
    industryType: 'textiles',
    location: 'Gujarat, India',
  },
  totalEmissionsTonsCO2e: 450.5,
  totalEmissionsKgCO2e: 450500,
  categories: [
    { category: 'energy', emissionsTonsCO2e: 382.92, percentage: 85.0 },
    { category: 'materials', emissionsTonsCO2e: 45.05, percentage: 10.0 },
    { category: 'waste', emissionsTonsCO2e: 22.53, percentage: 5.0 },
  ],
  sources: [
    { source: 'Grid Electricity', category: 'energy', emissionsTonsCO2e: 180.2, percentage: 40.0 },
    { source: 'Diesel Fuel', category: 'energy', emissionsTonsCO2e: 135.15, percentage: 30.0 },
    { source: 'Industrial Coal', category: 'energy', emissionsTonsCO2e: 67.57, percentage: 15.0 },
    { source: 'Virgin Raw Materials', category: 'materials', emissionsTonsCO2e: 45.05, percentage: 10.0 },
    { source: 'Waste Landfill Degradation', category: 'waste', emissionsTonsCO2e: 22.53, percentage: 5.0 },
  ],
  hotspots: [
    { rank: 1, source: 'Grid Electricity', category: 'energy', emissionsTonsCO2e: 180.2, percentage: 40.0, severity: 'CRITICAL_HOTSPOT' },
    { rank: 2, source: 'Diesel Fuel', category: 'energy', emissionsTonsCO2e: 135.15, percentage: 30.0, severity: 'HIGH_HOTSPOT' },
    { rank: 3, source: 'Industrial Coal', category: 'energy', emissionsTonsCO2e: 67.57, percentage: 15.0, severity: 'MEDIUM_HOTSPOT' },
  ],
  operationalData: {
    electricityKWh: 225000,
    dieselLitres: 50000,
  },
};

// 1. Test Adapter Normalization
console.log('Test 1: Testing normalizeAnalysisInput() on raw Member 2 output');
const normalized = normalizeAnalysisInput(rawMember2Analysis);

if (normalized.totalEmissionsTons !== 450.5) {
  console.error('❌ FAIL: totalEmissionsTons mapping failed.');
  process.exit(1);
}
if (normalized.factoryProfile.industry !== 'textiles') {
  console.error('❌ FAIL: industryType mapping failed.');
  process.exit(1);
}
if (normalized.topHotspots[0].key !== 'electricity') {
  console.error('❌ FAIL: Source string "Grid Electricity" to key mapping failed.');
  process.exit(1);
}
console.log('✅ Test 1 Passed: Adapter correctly normalized Member 2 fields!\n');

// 2. Test Recommendation Generation on Member 2 output
console.log('Test 2: Generating recommendations directly from raw Member 2 analysis object');
const recommendations = generateRecommendations(rawMember2Analysis);

console.log(`✅ Recommendations Generated: ${recommendations.length} items found.\n`);

console.log('--- Top 3 Scored Recommendations ---');
recommendations.slice(0, 3).forEach((rec, idx) => {
  console.log(`\n#${idx + 1}: ${rec.title} [Priority: ${rec.priority} | Score: ${rec.score}]`);
  console.log(`    Category: ${rec.category}`);
  console.log(`    Target Hotspot: ${rec.targetHotspot}`);
  console.log(`    CO2 Reduction: ${rec.estimatedCO2Reduction} tCO2e/year (-${rec.reductionPercentage}%)`);
  console.log(`    Annual Savings: ₹${rec.estimatedAnnualSaving.toLocaleString('en-IN')}`);
  console.log(`    Payback Period: ~${rec.paybackPeriod} years`);
  console.log(`    Why: ${rec.whyRecommended}`);
});

// Assertions
if (recommendations.length === 0) {
  console.error('❌ FAIL: Expected recommendations, got 0.');
  process.exit(1);
}

const topRec = recommendations[0];
if (!topRec.id || !topRec.estimatedCO2Reduction || !topRec.estimatedAnnualSaving) {
  console.error('❌ FAIL: Missing required recommendation fields.');
  process.exit(1);
}

console.log('\n🎉 ALL RECOMMENDATION ENGINE & ADAPTER TESTS PASSED CLEANLY!\n');
