/**
 * EcoForge AI — AI Sustainability Copilot Service
 * 
 * Conversational grounded AI assistant for EcoForge AI.
 * Grounded in authoritative backend-calculated metrics (emissions, hotspots, recommendations, simulation results).
 * 
 * Supports Gemini REST API with automated fallback to deterministic local reasoning engine.
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { SYSTEM_PROMPT, buildGroundingContext } from './promptTemplates.js';

/**
 * Process a user question using grounded factory application context.
 * 
 * @param {Object} params
 * @param {String} params.userQuestion - Question asked by user
 * @param {Object} [params.factoryProfile] - Basic factory metadata
 * @param {Object} [params.operationalData] - Operational inputs
 * @param {Number} [params.totalEmissionsTons] - Calculated emissions in tCO2e
 * @param {Object} [params.categoryBreakdown] - Category breakdown map
 * @param {Array}  [params.topHotspots] - Ranked emission hotspots
 * @param {Array}  [params.recommendations] - Generated circular recommendations
 * @param {Object} [params.simulationResults] - Optional simulation results
 * @returns {Promise<Object>} { success, answer, supportingMetrics, referencedRecommendations, provider }
 */
export async function askCopilot({
  userQuestion,
  factoryProfile = {},
  operationalData = {},
  totalEmissionsTons = 0,
  categoryBreakdown = {},
  topHotspots = [],
  recommendations = [],
  simulationResults = null,
}) {
  if (!userQuestion || userQuestion.trim() === '') {
    return {
      success: false,
      message: 'User question is required.',
      answer: 'Please ask a question regarding your factory emissions, hotspots, recommendations, or simulation scenarios.',
    };
  }

  // Build structured grounding context
  const groundingContext = buildGroundingContext({
    factoryProfile,
    operationalData,
    totalEmissionsTons,
    categoryBreakdown,
    topHotspots,
    recommendations,
    simulationResults,
  });

  // Extract reference metrics & recommendations for client UI highlighting
  const topRecommendation = recommendations[0] || null;
  const primaryHotspot = topHotspots[0] || null;

  const supportingMetrics = {
    totalEmissionsTons,
    primaryHotspotName: primaryHotspot ? (primaryHotspot.name || primaryHotspot.key) : 'N/A',
    primaryHotspotShare: primaryHotspot ? `${primaryHotspot.percentage}%` : 'N/A',
    topRecommendationTitle: topRecommendation ? topRecommendation.title : 'N/A',
    topCO2Reduction: topRecommendation ? `${topRecommendation.estimatedCO2Reduction} tCO2e/year` : 'N/A',
    topAnnualSaving: topRecommendation ? `₹${Number(topRecommendation.estimatedAnnualSaving).toLocaleString('en-IN')}` : 'N/A',
  };

  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const llmResult = await queryGeminiAPI(apiKey, userQuestion, groundingContext);
      if (llmResult && llmResult.text) {
        return {
          success: true,
          answer: llmResult.text,
          supportingMetrics,
          referencedRecommendations: extractReferencedRecommendations(llmResult.text, recommendations),
          provider: 'Gemini AI (Grounded)',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out. Falling back to grounded deterministic engine:', err.message);
    }
  }

  // Graceful Fallback: Local Grounded Deterministic Engine
  const fallbackAnswer = generateDeterministicFallbackResponse({
    userQuestion,
    factoryProfile,
    totalEmissionsTons,
    categoryBreakdown,
    topHotspots,
    recommendations,
    simulationResults,
  });

  return {
    success: true,
    answer: fallbackAnswer,
    supportingMetrics,
    referencedRecommendations: recommendations.slice(0, 3),
    provider: 'EcoForge Grounded Copilot (Deterministic Engine)',
  };
}

/**
 * Calls Gemini REST API using standard fetch.
 */
async function queryGeminiAPI(apiKey, userQuestion, groundingContext) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const promptText = `${SYSTEM_PROMPT}\n\n=== GROUNDED FACTORY APPLICATION CONTEXT ===\n${groundingContext}\n\n=== USER QUESTION ===\n${userQuestion}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second safety timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 800 },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Malformed Gemini response format');
    }

    return { text: candidateText };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Local Grounded Deterministic Reasoning Engine
 * Analyzes query intent and formulates precise answers using actual calculated numbers.
 */
function generateDeterministicFallbackResponse({
  userQuestion,
  factoryProfile = {},
  totalEmissionsTons = 0,
  categoryBreakdown = {},
  topHotspots = [],
  recommendations = [],
  simulationResults = null,
}) {
  const q = userQuestion.toLowerCase();
  const top1 = topHotspots[0];
  const top2 = topHotspots[1];
  const rec1 = recommendations[0];

  // Intent 1: Why is [Hotspot] my biggest emission source / Where emissions come from
  if (q.includes('why') || q.includes('biggest') || q.includes('source') || q.includes('leak point')) {
    if (top1) {
      const matchingRec = recommendations.find(
        (r) => r.targetHotspot.toLowerCase() === top1.key.toLowerCase()
      ) || rec1;

      return `### 🔍 Primary Emission Leak Point Analysis

**${top1.name || top1.key.toUpperCase()}** is your facility's largest emission leak point, generating **${top1.emissionsTons} tCO2e/year**, which represents **${top1.percentage}%** of your total footprint (${totalEmissionsTons} tCO2e/year).

#### Why this is your primary hotspot:
- High operational intensity in fuel/power consumption.
- Carbon intensity per unit of energy or material consumed in current processes.
${top2 ? `- For context, your second largest hotspot is **${top2.name || top2.key}** contributing **${top2.emissionsTons} tCO2e (${top2.percentage}%)**.` : ''}

#### Recommended Intervention:
${matchingRec ? `To address this leak point directly, we recommend **${matchingRec.title}**. It is estimated to reduce **${matchingRec.estimatedCO2Reduction} tCO2e/year** with an annual saving of **₹${Number(matchingRec.estimatedAnnualSaving).toLocaleString('en-IN')}** (~${matchingRec.paybackPeriod} year payback).` : 'Review the recommended circular interventions tab to target this hotspot.'}`;
    }
  }

  // Intent 2: What should I change first / Priorities
  if (q.includes('first') || q.includes('priority') || q.includes('start') || q.includes('begin')) {
    if (rec1) {
      return `### 🚀 Recommended Priority Action

You should prioritize **${rec1.title}** (${rec1.category}).

#### Key Decision Metrics:
- **Target Hotspot:** ${rec1.targetHotspot.toUpperCase()} (your primary emission source)
- **Estimated CO2 Reduction:** **${rec1.estimatedCO2Reduction} tCO2e/year** (${rec1.reductionPercentage}% hotspot reduction)
- **Annual Financial Saving:** **₹${Number(rec1.estimatedAnnualSaving).toLocaleString('en-IN')}**
- **Payback Period:** **~${rec1.paybackPeriod} years**
- **Feasibility / Difficulty:** ${rec1.feasibility} Feasibility | ${rec1.difficulty} Implementation

#### Why start here?
This intervention directly targets your highest-impact leak point while offering the strongest return on investment and fast financial payback.`;
    }
  }

  // Intent 3: Fastest payback / Quickest ROI
  if (q.includes('payback') || q.includes('fastest') || q.includes('roi') || q.includes('quickest')) {
    const fastestRec = [...recommendations].sort((a, b) => a.paybackPeriod - b.paybackPeriod)[0] || rec1;
    if (fastestRec) {
      return `### ⚡ Fastest Payback Circular Intervention

The intervention with the fastest payback period is **${fastestRec.title}**.

#### Financial & Impact Profile:
- **Payback Period:** **~${fastestRec.paybackPeriod} years**
- **Estimated Implementation Cost:** ₹${Number(fastestRec.estimatedImplementationCost).toLocaleString('en-IN')}
- **Estimated Annual Savings:** **₹${Number(fastestRec.estimatedAnnualSaving).toLocaleString('en-IN')}/year**
- **Estimated CO2 Reduction:** **${fastestRec.estimatedCO2Reduction} tCO2e/year**

This represents your quickest route to financial self-funding sustainability improvements.`;
    }
  }

  // Intent 4: Highest CO2 reduction
  if (q.includes('most co2') || q.includes('maximum reduction') || q.includes('highest reduction')) {
    const maxCO2Rec = [...recommendations].sort((a, b) => b.estimatedCO2Reduction - a.estimatedCO2Reduction)[0] || rec1;
    if (maxCO2Rec) {
      return `### 🌿 Maximum CO2 Reduction Intervention

The single largest carbon reduction intervention is **${maxCO2Rec.title}**.

#### Impact Breakdown:
- **Estimated CO2 Reduction:** **${maxCO2Rec.estimatedCO2Reduction} tCO2e/year**
- **Hotspot Target:** ${maxCO2Rec.targetHotspot.toUpperCase()}
- **Annual Cost Savings:** ₹${Number(maxCO2Rec.estimatedAnnualSaving).toLocaleString('en-IN')}
- **Implementation Difficulty:** ${maxCO2Rec.difficulty}`;
    }
  }

  // Intent 5: What-if Simulation explanation
  if (q.includes('what-if') || q.includes('simulation') || q.includes('scenario') || simulationResults) {
    if (simulationResults) {
      return `### 📊 What-If Scenario Analysis

#### Scenario: ${simulationResults.scenarioName || 'Custom Operational Simulation'}

- **Baseline Footprint:** ${simulationResults.originalEmissionsTons || totalEmissionsTons} tCO2e/year
- **Simulated Footprint:** **${simulationResults.simulatedEmissionsTons} tCO2e/year**
- **Net CO2 Change:** **${simulationResults.netCO2ChangeTons > 0 ? '-' : '+'}${Math.abs(simulationResults.netCO2ChangeTons)} tCO2e/year** (${simulationResults.percentageChange}%)
- **Projected Financial Savings:** **₹${Number(simulationResults.netFinancialSavingINR || 0).toLocaleString('en-IN')}/year**

#### Tradeoffs & Considerations:
Operational parameter adjustments yield immediate carbon reductions. Maintain quality validation for material substitutions to ensure process yield is preserved.`;
    }
  }

  // Default Grounded Response
  return `### 📊 Sustainability Intelligence Summary for ${factoryProfile.name || 'Your Facility'}

- **Total Estimated Emissions:** **${totalEmissionsTons} tCO2e/year**
- **Primary Leak Point:** **${top1 ? top1.name || top1.key : 'N/A'}** (${top1 ? top1.percentage : 0}% of emissions)
- **Top Circular Recommendation:** **${rec1 ? rec1.title : 'N/A'}**

#### Key Impact Potential:
${rec1 ? `Implementing **${rec1.title}** can reduce emissions by **${rec1.estimatedCO2Reduction} tCO2e/year** and save **₹${Number(rec1.estimatedAnnualSaving).toLocaleString('en-IN')}/year** with a payback of ~${rec1.paybackPeriod} years.` : 'Please generate recommendations to view detailed financial & CO2 impacts.'}

Feel free to ask more specific questions like:
- *"Why is ${top1 ? top1.name || top1.key : 'diesel'} my biggest leak point?"*
- *"Which recommendation has the fastest payback?"*
- *"What should I change first?"*`;
}

/**
 * Extracts matching recommendation objects referenced in LLM text.
 */
function extractReferencedRecommendations(text, recommendations) {
  if (!text || !recommendations) return [];
  const lower = text.toLowerCase();
  return recommendations.filter(
    (r) => lower.includes(r.title.toLowerCase()) || lower.includes(r.id.toLowerCase())
  );
}
