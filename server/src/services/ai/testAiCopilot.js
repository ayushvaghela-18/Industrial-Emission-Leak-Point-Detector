/**
 * EcoForge AI — AI Copilot Test Script
 * 
 * Verifies prompt context assembly, grounded answers, simulation explanations,
 * and Member 2 simulation output structure parsing.
 */

import { askCopilot } from './aiCopilotService.js';
import { generateRecommendations } from '../recommendations/recommendationEngine.js';

console.log('🧪 Starting AI Sustainability Copilot & Simulation Adapter Tests...\n');

const rawMember2Analysis = {
  factoryId: 'FAC-TEXTILE-909',
  factory: {
    id: 'FAC-TEXTILE-909',
    name: 'Apex Textile Processing Mill',
    industryType: 'textiles',
  },
  totalEmissionsTonsCO2e: 450.5,
  categories: [
    { category: 'energy', emissionsTonsCO2e: 382.92, percentage: 85.0 },
  ],
  hotspots: [
    { rank: 1, source: 'Grid Electricity', category: 'energy', emissionsTonsCO2e: 180.2, percentage: 40.0 },
    { rank: 2, source: 'Diesel Fuel', category: 'energy', emissionsTonsCO2e: 135.15, percentage: 30.0 },
  ],
};

const recommendations = generateRecommendations(rawMember2Analysis);

async function runTests() {
  // Test 1: Grounded question on Member 2 raw output
  console.log('Test 1: Querying "Why is electricity my biggest emission source?" on Member 2 analysis format');
  const res1 = await askCopilot({
    userQuestion: 'Why is electricity my biggest emission source?',
    analysisContext: rawMember2Analysis,
    recommendations,
  });

  console.log(`Provider: ${res1.provider}`);
  console.log(`Answer Snippet:\n${res1.answer.substring(0, 300)}...\n`);

  if (!res1.success || !res1.answer.includes('180.2') || !res1.answer.includes('40')) {
    console.error('❌ FAIL: Grounding test 1 failed. Missing exact tCO2e or % metrics in response.');
    process.exit(1);
  }
  console.log('✅ Test 1 Passed: Grounding engine parsed Member 2 analysis format perfectly!\n');

  // Test 2: Member 2 SimulationService structure parsing
  console.log('Test 2: Querying simulation explanation using Member 2 SimulationService output structure');
  const rawMember2Simulation = {
    simulationApplied: { renewableEnergyPercentage: 50 },
    baseline: {
      totalEmissionsTonsCO2e: 450.5,
      annualCostUSD: 250000,
    },
    projected: {
      totalEmissionsTonsCO2e: 380.0,
      annualCostUSD: 205000,
    },
    impact: {
      co2ReductionTons: 70.5,
      percentageReduction: 15.65,
      estimatedAnnualSavingsUSD: 45000,
    },
  };

  const res2 = await askCopilot({
    userQuestion: 'What happens if I increase renewable energy?',
    analysisContext: rawMember2Analysis,
    simulationResults: rawMember2Simulation,
    recommendations,
  });

  console.log(`Answer Snippet:\n${res2.answer.substring(0, 300)}...\n`);
  if (!res2.success || !res2.answer.includes('380') || !res2.answer.includes('70.5')) {
    console.error('❌ FAIL: Test 2 failed. Missing simulation metrics in response.');
    process.exit(1);
  }
  console.log('✅ Test 2 Passed: AI Copilot parsed Member 2 SimulationService structure cleanly!\n');

  console.log('🎉 ALL AI COPILOT & ADAPTER TESTS PASSED CLEANLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Uncaught test error:', err);
  process.exit(1);
});
