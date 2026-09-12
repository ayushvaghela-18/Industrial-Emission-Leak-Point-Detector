/**
 * EcoForge AI — Python ML Service Client Adapter
 * 
 * Communicates with the FastAPI Machine Learning Recommendation Service.
 * Implements a resilient 4-second timeout with AbortController and graceful fallback
 * when the Python service is offline.
 * 
 * Primary Ownership: Member 3 (Circular Recommendation & AI Copilot)
 */

export function getMLServiceUrl() {
  const custom = process.env.ML_SERVICE_URL || process.env.VITE_ML_SERVICE_URL;
  return (custom ? custom.trim().replace(/\/+$/, '') : 'http://localhost:8000');
}

/**
 * Normalizes factory process data and emission metrics into the format expected by the ML service.
 */
export function formatMLPayload(analysisData = {}) {
  const factory = analysisData.factory || analysisData.factoryProfile || {};
  const operational = analysisData.operationalData || analysisData.processData || {};
  const energy = operational.energy || {};
  const materials = operational.materials || {};
  const waste = operational.waste || {};
  const logistics = operational.logistics || {};
  const production = operational.production || {};

  const totalEmissions = Number(
    analysisData.totalEmissionsTonsCO2e ??
    analysisData.totalEmissionsTons ??
    0
  );

  const topHotspots = Array.isArray(analysisData.topHotspots)
    ? analysisData.topHotspots
    : (Array.isArray(analysisData.hotspots) ? analysisData.hotspots : []);
  const primaryHotspot = topHotspots[0] || {};
  const rawHotspotKey = (primaryHotspot.key || primaryHotspot.source || primaryHotspot.category || 'electricity').toLowerCase();
  
  // Normalize to one of the model's trained categorical classes: coal, diesel, electricity, natural_gas, raw_materials, transport, waste
  let primaryHotspotKey = 'electricity';
  if (rawHotspotKey.includes('coal')) primaryHotspotKey = 'coal';
  else if (rawHotspotKey.includes('diesel')) primaryHotspotKey = 'diesel';
  else if (rawHotspotKey.includes('gas')) primaryHotspotKey = 'natural_gas';
  else if (rawHotspotKey.includes('electric') || rawHotspotKey.includes('grid')) primaryHotspotKey = 'electricity';
  else if (rawHotspotKey.includes('material') || rawHotspotKey.includes('raw')) primaryHotspotKey = 'raw_materials';
  else if (rawHotspotKey.includes('transport') || rawHotspotKey.includes('freight') || rawHotspotKey.includes('fleet') || rawHotspotKey.includes('logistics')) primaryHotspotKey = 'transport';
  else if (rawHotspotKey.includes('waste') || rawHotspotKey.includes('scrap')) primaryHotspotKey = 'waste';
  else primaryHotspotKey = rawHotspotKey;

  const primaryHotspotShare = Number(primaryHotspot.percentage ?? 35.0);

  // Normalize industry type to model's trained classes: chemical, food_processing, general, metal_engineering, textile
  const rawIndustry = (factory.industry || factory.industryType || 'general').toLowerCase();
  let industryType = 'general';
  if (rawIndustry.includes('textile')) industryType = 'textile';
  else if (rawIndustry.includes('chem')) industryType = 'chemical';
  else if (rawIndustry.includes('food') || rawIndustry.includes('beverage')) industryType = 'food_processing';
  else if (rawIndustry.includes('metal') || rawIndustry.includes('engineer') || rawIndustry.includes('machin')) industryType = 'metal_engineering';
  else industryType = rawIndustry;

  // Calculate scope shares
  const scope1 = Number(analysisData.scope1EmissionsTonsCO2e ?? analysisData.scope1EmissionsTons ?? 0);
  const scope2 = Number(analysisData.scope2EmissionsTonsCO2e ?? analysisData.scope2EmissionsTons ?? 0);
  const scope3 = Number(analysisData.scope3EmissionsTonsCO2e ?? analysisData.scope3EmissionsTons ?? 0);
  const totalScopeSum = (scope1 + scope2 + scope3) || totalEmissions || 1.0;

  const s1Share = Number(((scope1 / totalScopeSum) * 100).toFixed(2));
  const s2Share = Number(((scope2 / totalScopeSum) * 100).toFixed(2));
  const s3Share = Number((100.0 - s1Share - s2Share).toFixed(2));

  // Compute thermal fossil MJ equivalent from coal/diesel/gas
  const coalKg = Number(energy.coalKg || 0);
  const dieselLiters = Number(energy.dieselLiters || 0);
  const naturalGasM3 = Number(energy.naturalGasM3 || 0);
  const fossilFuelBurnMj = Math.round(
    (coalKg * 20.0) + (dieselLiters * 36.0) + (naturalGasM3 * 38.0)
  );

  return {
    industry_type: industryType,
    primary_hotspot_key: primaryHotspotKey,
    production_volume_units: Number(production.productionVolumeUnits || 100000),
    grid_electricity_kwh: Number(energy.gridElectricityKwh || 500000),
    renewable_electricity_kwh: Number(energy.renewableElectricityKwh || 0),
    fossil_fuel_burn_mj: fossilFuelBurnMj,
    raw_material_kg: Number(materials.rawMaterialKg || 100000),
    virgin_material_percentage: Number(materials.virginMaterialPercentage ?? 80),
    waste_generated_kg: Number(waste.wasteGeneratedKg || 20000),
    waste_landfill_percentage: Number(waste.wasteLandfillPercentage ?? 70),
    transport_tkm: Number(logistics.transportTkm || 25000),
    primary_hotspot_share_pct: primaryHotspotShare,
    scope1_share_pct: Math.max(0, s1Share),
    scope2_share_pct: Math.max(0, s2Share),
    scope3_share_pct: Math.max(0, s3Share),
  };
}

/**
 * Calls FastAPI POST /predict/recommendations to get ranked circular intervention categories.
 */
export async function getMLPredictions(analysisData = {}) {
  const baseUrl = getMLServiceUrl();
  const endpoint = `${baseUrl}/predict/recommendations`;
  const payload = formatMLPayload(analysisData);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      available: true,
      status: data.status || 'ACTIVE',
      confidence: data.confidence || 'medium',
      confidenceScore: data.confidenceScore || 0.0,
      topInterventions: data.topInterventions || [],
      allProbabilities: data.allProbabilities || {},
      keyDrivingFeatures: data.keyDrivingFeatures || [],
      model: data.model || 'RandomForestClassifier',
      version: data.version || '1.0.0',
    };
  } catch (err) {
    clearTimeout(timeoutId);
    // Graceful fallback when Python service is unavailable or times out
    return {
      available: false,
      status: 'UNAVAILABLE',
      confidence: 'low',
      confidenceScore: 0.0,
      topInterventions: [],
      allProbabilities: {},
      keyDrivingFeatures: [],
      message: `ML service offline (${err.name === 'AbortError' ? 'timeout' : 'connection refused'}). Utilizing deterministic scoring.`,
    };
  }
}

/**
 * Checks if the Python ML service is running and healthy.
 */
export async function checkMLServiceHealth() {
  const baseUrl = getMLServiceUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${baseUrl}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return { available: true, ...data };
    }
    return { available: false, status: 'degraded' };
  } catch {
    clearTimeout(timeoutId);
    return { available: false, status: 'offline' };
  }
}

/**
 * Retrieves persisted test metrics from the Python ML service.
 */
export async function getMLServiceMetrics() {
  const baseUrl = getMLServiceUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000);

  try {
    const response = await fetch(`${baseUrl}/model/metrics`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      return { success: true, metrics: data };
    }
    return { success: false, message: 'Metrics unavailable' };
  } catch (err) {
    clearTimeout(timeoutId);
    return { success: false, message: err.message };
  }
}
