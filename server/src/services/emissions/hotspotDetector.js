import { HOTSPOT_SEVERITY, HOTSPOT_THRESHOLDS } from '../../constants/index.js';

/**
 * Deterministic Hotspot & Emission Leak Point Detector
 * Primary Ownership: Member 2 (Backend & Emissions)
 *
 * Ranks emission sources and classifies severity based on configurable contribution thresholds.
 * Attaches explainable diagnostic rationale and metadata for Member 3's recommendation engine.
 */
export class HotspotDetector {
  /**
   * Identifies and ranks emission hotspots from calculated sources.
   * @param {Array} sources - Array of source breakdown objects from EmissionCalculator
   * @param {number} totalEmissionsKg - Total emissions in kg CO₂e
   * @returns {Array} Ranked hotspots with severity, diagnostic explanations, and metadata
   */
  static detectHotspots(sources, totalEmissionsKg) {
    if (!sources || sources.length === 0 || totalEmissionsKg <= 0) {
      return [];
    }

    // Filter out negligible sources (< 0.1 kg) and sort descending by emissions
    const sorted = [...sources]
      .filter((s) => s.emissionsKgCO2e > 0.1)
      .sort((a, b) => b.emissionsKgCO2e - a.emissionsKgCO2e);

    return sorted.map((source, index) => {
      const rank = index + 1;
      const percentage = source.percentage;
      const severity = this.classifySeverity(percentage);
      const explanation = this.generateExplanation(source, rank, severity);
      const reductionEstimate = this.estimateReductionPotential(source);

      return {
        rank,
        source: source.source,
        category: source.category,
        emissionsKgCO2e: source.emissionsKgCO2e,
        emissionsTonsCO2e: source.emissionsTonsCO2e,
        percentage,
        severity,
        explanation,
        reductionPotentialEstimate: reductionEstimate,
        metadata: {
          inputAmount: source.inputAmount,
          inputUnit: source.inputUnit,
          factorUsed: source.factorUsed,
          scope: source.scope,
          isPrimaryHotspot: rank === 1,
        },
      };
    });
  }

  /**
   * Classifies hotspot severity according to centralized threshold constants.
   */
  static classifySeverity(percentage) {
    if (percentage >= HOTSPOT_THRESHOLDS.CRITICAL) {
      return HOTSPOT_SEVERITY.CRITICAL;
    }
    if (percentage >= HOTSPOT_THRESHOLDS.HIGH) {
      return HOTSPOT_SEVERITY.HIGH;
    }
    if (percentage >= HOTSPOT_THRESHOLDS.MEDIUM) {
      return HOTSPOT_SEVERITY.MEDIUM;
    }
    return HOTSPOT_SEVERITY.LOW;
  }

  /**
   * Generates a deterministic, explainable diagnostic reason for why this source is a leak point.
   */
  static generateExplanation(source, rank, severity) {
    const srcName = source.source;
    const pct = source.percentage;
    const tons = source.emissionsTonsCO2e;

    if (srcName.includes('Grid Electricity')) {
      return `Grid electricity constitutes ${pct}% (${tons} t CO₂e) of the total carbon footprint due to fossil-fuel-intensive regional grid factors. Switching to on-site solar or green power tariffs can directly eliminate this Scope 2 leak point.`;
    }
    if (srcName.includes('Coal')) {
      return `Coal combustion contributes ${pct}% (${tons} t CO₂e) of total emissions. Thermal coal carries one of the highest carbon intensities (2.42 kg CO₂e/kg) and is a critical Scope 1 decarbonization target.`;
    }
    if (srcName.includes('Diesel')) {
      return `Diesel consumption accounts for ${pct}% (${tons} t CO₂e) of emissions, typical of backup diesel generators or unoptimized industrial burners.`;
    }
    if (srcName.includes('Natural Gas')) {
      return `Natural gas combustion accounts for ${pct}% (${tons} t CO₂e) of emissions from process heating and steam boilers.`;
    }
    if (srcName.includes('Virgin Raw Materials')) {
      return `Virgin material extraction represents ${pct}% (${tons} t CO₂e) of facility emissions. Substituting virgin inputs with recycled or bio-based circular feedstocks drastically shrinks Scope 3 intensity.`;
    }
    if (srcName.includes('Landfill')) {
      return `Solid waste disposal in landfills accounts for ${pct}% (${tons} t CO₂e) due to methane degradation. Diverting waste to recycling or circular material exchange eliminates this leak point.`;
    }
    if (srcName.includes('Transportation')) {
      return `Heavy road freight transportation represents ${pct}% (${tons} t CO₂e) of emissions across the supply chain. Route optimization and vehicle electrification provide reduction pathways.`;
    }

    return `${srcName} accounts for ${pct}% (${tons} t CO₂e) of total emissions, classified as ${severity} priority (Rank #${rank}).`;
  }

  /**
   * Estimates technical reduction potential ceiling for Member 3's recommendation service.
   */
  static estimateReductionPotential(source) {
    const srcName = source.source;
    const tons = source.emissionsTonsCO2e;

    if (srcName.includes('Grid Electricity')) {
      return {
        potentialTonsReduction: Math.round(tons * 0.90 * 100) / 100, // Up to 90% via solar/PPA
        primaryInterventionType: 'Renewable Power Transition (Solar PV / Green Tariff)',
      };
    }
    if (srcName.includes('Coal')) {
      return {
        potentialTonsReduction: Math.round(tons * 0.70 * 100) / 100,
        primaryInterventionType: 'Fuel Switching (Biomass / Electric Boiler / Waste Heat Recovery)',
      };
    }
    if (srcName.includes('Diesel')) {
      return {
        potentialTonsReduction: Math.round(tons * 0.60 * 100) / 100,
        primaryInterventionType: 'Electrification / Battery Storage / B100 Biofuel',
      };
    }
    if (srcName.includes('Virgin Raw Materials')) {
      return {
        potentialTonsReduction: Math.round(tons * 0.50 * 100) / 100,
        primaryInterventionType: 'Circular Feedstock Substitution (Recycled Content)',
      };
    }
    if (srcName.includes('Landfill')) {
      return {
        potentialTonsReduction: Math.round(tons * 0.85 * 100) / 100,
        primaryInterventionType: 'Zero-Waste-to-Landfill Circular Upcycling',
      };
    }

    return {
      potentialTonsReduction: Math.round(tons * 0.30 * 100) / 100,
      primaryInterventionType: 'Operational Process Optimization',
    };
  }
}

export default HotspotDetector;
