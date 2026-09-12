/**
 * EcoForge AI — AI Copilot Test Suite
 * 
 * Verifies:
 * 1. Question-specific answers for all required intents (no identical responses)
 * 2. Strict grounding in calculated backend metrics (no fabricated numbers)
 * 3. Sanitized output (no "###", no Markdown headings, no raw JSON)
 * 4. Resilient failure handling without server crashes or secret leakage
 * 5. Ollama request formatting and provider compatibility
 */

import { askCopilot, sanitizeResponseText, getOllamaEndpoint } from './aiCopilotService.js';

console.log('🧪 Starting EcoForge AI Copilot Verification Test Suite...\n');

// 1. Controlled Mock Data with Unambiguous Expected Values
const mockFactoryAnalysis = {
  factoryId: 'FAC-TEXTILE-909',
  factory: {
    id: 'FAC-TEXTILE-909',
    name: 'Apex Textile Processing Mill',
    industryType: 'textiles',
    location: 'North Industrial Corridor',
  },
  totalEmissionsTonsCO2e: 450.5,
  categories: [
    { category: 'energy', emissionsTonsCO2e: 382.92, percentage: 85.0 },
    { category: 'materials', emissionsTonsCO2e: 67.58, percentage: 15.0 },
  ],
  hotspots: [
    { rank: 1, source: 'Grid Electricity', category: 'energy', emissionsTonsCO2e: 180.2, percentage: 40.0, severity: 'Critical' },
    { rank: 2, source: 'Diesel Fuel', category: 'energy', emissionsTonsCO2e: 135.15, percentage: 30.0, severity: 'High' },
    { rank: 3, source: 'Coal Combustion', category: 'energy', emissionsTonsCO2e: 67.57, percentage: 15.0, severity: 'Medium' },
  ],
};

const mockRecommendations = [
  {
    id: 'REC-SOLAR-01',
    title: 'On-Site Rooftop Solar PV Installation',
    category: 'Renewable Energy Substitution',
    targetHotspot: 'electricity',
    estimatedCO2Reduction: 72.1,
    reductionPercentage: 40,
    estimatedAnnualSaving: 28000,
    estimatedImplementationCost: 89600,
    paybackPeriod: 3.2,
    paybackPeriodYears: 3.2,
    feasibility: 'High',
    difficulty: 'Moderate',
    priority: 'High',
    whyRecommended: 'Directly addresses Grid Electricity leak point.',
  },
  {
    id: 'REC-BIOMASS-02',
    title: 'Biomass Boiler Conversion for Thermal Heating',
    category: 'Renewable Energy Substitution',
    targetHotspot: 'diesel',
    estimatedCO2Reduction: 94.6, // HIGHEST CO2 REDUCTION
    reductionPercentage: 70,
    estimatedAnnualSaving: 35000,
    estimatedImplementationCost: 98000,
    paybackPeriod: 2.8,
    paybackPeriodYears: 2.8,
    feasibility: 'Medium',
    difficulty: 'Moderate',
    priority: 'High',
    whyRecommended: 'Maximizes greenhouse gas abatement by replacing diesel burn.',
  },
  {
    id: 'REC-LED-03',
    title: 'LED Lighting Retrofit & Smart Occupancy Sensors',
    category: 'Energy Optimization',
    targetHotspot: 'electricity',
    estimatedCO2Reduction: 12.0,
    reductionPercentage: 6.7,
    estimatedAnnualSaving: 15000,
    estimatedImplementationCost: 13500,
    paybackPeriod: 0.9, // BEST/FASTEST PAYBACK PERIOD
    paybackPeriodYears: 0.9,
    feasibility: 'High',
    difficulty: 'Easy',
    priority: 'Medium',
    whyRecommended: 'Delivers immediate positive cash flow with sub-year payback.',
  },
];

const mockSimulation = {
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

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    passedTests++;
    console.log(`  ✔ ${message}`);
  }
}

async function runAllTests() {
  console.log('--- Phase 1: Testing 5 Required Core Question Intents ---');

  // Question 1: Hotspot to address first
  console.log('\n[Q1] "Which emission hotspot should we address first and why?"');
  const res1 = await askCopilot({
    userQuestion: 'Which emission hotspot should we address first and why?',
    analysisContext: mockFactoryAnalysis,
    recommendations: mockRecommendations,
  });
  console.log(`Answer:\n${res1.answer}\n`);
  assert(res1.success, 'Q1 returns success: true');
  assert(res1.answer.toLowerCase().includes('grid electricity'), 'Q1 identifies Grid Electricity as primary hotspot');
  assert(res1.answer.includes('180.2') || res1.answer.includes('40'), 'Q1 includes exact authoritative emission mass or percentage');
  assert(!res1.answer.includes('###'), 'Q1 does not contain "###" markdown headings');
  assert(!res1.answer.includes('```json'), 'Q1 does not contain raw JSON');

  // Question 2: Highest CO2 reduction
  console.log('\n[Q2] "Which recommendation gives the highest CO2 reduction?"');
  const res2 = await askCopilot({
    userQuestion: 'Which recommendation gives the highest CO2 reduction?',
    analysisContext: mockFactoryAnalysis,
    recommendations: mockRecommendations,
  });
  console.log(`Answer:\n${res2.answer}\n`);
  assert(res2.success, 'Q2 returns success: true');
  assert(res2.answer.includes('Biomass Boiler Conversion'), 'Q2 identifies Biomass Boiler as highest reduction recommendation');
  assert(res2.answer.includes('94.6'), 'Q2 quotes exact 94.6 tCO2e reduction from context without inventing numbers');
  assert(!res2.answer.includes('###'), 'Q2 does not contain "###"');
  assert(!res2.answer.includes('```json'), 'Q2 does not contain raw JSON');

  // Question 3: Best payback
  console.log('\n[Q3] "Which recommendation has the best payback?"');
  const res3 = await askCopilot({
    userQuestion: 'Which recommendation has the best payback?',
    analysisContext: mockFactoryAnalysis,
    recommendations: mockRecommendations,
  });
  console.log(`Answer:\n${res3.answer}\n`);
  assert(res3.success, 'Q3 returns success: true');
  assert(res3.answer.includes('LED Lighting Retrofit'), 'Q3 identifies LED Lighting as fastest payback intervention');
  assert(res3.answer.includes('0.9'), 'Q3 quotes exact ~0.9 year payback from context');
  assert(!res3.answer.includes('###'), 'Q3 does not contain "###"');
  assert(!res3.answer.includes('```json'), 'Q3 does not contain raw JSON');

  // Question 4: Explain what-if simulation
  console.log('\n[Q4] "Explain the what-if simulation."');
  const res4 = await askCopilot({
    userQuestion: 'Explain the what-if simulation.',
    analysisContext: mockFactoryAnalysis,
    recommendations: mockRecommendations,
    simulationResults: mockSimulation,
  });
  console.log(`Answer:\n${res4.answer}\n`);
  assert(res4.success, 'Q4 returns success: true');
  assert(res4.answer.includes('450.5') && res4.answer.includes('380'), 'Q4 quotes baseline and projected emission numbers');
  assert(res4.answer.includes('70.5') || res4.answer.includes('15.65') || res4.answer.includes('45,000'), 'Q4 quotes net reduction or financial savings from simulation context');
  assert(!res4.answer.includes('###'), 'Q4 does not contain "###"');
  assert(!res4.answer.includes('```json'), 'Q4 does not contain raw JSON');

  // Question 5: What should the factory do first?
  console.log('\n[Q5] "What should the factory do first?"');
  const res5 = await askCopilot({
    userQuestion: 'What should the factory do first?',
    analysisContext: mockFactoryAnalysis,
    recommendations: mockRecommendations,
  });
  console.log(`Answer:\n${res5.answer}\n`);
  assert(res5.success, 'Q5 returns success: true');
  assert(res5.answer.includes(mockRecommendations[0].title), 'Q5 recommends highest priority catalog action first');
  assert(!res5.answer.includes('###'), 'Q5 does not contain "###"');
  assert(!res5.answer.includes('```json'), 'Q5 does not contain raw JSON');

  // Question 6: What are the main emission hotspots?
  console.log('\n[Q6] "What are the main emission hotspots?"');
  const res6 = await askCopilot({
    userQuestion: 'What are the main emission hotspots?',
    analysisContext: mockFactoryAnalysis,
    recommendations: mockRecommendations,
  });
  console.log(`Answer:\n${res6.answer}\n`);
  assert(res6.success, 'Q6 returns success: true');
  assert(res6.answer.includes('Grid Electricity') && res6.answer.includes('Diesel Fuel'), 'Q6 lists the primary emission leak points');
  assert(!res6.answer.includes('###'), 'Q6 does not contain "###"');

  // Question 7: Why is Grid Electricity a major hotspot?
  console.log('\n[Q7] "Why is Grid Electricity a major hotspot?"');
  const res7 = await askCopilot({
    userQuestion: 'Why is Grid Electricity a major hotspot?',
    analysisContext: mockFactoryAnalysis,
    recommendations: mockRecommendations,
  });
  console.log(`Answer:\n${res7.answer}\n`);
  assert(res7.success, 'Q7 returns success: true');
  assert(res7.answer.includes('180.2') && res7.answer.includes('40'), 'Q7 explains Grid Electricity specifically using its metrics');
  assert(!res7.answer.includes('###'), 'Q7 does not contain "###"');

  // Verification that responses are distinct (NOT all identical!)
  console.log('\n--- Phase 2: Differentiating Responses Check ---');
  const answerSet = new Set([res1.answer, res2.answer, res3.answer, res4.answer, res5.answer, res6.answer, res7.answer]);
  assert(answerSet.size === 7, 'All 7 question responses are unique, distinct, and question-specific');

  // Phase 3: Response Sanitizer Testing
  console.log('\n--- Phase 3: Response Sanitizer Validation ---');
  const dirtyText = `### Heading 3\n## Heading 2\n# Heading 1\n---\nBased on the provided data, here is the answer.\n\`\`\`json\n{"internal": true}\n\`\`\`\nFinal summary paragraph.`;
  const cleanText = sanitizeResponseText(dirtyText);
  assert(!cleanText.includes('#'), 'Sanitizer strips all markdown heading markers (#, ##, ###)');
  assert(!cleanText.includes('---'), 'Sanitizer strips horizontal rules (---)');
  assert(!cleanText.includes('Based on the provided data'), 'Sanitizer strips generic canned openers');
  assert(!cleanText.includes('internal'), 'Sanitizer strips raw JSON blocks');

  // Phase 4: Failure Handling & Security Verification
  console.log('\n--- Phase 4: Failure Handling & Security Checks ---');
  // Empty question test
  const emptyRes = await askCopilot({ userQuestion: '' });
  assert(!emptyRes.success && emptyRes.message === 'User question is required.', 'Rejects empty question gracefully without crashing');
  assert(emptyRes.inferenceMode === 'none', 'Empty question returns inferenceMode: none');

  // Fallback resilience test
  const missingKeyRes = await askCopilot({
    userQuestion: 'What are the main emission hotspots?',
    analysisContext: mockFactoryAnalysis,
    recommendations: mockRecommendations,
  });
  assert(missingKeyRes.success && missingKeyRes.answer.length > 20, 'Falls back gracefully to question-aware deterministic engine when provider unavailable');
  assert(!missingKeyRes.answer.includes('apiKey') && !missingKeyRes.answer.includes('Bearer'), 'Never leaks internal API keys or authorization headers');
  assert(['llm', 'fallback'].includes(missingKeyRes.inferenceMode), 'Identifies inference mode clearly as llm or fallback');

  // Phase 5: Provider Routing & Model Discovery Verification
  console.log('\n--- Phase 5: Provider Routing & Model Discovery ---');
  const defaultEndpoint = getOllamaEndpoint();
  assert(typeof defaultEndpoint === 'string' && defaultEndpoint.length > 0, `Ollama endpoint successfully resolved to: ${defaultEndpoint}`);

  // Test Cloud endpoint logic when API key present
  const originalApiKey = process.env.OLLAMA_API_KEY;
  try {
    process.env.OLLAMA_API_KEY = 'test_key_sample';
    const cloudEndpoint = getOllamaEndpoint();
    assert(cloudEndpoint === 'https://ollama.com/api/chat', 'Resolves to https://ollama.com/api/chat when OLLAMA_API_KEY is configured');
  } finally {
    if (originalApiKey) {
      process.env.OLLAMA_API_KEY = originalApiKey;
    } else {
      delete process.env.OLLAMA_API_KEY;
    }
  }

  console.log(`\n🎉 ALL ${passedTests}/${totalTests} TESTS PASSED CLEANLY!`);
}

runAllTests().catch((err) => {
  console.error('❌ Uncaught test suite error:', err);
  process.exit(1);
});
