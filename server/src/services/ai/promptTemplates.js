/**
 * EcoForge AI — AI Copilot Prompt Templates & Context Assembler
 * 
 * System prompts and contextual grounding builders for EcoForge AI Sustainability Copilot.
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

export const SYSTEM_PROMPT = `You are the EcoForge AI Sustainability Copilot, a data-grounded industrial sustainability advisor for manufacturing plants.

MISSION:
Answer the user's specific question using ONLY the provided Authoritative Backend Context. Help operators and evaluators understand emission leak points, circular interventions, financial payback, and simulation scenarios.

CRITICAL RULES:
1. GROUNDING: Never invent, calculate, extrapolate, or fabricate any numbers. All emission values, percentages, savings, payback periods, and simulation projections must come directly from the supplied backend context.
2. DIRECT RELEVANCE: Address the user's specific question directly. Do not provide a generic overview when a specific metric or question is requested.
3. FORMATTING RESTRICTIONS:
   - Output clean, natural text organized into 2 to 3 short paragraphs.
   - DO NOT use Markdown headings (#, ##, ###).
   - DO NOT use horizontal rules (---).
   - DO NOT output raw JSON or code blocks.
   - DO NOT start with generic canned phrases like "Based on the provided data", "According to the context", "Sure!", or "Certainly!".
   - Bullet points are allowed ONLY when listing multiple distinct options or steps, and should be kept minimal.
4. MISSING INFORMATION: If a requested metric is not in the supplied context, state that the metric is not available in the current records rather than guessing.`;

/**
 * Formats factory analysis, hotspot metrics, and circular recommendations into a clear structured context block for Ollama.
 */
export function buildGroundingContext({
  factoryProfile = {},
  operationalData = {},
  totalEmissionsTons = 0,
  categoryBreakdown = {},
  topHotspots = [],
  recommendations = [],
  simulationResults = null,
}) {
  const factoryInfo = `FACTORY PROFILE:
- Name: ${factoryProfile.name || 'Industrial Facility'}
- Industry: ${factoryProfile.industry || factoryProfile.industryType || 'General Manufacturing'}
- Location: ${factoryProfile.location || 'Industrial Zone'}
- Operational Size: ${factoryProfile.size || 'Standard Production Facility'}`;

  const emissionsInfo = `EMISSIONS BREAKDOWN & LEAK POINTS:
- Total Annual Emissions: ${totalEmissionsTons} tCO2e/year
- Category Breakdown:
${Object.entries(categoryBreakdown)
  .map(([cat, val]) => `  * ${cat}: ${val} tCO2e`)
  .join('\n') || '  * No category breakdown recorded'}

- Top Emission Hotspots (Leak Points):
${topHotspots
  .map(
    (h, idx) =>
      `  ${idx + 1}. ${h.name || h.source || h.key} — ${h.emissionsTons ?? h.emissionsTonsCO2e ?? 0} tCO2e/year (${h.percentage}% of total footprint) [Severity: ${h.severity || 'High'}]`
  )
  .join('\n') || '  * No hotspots identified'}`;

  const recsInfo = `RECOMMENDED CIRCULAR INTERVENTIONS:
${recommendations
  .slice(0, 5)
  .map(
    (r, idx) => `  ${idx + 1}. ${r.title} (${r.category})
     - Target Hotspot: ${r.targetHotspot}
     - Estimated CO2 Reduction: ${r.estimatedCO2Reduction ?? r.co2ReductionTonnes ?? 0} tCO2e/year (${r.reductionPercentage ?? r.co2ReductionPct ?? 0}% cut)
     - Estimated Annual Financial Savings: $${Number(r.estimatedAnnualSaving ?? r.annualSavingsUSD ?? 0).toLocaleString()} / year
     - Estimated Implementation Cost: $${Number(r.estimatedImplementationCost ?? r.implementationCostUSD ?? 0).toLocaleString()}
     - Estimated Payback Period: ~${r.paybackPeriod ?? r.paybackPeriodYears ?? 'N/A'} years
     - Feasibility: ${r.feasibility || 'High'} | Difficulty: ${r.difficulty || 'Moderate'}
     - Rationale: ${r.whyRecommended || 'Targets primary emission source'}`
  )
  .join('\n\n') || '  * No recommendations available'}`;

  let simInfo = '';
  if (simulationResults) {
    const baselineTons = simulationResults.baseline?.totalEmissionsTonsCO2e ?? simulationResults.originalEmissionsTons ?? totalEmissionsTons;
    const projectedTons = simulationResults.projected?.totalEmissionsTonsCO2e ?? simulationResults.simulatedEmissionsTons ?? 0;
    const co2Reduction = simulationResults.impact?.co2ReductionTons ?? simulationResults.netCO2ChangeTons ?? Math.max(0, baselineTons - projectedTons);
    const pctChange = simulationResults.impact?.percentageReduction ?? simulationResults.percentageChange ?? 0;
    const savings = simulationResults.impact?.estimatedAnnualSavingsUSD ?? simulationResults.netFinancialSavingINR ?? 0;
    const changes = simulationResults.simulationApplied || simulationResults.adjustments || {};

    simInfo = `\nWHAT-IF SIMULATION RESULTS:
- Baseline Footprint: ${baselineTons} tCO2e/year
- Simulated Footprint: ${projectedTons} tCO2e/year
- CO2 Reduction Achieved: ${co2Reduction} tCO2e/year (${pctChange}% reduction)
- Projected Annual Financial Savings: $${Number(savings).toLocaleString()} / year
- Parameter Adjustments: ${JSON.stringify(changes)}`;
  }

  return `${factoryInfo}\n\n${emissionsInfo}\n\n${recsInfo}${simInfo}`;
}

