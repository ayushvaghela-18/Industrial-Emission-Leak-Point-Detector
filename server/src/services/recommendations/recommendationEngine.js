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
 * Generate structured, hotspot-aware recommendations based on emission analysis.
 * 
 * @param {Object} params
 * @param {Object} params.factoryProfile - Factory details (industry, location, size)
 * @param {Number} params.totalEmissionsTons - Total calculated carbon footprint (tCO2e)
 * @param {Object} params.categoryBreakdown - Emissions breakdown per category (tons)
 * @param {Array}  params.topHotspots - Ranked array of hotspot objects { key, name, emissionsTons, percentage }
 * @param {Object} [params.operationalData] - Optional raw operational metrics (kWh, litres, etc.)
 * @returns {Array} List of scored and ranked recommendations with full impact metrics
 */
export function generateRecommendations({
  factoryProfile = {},
  totalEmissionsTons = 0,
  categoryBreakdown = {},
  topHotspots = [],
  operationalData = {},
}) {
  if (!topHotspots || topHotspots.length === 0) {
    // If topHotspots is missing, construct from categoryBreakdown
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

  // Create a map of hotspot key -> hotspot object for quick lookup
  const hotspotMap = new Map();
  topHotspots.forEach((h) => {
    hotspotMap.set(h.key.toLowerCase(), h);
  });

  const factoryIndustry = (factoryProfile.industry || 'all').toLowerCase();
  const scoredRecommendations = [];

  for (const item of RECOMMENDATION_CATALOG) {
    const targetKey = item.targetHotspot.toLowerCase();
    const matchingHotspot = hotspotMap.get(targetKey);

    // If factory has emissions in this hotspot (or if raw_materials/virgin_materials match)
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
      // Check if categoryBreakdown has a direct value
      const directVal = categoryBreakdown[targetKey] || 0;
      if (directVal > 0) {
        hotspotEmissions = directVal;
        const total = totalEmissionsTons || 1;
        hotspotPercentage = (directVal / total) * 100;
      } else {
        // Skip recommendations targeting non-existent emission sources
        continue;
      }
    }

    // Check industry compatibility
    const isIndustryMatch =
      item.applicableIndustries.includes('all') ||
      item.applicableIndustries.some((ind) => ind.toLowerCase() === factoryIndustry);

    if (!isIndustryMatch) {
      continue; // Skip irrelevant industry interventions
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
    // Impact Score: up to 50 pts based on hotspot emission share
    const impactScore = Math.min(hotspotPercentage * 1.5, 50);

    // Financial & Payback Score: up to 25 pts (faster payback = higher score)
    let financialScore = 10;
    if (paybackPeriod <= 1.0) financialScore = 25;
    else if (paybackPeriod <= 2.5) financialScore = 20;
    else if (paybackPeriod <= 4.0) financialScore = 15;

    // Feasibility Score: High=20, Medium=12, Low=5
    const feasibilityScore = item.feasibility === 'High' ? 20 : item.feasibility === 'Medium' ? 12 : 5;

    // Difficulty Penalty: Easy=0, Moderate=-5, Complex=-12
    const difficultyPenalty = item.difficulty === 'Easy' ? 0 : item.difficulty === 'Moderate' ? -5 : -12;

    // Industry Relevance Bonus: exact industry match = +10
    const relevanceBonus = item.applicableIndustries.includes(factoryIndustry) ? 10 : 5;

    const totalScore = Number(
      (impactScore + financialScore + feasibilityScore + relevanceBonus + difficultyPenalty).toFixed(1)
    );

    // Determine final priority tier
    let calculatedPriority = 'Medium';
    if (totalScore >= 65 || (hotspotPercentage >= 25 && paybackPeriod <= 2.5)) {
      calculatedPriority = 'High';
    } else if (totalScore < 40) {
      calculatedPriority = 'Low';
    }

    // Why Recommended explanation
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

  // Sort recommendations descending by score
  scoredRecommendations.sort((a, b) => b.score - a.score);

  return scoredRecommendations;
}

/**
 * Deterministically calculates financial savings and implementation costs.
 */
function calculateFinancialImpact(item, estimatedCO2Reduction, operationalData) {
  let annualSaving = 0;
  let capex = 0;

  // Standard monetary saving per tCO2e benchmark for industrial fuel/material efficiency (~₹4,500 - ₹9,000 / tCO2e)
  const baseBenchmarkSavingsPerTonCO2 = 5500;

  if (item.targetHotspot === 'electricity') {
    const kWh = operationalData.electricity || operationalData.electricityKWh || 100000;
    annualSaving = Math.round(estimatedCO2Reduction * 6200); // ~₹6,200 saved per tCO2e grid power reduced
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 3.0));
  } else if (item.targetHotspot === 'diesel') {
    annualSaving = Math.round(estimatedCO2Reduction * 7800); // Diesel replacement fuel cost saving
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.5));
  } else if (item.targetHotspot === 'coal') {
    annualSaving = Math.round(estimatedCO2Reduction * 4200); // Coal replacement cost saving
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.5));
  } else if (item.targetHotspot === 'natural_gas') {
    annualSaving = Math.round(estimatedCO2Reduction * 5800);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.0));
  } else if (item.targetHotspot === 'raw_materials' || item.targetHotspot === 'virgin_materials') {
    annualSaving = Math.round(estimatedCO2Reduction * 8500); // Virgin material replacement saving
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 1.8));
  } else if (item.targetHotspot === 'waste') {
    annualSaving = Math.round(estimatedCO2Reduction * 6500); // Waste disposal & recovery saving
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.2));
  } else {
    annualSaving = Math.round(estimatedCO2Reduction * baseBenchmarkSavingsPerTonCO2);
    capex = Math.round(annualSaving * (item.paybackPeriodYears || 2.0));
  }

  // Ensure reasonable minimums for demonstration realism
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
