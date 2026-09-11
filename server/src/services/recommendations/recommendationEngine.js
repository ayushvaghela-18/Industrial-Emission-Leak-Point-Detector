/**
 * EcoForge AI — Deterministic Circular Recommendation Engine
 * 
 * Analyzes factory emission hotspots, category breakdowns, and operational inputs
 * to score, rank, and generate actionable circular recommendations with clear
 * financial & CO2 impact estimates.
 * 
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

import { RECOMMENDATION_CATALOG } from './catalog.js';

/**
 * Normalizes Member 2's raw emission analysis payload to Member 3's engine expectations.
 * Acts as a Member 3-side adapter so Member 2 code remains 100% untouched.
 */
export function normalizeAnalysisInput(rawInput = {}) {
  // Unwrap nested `data` key if wrapped by responseFormatter
  const input = rawInput.data || rawInput;

  const totalEmissionsTons = Number(
    input.totalEmissionsTonsCO2e ??
    input.totalEmissionsTons ??
    (input.totalEmissionsKgCO2e ? input.totalEmissionsKgCO2e / 1000 : 0) ??
    0
  );

  const rawFactory = input.factory || input.factoryProfile || {};
  const factoryProfile = {
    id: rawFactory.id || rawFactory._id || input.factoryId || 'default_factory',
    name: rawFactory.name || 'Industrial Facility',
    industry: (rawFactory.industry || rawFactory.industryType || 'all').toLowerCase(),
    location: rawFactory.location || 'N/A',
  };

  const operationalData = input.operationalData || input.processData || {};

  // Normalize Category Breakdown
  const categoryBreakdown = {};
  if (Array.isArray(input.categories)) {
    input.categories.forEach((catObj) => {
      const key = (catObj.category || 'general').toLowerCase();
      categoryBreakdown[key] = Number(catObj.emissionsTonsCO2e ?? catObj.emissionsTons ?? 0);
    });
  } else if (input.categoryBreakdown && typeof input.categoryBreakdown === 'object') {
    Object.entries(input.categoryBreakdown).forEach(([k, v]) => {
      categoryBreakdown[k.toLowerCase()] = Number(v || 0);
    });
  }

  // Normalize Hotspots
  let topHotspots = [];
  const rawHotspots = Array.isArray(input.hotspots)
    ? input.hotspots
    : (Array.isArray(input.sources) ? input.sources : []);

  if (rawHotspots.length > 0) {
    topHotspots = rawHotspots.map((h) => {
      const srcName = h.source || h.name || h.key || '';
      const mappedKey = mapSourceToHotspotKey(srcName, h.category);
      const emissionsTons = Number(h.emissionsTonsCO2e ?? h.emissionsTons ?? (h.emissionsKgCO2e ? h.emissionsKgCO2e / 1000 : 0));
      const percentage = Number(h.percentage ?? 0);

      return {
        key: mappedKey,
        name: srcName || formatCategoryName(mappedKey),
        emissionsTons,
        percentage,
        severity: h.severity || h.classification || 'HIGH',
        category: (h.category || 'general').toLowerCase(),
      };
    }).sort((a, b) => b.emissionsTons - a.emissionsTons);
  }

  return {
    factoryProfile,
    totalEmissionsTons,
    categoryBreakdown,
    topHotspots,
    operationalData,
  };
}

/**
 * Maps Member 2's descriptive source text to Member 3 recommendation catalog target keys.
 */
function mapSourceToHotspotKey(sourceName = '', category = '') {
  const src = sourceName.toLowerCase();
  const cat = category.toLowerCase();

  if (src.includes('grid electricity') || src.includes('electricity') || src.includes('power')) {
    return 'electricity';
  }
  if (src.includes('diesel')) {
    return 'diesel';
  }
  if (src.includes('coal')) {
    return 'coal';
  }
  if (src.includes('natural gas') || src.includes('gas')) {
    return 'natural_gas';
  }
  if (src.includes('raw material') || src.includes('virgin') || cat.includes('materials')) {
    return 'raw_materials';
  }
  if (src.includes('landfill') || src.includes('waste') || cat.includes('waste')) {
    return 'waste';
  }
  if (src.includes('transport') || src.includes('freight') || src.includes('logistics') || cat.includes('logistics')) {
    return 'transport';
  }

  return src.replace(/[^a-z0-9]/g, '_') || 'general';
}

/**
 * Generate structured, hotspot-aware recommendations based on emission analysis.
 * 
 * @param {Object} rawParams - Parameters or Member 2 raw emission analysis output
 * @returns {Array} List of scored and ranked recommendations with full impact metrics
 */
export function generateRecommendations(rawParams = {}) {
  // Normalize parameters using adapter
  const {
    factoryProfile,
    totalEmissionsTons,
    categoryBreakdown,
    topHotspots: inputHotspots,
    operationalData,
  } = normalizeAnalysisInput(rawParams);

  let topHotspots = inputHotspots;

  if (!topHotspots || topHotspots.length === 0) {
    const total = totalEmissionsTons || Object.values(categoryBreakdown).reduce((a, b) => a + Number(b || 0), 0) || 1;
    topHotspots = Object.entries(categoryBreakdown)
      .map(([key, val]) => ({
        key,
        name: formatCategoryName(key),
        emissionsTons: Number(val || 0),
        percentage: Number(((Number(val || 0) / total) * 100).toFixed(1)),
      }))
      .filter((h) => h.emissionsTons > 0)
      .sort((a, b) => b.emissionsTons - a.emissionsTons);
  }

  // Map hotspot key -> hotspot object for lookup
  const hotspotMap = new Map();
  topHotspots.forEach((h) => {
    hotspotMap.set(h.key.toLowerCase(), h);
  });

  const factoryIndustry = (factoryProfile.industry || 'all').toLowerCase();
  const scoredRecommendations = [];

  for (const item of RECOMMENDATION_CATALOG) {
    const targetKey = item.targetHotspot.toLowerCase();
    const matchingHotspot = hotspotMap.get(targetKey);

    let hotspotEmissions = 0;
    let hotspotPercentage = 0;

    if (matchingHotspot && matchingHotspot.emissionsTons > 0) {
      hotspotEmissions = matchingHotspot.emissionsTons;
      hotspotPercentage = matchingHotspot.percentage;
    } else if (targetKey === 'virgin_materials' && hotspotMap.has('raw_materials')) {
      const rm = hotspotMap.get('raw_materials');
      hotspotEmissions = rm.emissionsTons;
      hotspotPercentage = rm.percentage;
    } else if (targetKey === 'raw_materials' && hotspotMap.has('materials')) {
      const rm = hotspotMap.get('materials');
      hotspotEmissions = rm.emissionsTons;
      hotspotPercentage = rm.percentage;
    } else {
      const directVal = categoryBreakdown[targetKey] || 0;
      if (directVal > 0) {
        hotspotEmissions = directVal;
        const total = totalEmissionsTons || 1;
        hotspotPercentage = (directVal / total) * 100;
      } else {
        continue;
      }
    }

    // Check industry compatibility
    const isIndustryMatch =
      item.applicableIndustries.includes('all') ||
      item.applicableIndustries.some((ind) => ind.toLowerCase() === factoryIndustry);

    if (!isIndustryMatch) {
      continue;
    }

    // 1. Calculate Estimated CO2 Reduction (tCO2e/year)
    const estimatedCO2Reduction = Number((hotspotEmissions * (item.reductionPercentage / 100)).toFixed(2));

    // 2. Calculate Financial Impact (Annual Saving INR & Implementation Cost INR)
    const financialImpact = calculateFinancialImpact(item, estimatedCO2Reduction, operationalData);
    const estimatedAnnualSaving = financialImpact.estimatedAnnualSaving;
    const estimatedImplementationCost = financialImpact.estimatedImplementationCost;

    // 3. Payback Period Calculation (years)
    let paybackPeriod = item.paybackPeriodYears;
    if (estimatedAnnualSaving > 0 && estimatedImplementationCost > 0) {
      paybackPeriod = Number((estimatedImplementationCost / estimatedAnnualSaving).toFixed(1));
    }

    // 4. Calculate Deterministic Score
    const impactScore = Math.min(hotspotPercentage * 1.5, 50);

    let financialScore = 10;
    if (paybackPeriod <= 1.0) financialScore = 25;
    else if (paybackPeriod <= 2.5) financialScore = 20;
    else if (paybackPeriod <= 4.0) financialScore = 15;

    const feasibilityScore = item.feasibility === 'High' ? 20 : item.feasibility === 'Medium' ? 12 : 5;
    const difficultyPenalty = item.difficulty === 'Easy' ? 0 : item.difficulty === 'Moderate' ? -5 : -12;
    const relevanceBonus = item.applicableIndustries.includes(factoryIndustry) ? 10 : 5;

    const totalScore = Number(
      (impactScore + financialScore + feasibilityScore + relevanceBonus + difficultyPenalty).toFixed(1)
    );

    let calculatedPriority = 'Medium';
    if (totalScore >= 65 || (hotspotPercentage >= 25 && paybackPeriod <= 2.5)) {
      calculatedPriority = 'High';
    } else if (totalScore < 40) {
      calculatedPriority = 'Low';
    }

    const whyRecommended = buildWhyExplanation({
      title: item.title,
      targetHotspotName: formatCategoryName(item.targetHotspot),
      hotspotPercentage,
      estimatedCO2Reduction,
      estimatedAnnualSaving,
      paybackPeriod,
    });

    scoredRecommendations.push({
      id: item.id,
      title: item.title,
      category: item.category,
      targetHotspot: item.targetHotspot,
      description: item.description,
      currentSituation: item.currentSituation,
      proposedAction: item.proposedAction,
      whyRecommended,
      estimatedCO2Reduction,
      reductionPercentage: item.reductionPercentage,
      estimatedAnnualSaving,
      estimatedImplementationCost,
      paybackPeriod,
      feasibility: item.feasibility,
      difficulty: item.difficulty,
      priority: calculatedPriority,
      assumptions: item.assumptions,
      applicableIndustries: item.applicableIndustries,
      applicableInputs: item.applicableInputs,
      score: totalScore,
    });
  }

  scoredRecommendations.sort((a, b) => b.score - a.score);

  return scoredRecommendations;
}

/**
 * Deterministically calculates financial savings and implementation costs.
 */
function calculateFinancialImpact(item, estimatedCO2Reduction, operationalData) {
  let annualSaving = 0;
  let capex = 0;

  const baseBenchmarkSavingsPerTonCO2 = 5500;

  if (item.targetHotspot === 'electricity') {
    annualSaving = Math.round(estimatedCO2Reduction * 6200);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 3.0));
  } else if (item.targetHotspot === 'diesel') {
    annualSaving = Math.round(estimatedCO2Reduction * 7800);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.5));
  } else if (item.targetHotspot === 'coal') {
    annualSaving = Math.round(estimatedCO2Reduction * 4200);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.5));
  } else if (item.targetHotspot === 'natural_gas') {
    annualSaving = Math.round(estimatedCO2Reduction * 5800);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.0));
  } else if (item.targetHotspot === 'raw_materials' || item.targetHotspot === 'virgin_materials') {
    annualSaving = Math.round(estimatedCO2Reduction * 8500);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 1.8));
  } else if (item.targetHotspot === 'waste') {
    annualSaving = Math.round(estimatedCO2Reduction * 6500);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.2));
  } else {
    annualSaving = Math.round(estimatedCO2Reduction * baseBenchmarkSavingsPerTonCO2);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.0));
  }

  if (annualSaving < 50000 && estimatedCO2Reduction > 0) {
    annualSaving = Math.round(estimatedCO2Reduction * 4500);
  }
  if (capex < 100000 && annualSaving > 0) {
    capex = Math.round(annualSaving * 1.5);
  }

  return {
    estimatedAnnualSaving: annualSaving,
    estimatedImplementationCost: capex,
  };
}

/**
 * Format category key to human-readable string.
 */
function formatCategoryName(key) {
  if (!key) return 'General Operations';
  const names = {
    electricity: 'Grid Electricity Consumption',
    diesel: 'Diesel Generator & Fleet Fuel',
    coal: 'Industrial Coal Boiler Combustion',
    natural_gas: 'Natural Gas Thermal Heating',
    raw_materials: 'Virgin Raw Material Inputs',
    virgin_materials: 'Virgin Raw Material Inputs',
    waste: 'Industrial Waste & Effluent Streams',
    transport: 'Freight Logistics & Transportation',
  };
  return names[key.toLowerCase()] || key.replace(/_/g, ' ').toUpperCase();
}

/**
 * Builds clear, explainable text for why a recommendation is prioritized.
 */
function buildWhyExplanation({ targetHotspotName, hotspotPercentage, estimatedCO2Reduction, estimatedAnnualSaving, paybackPeriod }) {
  return `Targets your ${targetHotspotName} emission hotspot (${hotspotPercentage.toFixed(
    1
  )}% of total emissions). Implementing this circular intervention is estimated to eliminate ${estimatedCO2Reduction} tCO2e/year with an annual financial saving of ₹${estimatedAnnualSaving.toLocaleString('en-IN')} and a payback period of ~${paybackPeriod} years.`;
}
