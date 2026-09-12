/**
 * EcoForge AI — AI Sustainability Copilot Service
 * 
 * Conversational grounded AI assistant for EcoForge AI.
 * Grounded in authoritative backend-calculated metrics (emissions, hotspots, recommendations, simulation results).
 * 
 * Integrates with Ollama Cloud/API with a robust, question-aware grounded deterministic fallback engine.
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { SYSTEM_PROMPT, buildGroundingContext } from './promptTemplates.js';
import { normalizeAnalysisInput } from '../recommendations/recommendationEngine.js';

/**
 * Resolves the target Ollama endpoint.
 * Supports Ollama Cloud, custom Ollama API gateways, and local Ollama daemon.
 */
/**
 * Resolves the target Ollama endpoint.
 * Prioritizes OLLAMA_API_URL / OLLAMA_HOST when provided.
 * When OLLAMA_API_KEY is present, connects to Ollama Cloud (https://ollama.com/api/chat).
 * Defaults to local Ollama daemon (http://localhost:11434/api/chat) only when no API key is set.
 */
export function getOllamaEndpoint() {
  const customUrl = process.env.OLLAMA_API_URL || process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST;
  if (customUrl) {
    const trimmed = customUrl.trim();
    if (trimmed.endsWith('/api/chat') || trimmed.endsWith('/v1/chat/completions') || trimmed.endsWith('/api/generate')) {
      return trimmed;
    }
    if (trimmed.endsWith('/v1') || trimmed.endsWith('/v1/')) {
      return `${trimmed.replace(/\/+$/, '')}/chat/completions`;
    }
    return `${trimmed.replace(/\/+$/, '')}/api/chat`;
  }
  // Default to verified Ollama Cloud endpoint when API key is configured
  return process.env.OLLAMA_API_KEY ? 'https://ollama.com/api/chat' : 'http://localhost:11434/api/chat';
}

/**
 * Resolves the appropriate model for Ollama inference.
 * Reads process.env.OLLAMA_MODEL first.
 * If unset and using Ollama Cloud, dynamically inspects available models or selects a verified active cloud model.
 */
let cachedCloudModel = null;
export async function resolveOllamaModel({ apiKey, endpoint }) {
  if (process.env.OLLAMA_MODEL && process.env.OLLAMA_MODEL.trim()) {
    return process.env.OLLAMA_MODEL.trim();
  }

  const isCloud = Boolean(apiKey) || (endpoint && endpoint.includes('ollama.com'));
  if (isCloud) {
    if (cachedCloudModel) return cachedCloudModel;

    try {
      const tagsUrl = endpoint.includes('/v1/')
        ? endpoint.replace(/\/v1\/.*$/, '/api/tags')
        : endpoint.replace(/\/api\/.*$/, '/api/tags');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const headers = {};
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey.trim()}`;

      const res = await fetch(tagsUrl, { headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const models = Array.isArray(data.models) ? data.models.map((m) => m.name || m.model).filter(Boolean) : [];
        if (models.length > 0) {
          const preferred = ['deepseek-v4.1-flash', 'glm-5.3-flash', 'gpt-oss:20b', 'gemma4:31b', 'nemotron-3-nano:30b'];
          for (const pref of preferred) {
            const found = models.find((m) => m.toLowerCase().startsWith(pref));
            if (found) {
              cachedCloudModel = found;
              return found;
            }
          }
          cachedCloudModel = models[0];
          return models[0];
        }
      }
    } catch {
      // Tags probe timed out or failed; fallback to stable default cloud model
    }
    cachedCloudModel = 'deepseek-v4.1-flash';
    return cachedCloudModel;
  }

  // Local Ollama default
  return 'llama3.2';
}

/**
 * Strips unwanted formatting such as markdown headings (#, ##, ###), horizontal dividers,
 * raw JSON blocks, or generic boilerplate prefixes.
 */
export function sanitizeResponseText(rawText = '') {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText;

  // 1. Remove raw markdown code fences containing JSON or internal data
  text = text.replace(/```(?:json)?[\s\S]*?```/g, (match) => {
    if (match.includes('{') || match.includes('[')) return '';
    return match.replace(/```[a-z]*\n?/g, '');
  });

  // 2. Remove markdown headings (#, ##, ###, ####, etc.) from start of lines
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 3. Remove horizontal dividers (---, ***, ___)
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // 4. Remove generic conversational openers if present at start of any line
  text = text.replace(/^(?:Based on the (?:provided )?(?:information|data|context),?\s*|According to the (?:provided )?(?:information|data|context),?\s*|Sure!?,?\s*|Certainly!?,?\s*)/gim, '');

  // 5. Clean up excessive consecutive blank lines
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

/**
 * Queries the Ollama Cloud/API endpoint using standard fetch and AbortController.
 * Strict timeout: 25 seconds.
 */
export async function queryOllamaAPI({ apiKey, model, endpoint, userQuestion, groundingContext }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const headers = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  const isOpenAIFormat = endpoint.includes('/v1/');
  const promptBody = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `=== AUTHORITATIVE BACKEND CONTEXT ===\n${groundingContext}\n\n=== USER QUESTION ===\n${userQuestion}\n\nAnswer the user's specific question using ONLY the authoritative backend context provided above. Follow all formatting rules strictly.`
      }
    ],
    stream: false,
    ...(isOpenAIFormat
      ? { temperature: 0.2 }
      : { options: { temperature: 0.2 } })
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify(promptBody)
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403 || errText.toLowerCase().includes('unauthorized')) {
        throw new Error('HTTP 401 Unauthorized (Invalid or missing Ollama API key)');
      }
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Handles standard Ollama /api/chat (message.content), /api/generate (response), and OpenAI-compatible (choices[0].message.content)
    const rawContent = data.message?.content || data.response || data.choices?.[0]?.message?.content;

    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('Malformed or empty model response from Ollama');
    }

    return { text: rawContent.trim() };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Process a user question using grounded factory application context.
 */
export async function askCopilot(rawParams = {}) {
  const userQuestion = (
    rawParams.userQuestion ||
    rawParams.question ||
    rawParams.message ||
    rawParams.query ||
    rawParams.prompt ||
    ''
  ).trim();

  if (!userQuestion) {
    return {
      success: false,
      message: 'User question is required.',
      answer: 'Please ask a specific question regarding your factory emissions, leak points, circular recommendations, or simulation scenarios.',
      inferenceMode: 'none',
    };
  }

  // Normalize analysis context if raw Member 2 object provided
  const normalized = normalizeAnalysisInput(rawParams.analysisContext || rawParams);
  const effectiveProfile = { ...normalized.factoryProfile, ...(rawParams.factoryProfile || {}) };
  const effectiveTotal = rawParams.totalEmissionsTons || normalized.totalEmissionsTons || 0;
  const effectiveBreakdown = (rawParams.categoryBreakdown && Object.keys(rawParams.categoryBreakdown).length > 0)
    ? rawParams.categoryBreakdown
    : normalized.categoryBreakdown;
  const effectiveHotspots = (rawParams.topHotspots && rawParams.topHotspots.length > 0)
    ? rawParams.topHotspots
    : normalized.topHotspots;
  const effectiveRecs = (rawParams.recommendations && rawParams.recommendations.length > 0)
    ? rawParams.recommendations
    : [];
  const simulationResults = rawParams.simulationResults || null;

  // Build structured grounding context
  const groundingContext = buildGroundingContext({
    factoryProfile: effectiveProfile,
    operationalData: { ...normalized.operationalData, ...(rawParams.operationalData || {}) },
    totalEmissionsTons: effectiveTotal,
    categoryBreakdown: effectiveBreakdown,
    topHotspots: effectiveHotspots,
    recommendations: effectiveRecs,
    simulationResults,
  });

  // Extract reference metrics & recommendations for client UI highlighting
  const topRecommendation = effectiveRecs[0] || null;
  const primaryHotspot = effectiveHotspots[0] || null;

  const supportingMetrics = {
    totalEmissionsTons: effectiveTotal,
    primaryHotspotName: primaryHotspot ? (primaryHotspot.name || primaryHotspot.source || primaryHotspot.key) : 'N/A',
    primaryHotspotShare: primaryHotspot ? `${primaryHotspot.percentage}%` : 'N/A',
    topRecommendationTitle: topRecommendation ? topRecommendation.title : 'N/A',
    topCO2Reduction: topRecommendation ? `${topRecommendation.estimatedCO2Reduction ?? topRecommendation.co2ReductionTonnes ?? 0} tCO2e/year` : 'N/A',
    topAnnualSaving: topRecommendation ? `$${Number(topRecommendation.estimatedAnnualSaving ?? topRecommendation.annualSavingsUSD ?? 0).toLocaleString()}` : 'N/A',
  };

  // Check Ollama configuration
  const apiKey = process.env.OLLAMA_API_KEY ? process.env.OLLAMA_API_KEY.trim() : null;
  const customUrl = process.env.OLLAMA_API_URL || process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST;
  const endpoint = getOllamaEndpoint();
  const isCloud = Boolean(apiKey) || (endpoint && endpoint.includes('ollama.com'));
  const effectiveModel = await resolveOllamaModel({ apiKey, endpoint });

  // Attempt Ollama inference if API key is present (Cloud) OR custom URL is configured OR local daemon requested
  const shouldAttemptOllama = Boolean(apiKey || customUrl || process.env.ENABLE_LOCAL_OLLAMA === 'true');

  if (shouldAttemptOllama) {
    try {
      const llmResult = await queryOllamaAPI({
        apiKey,
        model: effectiveModel,
        endpoint,
        userQuestion,
        groundingContext,
      });

      if (llmResult && llmResult.text) {
        const sanitized = sanitizeResponseText(llmResult.text);
        if (sanitized && sanitized.length > 15) {
          return {
            success: true,
            answer: sanitized,
            supportingMetrics,
            referencedRecommendations: extractReferencedRecommendations(sanitized, effectiveRecs),
            provider: isCloud ? `Ollama Cloud (${effectiveModel})` : `Ollama (${effectiveModel})`,
            inferenceMode: 'llm',
          };
        }
      }
    } catch (err) {
      // SECURITY: Never print or log credentials, tokens, or authorization headers
      const safeMsg = err.message ? err.message.replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]') : 'Network error';
      console.warn(`Ollama inference unavailable (${safeMsg}). Utilizing question-aware grounded fallback engine.`);
    }
  }

  // Graceful Fallback: Question-Aware Grounded Deterministic Engine
  const fallbackAnswer = generateDeterministicFallbackResponse({
    userQuestion,
    factoryProfile: effectiveProfile,
    totalEmissionsTons: effectiveTotal,
    categoryBreakdown: effectiveBreakdown,
    topHotspots: effectiveHotspots,
    recommendations: effectiveRecs,
    simulationResults,
  });

  const sanitizedFallback = sanitizeResponseText(fallbackAnswer);

  return {
    success: true,
    answer: sanitizedFallback,
    supportingMetrics,
    referencedRecommendations: effectiveRecs.slice(0, 3),
    provider: 'EcoForge Grounded Copilot (Deterministic Engine)',
    inferenceMode: 'fallback',
  };
}

/**
 * Question-Aware Grounded Deterministic Reasoning Engine.
 * Formulates specific, natural, non-technical answers strictly grounded in calculated backend numbers.
 */
export function generateDeterministicFallbackResponse({
  userQuestion = '',
  factoryProfile = {},
  totalEmissionsTons = 0,
  categoryBreakdown = {},
  topHotspots = [],
  recommendations = [],
  simulationResults = null,
}) {
  const q = userQuestion.toLowerCase().trim();
  const top1 = topHotspots[0] || null;
  const top2 = topHotspots[1] || null;
  const top3 = topHotspots[2] || null;

  // 1. INTENT: Best Payback / Fastest Financial ROI
  const isPaybackQuery = q.includes('payback') ||
    q.includes('fastest') ||
    q.includes('quickest') ||
    q.includes('roi') ||
    (q.includes('best') && (q.includes('pay') || q.includes('return') || q.includes('financ')));

  if (isPaybackQuery) {
    if (recommendations.length > 0) {
      const sortedByPayback = [...recommendations].sort((a, b) => {
        const pA = Number(a.paybackPeriod ?? a.paybackPeriodYears ?? 999);
        const pB = Number(b.paybackPeriod ?? b.paybackPeriodYears ?? 999);
        return pA - pB;
      });
      const bestPayback = sortedByPayback[0];
      const pbYears = bestPayback.paybackPeriod ?? bestPayback.paybackPeriodYears ?? 'N/A';
      const capex = Number(bestPayback.estimatedImplementationCost ?? bestPayback.implementationCostUSD ?? 0);
      const savings = Number(bestPayback.estimatedAnnualSaving ?? bestPayback.annualSavingsUSD ?? 0);
      const co2Cut = bestPayback.estimatedCO2Reduction ?? bestPayback.co2ReductionTonnes ?? 0;

      return `The circular intervention with the best payback period is ${bestPayback.title} at approximately ${pbYears} years.

This project requires an estimated capital outlay of $${capex.toLocaleString()} and yields estimated annual operational savings of $${savings.toLocaleString()} per year. Concurrently, it delivers an estimated carbon abatement of ${co2Cut} tCO₂e per year by optimizing the ${bestPayback.targetHotspot || 'targeted'} process.

Because of its rapid financial return, this initiative provides the fastest path to self-funding decarbonization for ${factoryProfile.name || 'the facility'}.`;
    }
    return `Payback estimates are currently unavailable because no recommendations have been generated for this facility yet.`;
  }

  // 2. INTENT: Highest CO2 Reduction / Maximum Carbon Reduction
  const isHighestCO2Query = (q.includes('co2') && (q.includes('high') || q.includes('most') || q.includes('max') || q.includes('great') || q.includes('big') || q.includes('cut') || q.includes('reduc') || q.includes('abate') || q.includes('give') || q.includes('largest'))) ||
    q.includes('highest reduction') ||
    q.includes('maximum reduction') ||
    q.includes('largest reduction') ||
    q.includes('most reduction');

  if (isHighestCO2Query) {
    if (recommendations.length > 0) {
      const sortedByCO2 = [...recommendations].sort((a, b) => {
        const cA = Number(a.estimatedCO2Reduction ?? a.co2ReductionTonnes ?? 0);
        const cB = Number(b.estimatedCO2Reduction ?? b.co2ReductionTonnes ?? 0);
        return cB - cA;
      });
      const maxCO2Rec = sortedByCO2[0];
      const co2Cut = maxCO2Rec.estimatedCO2Reduction ?? maxCO2Rec.co2ReductionTonnes ?? 0;
      const pctCut = maxCO2Rec.reductionPercentage ?? maxCO2Rec.co2ReductionPct ?? 0;
      const savings = Number(maxCO2Rec.estimatedAnnualSaving ?? maxCO2Rec.annualSavingsUSD ?? 0);
      const pbYears = maxCO2Rec.paybackPeriod ?? maxCO2Rec.paybackPeriodYears ?? 'N/A';

      return `The recommendation delivering the highest carbon reduction is ${maxCO2Rec.title}.

This intervention provides an estimated reduction of ${co2Cut} tCO₂e per year (${pctCut}% abatement in its target stream). It directly tackles emissions from ${maxCO2Rec.targetHotspot || 'the primary operational line'}, while generating estimated annual financial savings of $${savings.toLocaleString()} per year with an estimated payback period of ~${pbYears} years.

If maximizing greenhouse gas reduction is the primary operational objective, this measure provides the single largest carbon saving among all evaluated options.`;
    }
    return `Carbon reduction metrics are unavailable because no circular recommendations have been generated yet.`;
  }

  // 3. INTENT: Which emission hotspot should we address first and why?
  const isHotspotToAddressFirst = (q.includes('hotspot') || q.includes('leak point') || q.includes('leakpoint') || q.includes('source')) &&
    (q.includes('first') || q.includes('address') || q.includes('priority') || q.includes('tackle') || q.includes('start') || q.includes('begin'));

  if (isHotspotToAddressFirst) {
    if (top1) {
      const srcName = top1.name || top1.source || top1.key || 'Primary Leak Point';
      const mass = top1.emissionsTons ?? top1.emissionsTonsCO2e ?? 0;
      const pct = top1.percentage ?? 0;
      const sev = top1.severity || 'Critical';
      const matchingRec = recommendations.find(
        (r) => (r.targetHotspot || '').toLowerCase() === (top1.key || top1.source || '').toLowerCase()
      ) || recommendations[0];

      return `The facility should address ${srcName} first because it is the largest emission leak point, generating ${mass} tCO₂e per year or ${pct}% of total emissions (${sev} priority).

Addressing ${srcName} first provides the highest carbon reduction leverage because it represents the dominant share of the plant's overall footprint.${matchingRec ? ` The recommended circular intervention is ${matchingRec.title}, which is projected to cut ${matchingRec.estimatedCO2Reduction ?? matchingRec.co2ReductionTonnes ?? 0} tCO₂e per year with an estimated payback of ~${matchingRec.paybackPeriod ?? matchingRec.paybackPeriodYears ?? 'N/A'} years.` : ''}

By eliminating this primary leak point first, the plant achieves the greatest progress toward regulatory compliance and emission abatement.`;
    }
    return `No emission hotspots have been flagged for this facility yet.`;
  }

  // 4. INTENT: Specific Hotspot or Category Deep-Dive (e.g. "Why is Grid Electricity a major hotspot?")
  const matchedHotspot = topHotspots.find((h) => {
    const name = (h.name || h.source || h.key || '').toLowerCase();
    return name.length > 2 && q.includes(name);
  }) || (q.includes('electr') ? topHotspots.find((h) => (h.key || h.name || h.source || '').toLowerCase().includes('electr')) : null) ||
     (q.includes('diesel') ? topHotspots.find((h) => (h.key || h.name || h.source || '').toLowerCase().includes('diesel')) : null) ||
     (q.includes('coal') ? topHotspots.find((h) => (h.key || h.name || h.source || '').toLowerCase().includes('coal')) : null) ||
     (q.includes('gas') ? topHotspots.find((h) => (h.key || h.name || h.source || '').toLowerCase().includes('gas')) : null) ||
     (q.includes('material') || q.includes('steel') || q.includes('cotton') ? topHotspots.find((h) => (h.key || h.name || h.source || '').toLowerCase().includes('material')) : null);

  if (matchedHotspot && (q.includes('why') || q.includes('major') || q.includes('explain') || q.includes('hotspot'))) {
    const name = matchedHotspot.name || matchedHotspot.source || matchedHotspot.key;
    const mass = matchedHotspot.emissionsTons ?? matchedHotspot.emissionsTonsCO2e ?? 0;
    const pct = matchedHotspot.percentage ?? 0;
    const sev = matchedHotspot.severity || 'High';

    return `${name} is a major emission hotspot because it generates ${mass} tCO₂e per year, representing ${pct}% of the facility's total emissions profile (classified as ${sev} severity).

In manufacturing facilities, this elevated footprint is typically driven by intense process energy or material consumption combined with carbon-intensive supply feeds. Implementing dedicated on-site efficiency improvements or circular material loops directly mitigates this emission stream.`;
  }

  // 5. INTENT: What-If Simulation Explanation
  const isSimulationQuery = q.includes('simulation') ||
    q.includes('what-if') ||
    q.includes('what if') ||
    q.includes('scenario') ||
    q.includes('projected');

  if (isSimulationQuery) {
    if (simulationResults) {
      const baselineTons = simulationResults.baseline?.totalEmissionsTonsCO2e ?? simulationResults.originalEmissionsTons ?? totalEmissionsTons;
      const projectedTons = simulationResults.projected?.totalEmissionsTonsCO2e ?? simulationResults.simulatedEmissionsTons ?? 0;
      const co2Reduction = simulationResults.impact?.co2ReductionTons ?? simulationResults.netCO2ChangeTons ?? Math.max(0, baselineTons - projectedTons);
      const pctChange = simulationResults.impact?.percentageReduction ?? simulationResults.percentageChange ?? 0;
      const savings = simulationResults.impact?.estimatedAnnualSavingsUSD ?? simulationResults.netFinancialSavingINR ?? 0;
      const changes = simulationResults.simulationApplied || simulationResults.adjustments || {};

      const paramDescriptions = Object.entries(changes)
        .map(([key, val]) => `${key.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${val}%`)
        .join(', ');

      return `The what-if simulation demonstrates the impact of operational levers on the facility's carbon footprint and operating economics.

Under the simulated scenario${paramDescriptions ? ` (${paramDescriptions})` : ''}, total emissions decrease from a baseline of ${baselineTons} tCO₂e to a projected ${projectedTons} tCO₂e per year. This represents an absolute reduction of ${co2Reduction} tCO₂e per year (${pctChange}% overall cut).

Financially, this operational adjustment is projected to generate estimated annual savings of $${Number(savings).toLocaleString()} per year through reduced utility burn and enhanced resource efficiency.`;
    }
    return `No what-if simulation scenario has been run yet for this facility.

To simulate decarbonization outcomes, navigate to the What-If Simulator module, adjust operational levers such as renewable power or recycled content, and click "Run Simulation Engine" to calculate projected emissions and cost savings.`;
  }

  // 6. INTENT: What should the factory do first? / General First Action
  const isWhatToDoFirst = (q.includes('do first') ||
    q.includes('what should we do') ||
    q.includes('what to do') ||
    q.includes('start with') ||
    q.includes('begin with') ||
    q.includes('first action') ||
    q.includes('first step') ||
    q.includes('where to start')) && !q.includes('hotspot');

  if (isWhatToDoFirst) {
    const topRec = recommendations[0];
    if (topRec) {
      const title = topRec.title;
      const target = topRec.targetHotspot || 'primary emission stream';
      const co2Cut = topRec.estimatedCO2Reduction ?? topRec.co2ReductionTonnes ?? 0;
      const savings = Number(topRec.estimatedAnnualSaving ?? topRec.annualSavingsUSD ?? 0);
      const pbYears = topRec.paybackPeriod ?? topRec.paybackPeriodYears ?? 'N/A';
      const feas = topRec.feasibility || 'High';

      return `The factory should first implement ${title}.

This action directly targets ${target}, providing an estimated reduction of ${co2Cut} tCO₂e per year while saving approximately $${savings.toLocaleString()} annually with a payback period of ~${pbYears} years.

Starting with this intervention is recommended because it pairs high feasibility (${feas}) with immediate carbon savings and strong financial returns, establishing immediate momentum for the facility's decarbonization roadmap.`;
    }
    return `Operational recommendations have not been calculated for this facility yet. Please submit process telemetry to generate tailored actions.`;
  }

  // 7. INTENT: What are the main emission hotspots? / Hotspot Summary
  const isMainHotspotsQuery = q.includes('main hotspot') ||
    q.includes('all hotspot') ||
    q.includes('what are the hotspot') ||
    q.includes('list hotspot') ||
    q.includes('emission hotspot') ||
    q.includes('leak point');

  if (isMainHotspotsQuery) {
    const list = [top1, top2, top3].filter(Boolean);
    if (list.length > 0) {
      const items = list
        .map((h, i) => `${i + 1}. ${h.name || h.source || h.key}: ${h.emissionsTons ?? h.emissionsTonsCO2e ?? 0} tCO₂e/year (${h.percentage}% of total footprint)`)
        .join('\n');

      return `The primary emission leak points identified for this facility are:

${items}

Together, these process streams account for the vast majority of overall facility emissions. Prioritizing circular interventions across these specific sources will achieve the most cost-effective emission reductions.`;
    }
    return `No specific emission hotspots have been flagged for this facility.`;
  }

  // 8. DEFAULT: Grounded General Overview
  const fallbackRec = recommendations[0];
  return `The facility has an estimated annual carbon footprint of ${totalEmissionsTons} tCO₂e per year.

The largest identified emission leak point is ${top1 ? (top1.name || top1.source || top1.key) : 'operational energy'}, contributing ${top1 ? (top1.emissionsTons ?? top1.emissionsTonsCO2e ?? 0) : 0} tCO₂e per year (${top1 ? top1.percentage : 0}% of total emissions).

The primary recommended circular intervention is ${fallbackRec ? fallbackRec.title : 'operational resource optimization'}${fallbackRec ? `, estimated to reduce ${fallbackRec.estimatedCO2Reduction ?? fallbackRec.co2ReductionTonnes ?? 0} tCO₂e per year with $${Number(fallbackRec.estimatedAnnualSaving ?? fallbackRec.annualSavingsUSD ?? 0).toLocaleString()} annual savings` : ''}.`;
}

/**
 * Extracts matching recommendation objects referenced in text.
 */
function extractReferencedRecommendations(text, recommendations) {
  if (!text || !recommendations) return [];
  const lower = text.toLowerCase();
  return recommendations.filter(
    (r) => lower.includes(r.title.toLowerCase()) || (r.id && lower.includes(r.id.toLowerCase()))
  );
}
