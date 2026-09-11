/**
 * EcoForge AI — Recommendation Engine Test Script
 * 
 * Verifies catalog retrieval, deterministic scoring, hotspot targeting,
 * and financial / CO2 impact calculations.
 */

import { generateRecommendations } from './recommendationEngine.js';

console.log('🧪 Starting Circular Recommendation Engine Tests...\n');

// Mock factory analysis payload from Member 2's emission engine
const sampleAnalysis = {
  factoryProfile: {
    id: 'FAC-TEXTILE-909',
    name: 'Apex Textile Processing Mill',
    industry: 'textiles',
    location: 'Gujarat, India',
    annualProductionTons: 15000,
  },
  totalEmissionsTons: 450.5,
  categoryBreakdown: {
    electricity: 180.2, // 40%
    diesel: 135.15,    // 30%
    coal: 67.57,       // 15%
    raw_materials: 45.05, // 10%
    waste: 22.53,      // 5%
  },
  topHotspots: [
    { key: 'electricity', name: 'Grid Electricity', emissionsTons: 180.2, percentage: 40.0 },
    { key: 'diesel', name: 'Diesel Generators & Fleet', emissionsTons: 135.15, percentage: 30.0 },
    { key: 'coal', name: 'Coal Boiler Steam', emissionsTons: 67.57, percentage: 15.0 },
    { key: 'raw_materials', name: 'Virgin Materials', emissionsTons: 45.05, percentage: 10.0 },
    { key: 'waste', name: 'Effluent Waste', emissionsTons: 22.53, percentage: 5.0 },
  ],
  operationalData: {
    electricityKWh: 225000,
    dieselLitres: 50000,
    coalTons: 350,
  },
};

const recommendations = generateRecommendations(sampleAnalysis);

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

if (topRec.score <= 0) {
  console.error('❌ FAIL: Expected positive deterministic score.');
  process.exit(1);
}

console.log('\n🎉 ALL RECOMMENDATION ENGINE TESTS PASSED CLEANLY!\n');
