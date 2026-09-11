import { DEMO_FACTORIES } from './demoData.js';
import { FactoryRepository, ProcessDataRepository, EmissionAnalysisRepository } from '../utils/repository.js';
import { EmissionCalculator } from '../services/emissions/emissionCalculator.js';
import { HotspotDetector } from '../services/emissions/hotspotDetector.js';

/**
 * Seed Synthetic Demo Factories and Compute Initial Emission Analyses
 * Primary Ownership: Member 2 (Backend & Emissions)
 */
export const seedDemoData = async () => {
  console.log('[EcoForge AI] Seeding synthetic demonstration factories...');

  // Clean existing demo data if any
  await FactoryRepository.deleteMany({ isSyntheticDemo: true });

  const seededResults = [];

  for (const demo of DEMO_FACTORIES) {
    const { processData, ...factoryInfo } = demo;

    // 1. Create Factory
    const factory = await FactoryRepository.create(factoryInfo);
    const factoryId = factory._id || factory.id;

    // 2. Create Process Data
    const processDoc = await ProcessDataRepository.create({
      factoryId,
      ...processData,
    });
    const processDataId = processDoc._id || processDoc.id;

    // 3. Compute Deterministic Emissions
    const calculation = EmissionCalculator.calculate(processData);

    // 4. Detect Hotspots
    const hotspots = HotspotDetector.detectHotspots(
      calculation.sources,
      calculation.totalEmissionsKgCO2e
    );

    // 5. Store Emission Analysis
    const analysis = await EmissionAnalysisRepository.create({
      factoryId,
      processDataId,
      totalEmissionsKgCO2e: calculation.totalEmissionsKgCO2e,
      totalEmissionsTonsCO2e: calculation.totalEmissionsTonsCO2e,
      categories: calculation.categories,
      sources: calculation.sources,
      hotspots,
      baselineMetrics: calculation.baselineMetrics,
    });

    seededResults.push({
      factoryId,
      name: factory.name,
      industryType: factory.industryType,
      totalEmissionsTonsCO2e: calculation.totalEmissionsTonsCO2e,
      topHotspot: hotspots[0] ? `${hotspots[0].source} (${hotspots[0].percentage}%)` : 'None',
      analysisId: analysis._id || analysis.id,
    });
  }

  console.log(`[EcoForge AI] Successfully seeded ${seededResults.length} demo factories with baseline emissions.`);
  return seededResults;
};

// If run directly via node
if (process.argv[1] && process.argv[1].endsWith('seedDemoData.js')) {
  seedDemoData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[EcoForge AI] Seed failed:', err);
      process.exit(1);
    });
}
