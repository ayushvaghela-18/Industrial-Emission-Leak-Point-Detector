/**
 * EcoForge AI — AI Copilot Prompt Templates & Context Assembler
 * 
 * System prompts and contextual grounding builders for EcoForge AI Sustainability Copilot.
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

export const SYSTEM_PROMPT = `You are the EcoForge AI Sustainability Copilot, an expert industrial sustainability advisor built for EcoForge AI (Industrial Emission Leak-Point Detector & Circular Alternative Recommender).

Your mission is to help factory operators, sustainability managers, and regulators understand emission leak points, circular economy interventions, financial payback, and carbon reduction tradeoffs.

STRICT GROUNDING RULES:
1. NEVER invent, calculate, or fabricate numerical figures.
2. The numerical data provided in the application context (total emissions, hotspot percentages, CO2 reductions, cost savings, payback periods, simulation results) is AUTHORITATIVE. Use it directly.
3. If specific requested information is missing from the provided context, state clearly: "That specific metric is not available in the current analysis data."
4. Always explain WHY a specific intervention is recommended based on the factory's largest emission sources ("emission leak points").
5. Clearly distinguish calculated facts from estimated projections.
6. Do NOT pretend to be an official government auditor or certified ISO auditor. Present yourself as a data-grounded decision-support copilot.
7. Be concise, structured, professional, and actionable.

RESPONSE FORMAT GUIDELINES:
- Provide a direct, structured answer using clean markdown.
- Include sections like:
  - **Summary / Key Insight**
  - **Data Evidence** (quoting exact tCO2e and % values from context)
  - **Recommended Action** (referencing specific catalog recommendations)
  - **Financial & Payback Impact** (quoting estimated annual savings in ₹ and payback period in years)
  - **Tradeoffs & Next Steps** (explaining feasibility or implementation considerations)
`;

/**
 * Formats factory analysis, hotspot metrics, and circular recommendations into a clear structured context block for the LLM.
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
  const factoryInfo = `
FACTORY PROFILE:
- Name: ${factoryProfile.name || 'Industrial Facility'}
- Industry: ${factoryProfile.industry || 'General Manufacturing'}
- Location: ${factoryProfile.location || 'N/A'}
- Production Capacity: ${factoryProfile.annualProductionTons ? `${factoryProfile.annualProductionTons} tons/year` : 'N/A'}
`;

  const emissionsInfo = `
EMISSIONS SUMMARY:
- Total Annual Emissions: ${totalEmissionsTons} tCO2e/year
- Category Breakdown:
${Object.entries(categoryBreakdown)
  .map(([cat, val]) => `  * ${cat}: ${val} tCO2e`)
  .join('\n') || '  * No category breakdown provided'}

TOP EMISSION HOTSPOTS (LEAK POINTS):
${topHotspots
  .map(
    (h, idx) =>
      `  ${idx + 1}. ${h.name || h.key} — ${h.emissionsTons} tCO2e (${h.percentage}% of total emissions) [Priority: ${h.priority || 'High'}]`
  )
  .join('\n') || '  * No hotspots identified'}
`;

  const recsInfo = `
RECOMMENDED CIRCULAR INTERVENTIONS:
${recommendations
  .slice(0, 5)
  .map(
    (r, idx) => `
${idx + 1}. [${r.priority}] ${r.title} (${r.category})
   - Target Hotspot: ${r.targetHotspot}
   - Estimated CO2 Reduction: ${r.estimatedCO2Reduction} tCO2e/year (${r.reductionPercentage}% hotspot reduction)
   - Estimated Annual Financial Saving: ₹${Number(r.estimatedAnnualSaving).toLocaleString('en-IN')}
   - Estimated Implementation Cost: ₹${Number(r.estimatedImplementationCost).toLocaleString('en-IN')}
   - Payback Period: ~${r.paybackPeriod} years
   - Feasibility: ${r.feasibility} | Difficulty: ${r.difficulty}
   - Reason: ${r.whyRecommended}
`
  )
  .join('\n') || '  * No active recommendations generated'}
`;

  const simInfo = simulationResults
    ? `
WHAT-IF SIMULATION RESULTS:
- Scenario: ${simulationResults.scenarioName || 'User Modification'}
- Original Total Emissions: ${simulationResults.originalEmissionsTons || totalEmissionsTons} tCO2e
- Simulated Total Emissions: ${simulationResults.simulatedEmissionsTons} tCO2e
- Net CO2 Change: ${simulationResults.netCO2ChangeTons} tCO2e (${simulationResults.percentageChange}%)
- Estimated Net Financial Saving: ₹${Number(simulationResults.netFinancialSavingINR || 0).toLocaleString('en-IN')}
- Key Parameter Adjustments: ${JSON.stringify(simulationResults.adjustments || {})}
`
    : '';

  return `${factoryInfo}\n${emissionsInfo}\n${recsInfo}\n${simInfo}`;
}
