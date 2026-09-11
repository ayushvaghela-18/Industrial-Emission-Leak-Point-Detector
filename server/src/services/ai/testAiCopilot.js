/**
 * EcoForge AI — AI Copilot Test Script
 * 
 * Verifies prompt context assembly, grounded answers, simulation explanations,
 * and fallback execution when API key is missing or unconfigured.
 */

import { askCopilot } from './aiCopilotService.js';
import { generateRecommendations } from '../recommendations/recommendationEngine.js';

console.log('🧪 Starting AI Sustainability Copilot Tests...\n');

const sampleAnalysis = {
  factoryProfile: {
    id: 'FAC-TEXTILE-909',
    name: 'Apex Textile Processing Mill',
    industry: 'textiles',
  },
  totalEmissionsTons: 450.5,
  categoryBreakdown: {
    electricity: 180.2,
    diesel: 135.15,
    coal: 67.57,
  },
  topHotspots: [
    { key: 'electricity', name: 'Grid Electricity', emissionsTons: 180.2, percentage: 40.0 },
    { key: 'diesel', name: 'Diesel Generators & Fleet', emissionsTons: 135.15, percentage: 30.0 },
  ],
};

const recommendations = generateRecommendations(sampleAnalysis);

async function runTests() {
  // Test 1: Why is electricity my biggest hotspot?
  console.log('Test 1: Querying "Why is electricity my biggest emission source?"');
  const res1 = await askCopilot({
    userQuestion: 'Why is electricity my biggest emission source?',
    factoryProfile: sampleAnalysis.factoryProfile,
    totalEmissionsTons: sampleAnalysis.totalEmissionsTons,
    categoryBreakdown: sampleAnalysis.categoryBreakdown,
    topHotspots: sampleAnalysis.topHotspots,
    recommendations,
  });

  console.log(`Provider: ${res1.provider}`);
  console.log(`Answer Snippet:\n${res1.answer.substring(0, 300)}...\n`);

  if (!res1.success || !res1.answer.includes('180.2') || !res1.answer.includes('40')) {
    console.error('❌ FAIL: Grounding test 1 failed. Missing exact tCO2e or % metrics in response.');
    process.exit(1);
  }
  console.log('✅ Test 1 Passed: Response contains exact grounded emission metrics!\n');

  // Test 2: What should I change first?
  console.log('Test 2: Querying "What should I change first?"');
  const res2 = await askCopilot({
    userQuestion: 'What should I change first?',
    factoryProfile: sampleAnalysis.factoryProfile,
    totalEmissionsTons: sampleAnalysis.totalEmissionsTons,
    categoryBreakdown: sampleAnalysis.categoryBreakdown,
    topHotspots: sampleAnalysis.topHotspots,
    recommendations,
  });

  console.log(`Answer Snippet:\n${res2.answer.substring(0, 300)}...\n`);
  if (!res2.success || !res2.supportingMetrics.topRecommendationTitle) {
    console.error('❌ FAIL: Test 2 failed. Missing top recommendation recommendation context.');
    process.exit(1);
  }
  console.log('✅ Test 2 Passed: Priority recommendation correctly identified and explained!\n');

  // Test 3: Simulation explanation
  console.log('Test 3: Querying What-If Simulation explanation');
  const res3 = await askCopilot({
    userQuestion: 'What happens if I increase recycled material?',
    factoryProfile: sampleAnalysis.factoryProfile,
    totalEmissionsTons: 450.5,
    simulationResults: {
      scenarioName: '50% Recycled Material Transition',
      originalEmissionsTons: 450.5,
      simulatedEmissionsTons: 380.0,
      netCO2ChangeTons: 70.5,
      percentageChange: -15.6,
      netFinancialSavingINR: 450000,
    },
    recommendations,
  });

  console.log(`Answer Snippet:\n${res3.answer.substring(0, 300)}...\n`);
  if (!res3.success || !res3.answer.includes('380') || !res3.answer.includes('70.5')) {
    console.error('❌ FAIL: Test 3 failed. Missing simulation metrics in response.');
    process.exit(1);
  }
  console.log('✅ Test 3 Passed: Simulation scenario correctly explained!\n');

  console.log('🎉 ALL AI COPILOT TESTS PASSED CLEANLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Uncaught test error:', err);
  process.exit(1);
});
