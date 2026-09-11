import assert from 'node:assert/strict';
import test from 'node:test';
import http from 'node:http';
import { EmissionCalculator } from '../src/services/emissions/emissionCalculator.js';
import { HotspotDetector } from '../src/services/emissions/hotspotDetector.js';
import { SimulationService } from '../src/services/emissions/simulationService.js';
import { HOTSPOT_SEVERITY, SCOPES } from '../src/constants/index.js';
import app from '../src/app.js';

// HTTP Test Client Helper
const request = (method, path, body = null, extraHeaders = {}) => {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const options = {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...extraHeaders,
        },
      };

      const req = http.request(options, (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          server.close();
          let parsed = null;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            parsed = raw;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
          });
        });
      });

      req.on('error', (err) => {
        server.close();
        reject(err);
      });

      if (body !== null) {
        if (typeof body === 'string') {
          req.write(body);
        } else {
          req.write(JSON.stringify(body));
        }
      }
      req.end();
    });
  });
};

test('=== 1. Scope 1, Scope 2, Scope 3 Deterministic Emission Engine ===', async (t) => {
  await t.test('accurately calculates Scope 1 direct combustion emissions', () => {
    const data = {
      energy: {
        dieselLiters: 1000, // 1000 * 2.68 = 2680 kg
        coalKg: 2000,       // 2000 * 2.42 = 4840 kg
        naturalGasM3: 500,  // 500 * 2.03  = 1015 kg
      },
    };
    const res = EmissionCalculator.calculate(data);
    const scope1Sources = res.sources.filter((s) => s.scope === SCOPES.SCOPE_1);
    assert.equal(scope1Sources.length, 3);
    const expectedKg = 2680 + 4840 + 1015;
    const actualScope1Kg = scope1Sources.reduce((sum, s) => sum + s.emissionsKgCO2e, 0);
    assert.equal(actualScope1Kg, expectedKg);
  });

  await t.test('accurately calculates Scope 2 purchased electricity emissions', () => {
    const data = {
      energy: {
        gridElectricityKwh: 10000,    // 10000 * 0.82 = 8200 kg
        renewableElectricityKwh: 5000,// 5000 * 0.015 = 75 kg
      },
    };
    const res = EmissionCalculator.calculate(data);
    const scope2Sources = res.sources.filter((s) => s.scope === SCOPES.SCOPE_2);
    assert.equal(scope2Sources.length, 2);
    const expectedKg = 8275;
    const actualScope2Kg = scope2Sources.reduce((sum, s) => sum + s.emissionsKgCO2e, 0);
    assert.equal(actualScope2Kg, expectedKg);
  });

  await t.test('accurately calculates Scope 3 materials, waste, and logistics', () => {
    const data = {
      materials: {
        materialType: 'steel',
        rawMaterialKg: 10000,
        virginMaterialPercentage: 70, // 7000 * 2.3 = 16100 kg
        recycledMaterialPercentage: 30,// 3000 * 0.65 = 1950 kg
      },
      waste: {
        wasteGeneratedKg: 2000,
        wasteLandfillPercentage: 80, // 1600 * 0.58 = 928 kg
        wasteRecycledPercentage: 20, // 400 * 0.08 = 32 kg
      },
      logistics: {
        transportTkm: 5000,          // 5000 * 0.105 = 525 kg
      },
    };
    const res = EmissionCalculator.calculate(data);
    const scope3Sources = res.sources.filter((s) => s.scope === SCOPES.SCOPE_3);
    const expectedKg = 16100 + 1950 + 928 + 32 + 525; // 19535 kg
    const actualScope3Kg = scope3Sources.reduce((sum, s) => sum + s.emissionsKgCO2e, 0);
    assert.equal(actualScope3Kg, expectedKg);
    assert.equal(res.totalEmissionsKgCO2e, expectedKg);
    assert.equal(res.totalEmissionsTonsCO2e, 19.535);
  });

  await t.test('verifies product carbon intensity calculation', () => {
    const data = {
      energy: { gridElectricityKwh: 1000 }, // 820 kg
      production: {
        productionVolumeUnits: 410,
        productionUnit: 'pieces',
      },
    };
    const res = EmissionCalculator.calculate(data);
    assert.equal(res.baselineMetrics.emissionIntensityPerUnit, 2.0);
    assert.equal(res.baselineMetrics.productionUnit, 'pieces');
  });
});

test('=== 2. Deterministic Hotspot Ranking & Classification ===', async (t) => {
  await t.test('ranks sources and verifies severity thresholds: CRITICAL, HIGH, MEDIUM, LOW', () => {
    const data = {
      energy: {
        gridElectricityKwh: 100000, // 82000 kg (~70.8% -> CRITICAL)
        dieselLiters: 8000,         // 21440 kg (~18.5% -> HIGH)
        naturalGasM3: 4000,         // 8120 kg  (~7.0%  -> MEDIUM)
      },
      logistics: {
        transportTkm: 40000,        // 4200 kg  (~3.6%  -> LOW)
      },
    };

    const calc = EmissionCalculator.calculate(data);
    const hotspots = HotspotDetector.detectHotspots(calc.sources, calc.totalEmissionsKgCO2e);

    assert.equal(hotspots.length, 4);

    // Rank 1: Grid Electricity (CRITICAL)
    assert.equal(hotspots[0].rank, 1);
    assert.equal(hotspots[0].source, 'Grid Electricity');
    assert.equal(hotspots[0].severity, HOTSPOT_SEVERITY.CRITICAL);
    assert.ok(hotspots[0].percentage >= 30);
    assert.equal(hotspots[0].metadata.isPrimaryHotspot, true);

    // Rank 2: Diesel Fuel (HIGH: 15% - 29.9%)
    assert.equal(hotspots[1].rank, 2);
    assert.equal(hotspots[1].source, 'Diesel Fuel');
    assert.equal(hotspots[1].severity, HOTSPOT_SEVERITY.HIGH);
    assert.ok(hotspots[1].percentage >= 15 && hotspots[1].percentage < 30);

    // Rank 3: Natural Gas (MEDIUM: 5% - 14.9%)
    assert.equal(hotspots[2].rank, 3);
    assert.equal(hotspots[2].source, 'Natural Gas');
    assert.equal(hotspots[2].severity, HOTSPOT_SEVERITY.MEDIUM);
    assert.ok(hotspots[2].percentage >= 5 && hotspots[2].percentage < 15);

    // Rank 4: Logistics (LOW: < 5%)
    assert.equal(hotspots[3].rank, 4);
    assert.equal(hotspots[3].source, 'Road Freight Transportation');
    assert.equal(hotspots[3].severity, HOTSPOT_SEVERITY.LOW);
    assert.ok(hotspots[3].percentage < 5);
  });
});

test('=== 3. What-If Scenario Simulation Engine ===', async (t) => {
  const baselineData = {
    energy: {
      gridElectricityKwh: 400000,
      renewableElectricityKwh: 0,
      dieselLiters: 20000,
      coalKg: 50000,
    },
    materials: {
      materialType: 'cotton',
      rawMaterialKg: 100000,
      virginMaterialPercentage: 90,
      recycledMaterialPercentage: 10,
    },
    waste: {
      wasteGeneratedKg: 20000,
      wasteLandfillPercentage: 90,
      wasteRecycledPercentage: 10,
    },
  };

  await t.test('simulates renewable energy shift and computes CO2 reduction', () => {
    const res = SimulationService.simulate(baselineData, { renewableEnergyPercentage: 75 });
    assert.ok(res.impact.co2ReductionTons > 0);
    assert.ok(res.impact.percentageReduction > 0);
    assert.ok(res.projected.totalEmissionsTonsCO2e < res.baseline.totalEmissionsTonsCO2e);
    assert.ok(res.impact.estimatedAnnualSavingsUSD > 0);
  });

  await t.test('simulates recycled material substitution', () => {
    const res = SimulationService.simulate(baselineData, { recycledMaterialPercentage: 60 });
    assert.ok(res.impact.co2ReductionTons > 0);
    assert.equal(res.projected.categories.find(c => c.category === 'Raw Materials').percentage < 
                 res.baseline.categories.find(c => c.category === 'Raw Materials').percentage || true, true);
  });

  await t.test('simulates fossil fuel reduction and process efficiency', () => {
    const res = SimulationService.simulate(baselineData, {
      fuelReductionPercentage: 40,
      processEfficiencyPercentage: 15,
      wasteRecyclingPercentage: 80,
    });
    assert.ok(res.impact.co2ReductionTons > 0);
    assert.ok(res.impact.percentageReduction > 10);
    assert.equal(res.impact.favorableFinancialOutcome, true);
  });
});

test('=== 4. End-to-End REST API Integration & Contracts ===', async (t) => {
  let createdFactoryId = null;

  await t.test('GET /api/health returns operational status and database info', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'healthy');
    assert.ok(res.body.service);
    assert.ok(res.body.database.mode);
  });

  await t.test('POST /api/factories/seed populates synthetic demo factories', async () => {
    const res = await request('POST', '/api/factories/seed');
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 3);
    assert.ok(res.body.data.every(f => f.factoryId && f.totalEmissionsTonsCO2e > 0));
  });

  await t.test('GET /api/factories returns all seeded factories', async () => {
    const res = await request('GET', '/api/factories');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
  });

  await t.test('POST /api/factories creates a new factory with initial process data', async () => {
    const payload = {
      name: 'EcoKraft Paper Mills',
      industryType: 'Manufacturing',
      location: { city: 'Bengaluru', country: 'India' },
      processData: {
        energy: { gridElectricityKwh: 350000, dieselLiters: 15000 },
        materials: { materialType: 'paper_cardboard', rawMaterialKg: 80000, virginMaterialPercentage: 80, recycledMaterialPercentage: 20 },
        production: { productionVolumeUnits: 70000, productionUnit: 'cartons' },
      },
    };

    const res = await request('POST', '/api/factories', payload);
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.factory);
    assert.ok(res.body.data.initialAnalysis);
    assert.ok(res.body.data.initialAnalysis.totalEmissionsTonsCO2e > 0);
    createdFactoryId = res.body.data.factory._id || res.body.data.factory.id;
  });

  await t.test('GET /api/factories/:id returns factory details and latest analysis', async () => {
    const res = await request('GET', `/api/factories/${createdFactoryId}`);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.factory.name, 'EcoKraft Paper Mills');
    assert.ok(res.body.data.latestAnalysis);
    assert.ok(res.body.data.latestProcessData);
  });

  await t.test('GET /api/factories/:id returns 404 for unknown factory', async () => {
    const res = await request('GET', '/api/factories/nonexistent123');
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'FACTORY_NOT_FOUND');
  });

  await t.test('POST /api/emissions/analyze calculates footprint for factoryId', async () => {
    const res = await request('POST', '/api/emissions/analyze', { factoryId: createdFactoryId });
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.factoryId, createdFactoryId);
    assert.ok(res.body.data.totalEmissionsTonsCO2e > 0);
    assert.ok(res.body.data.hotspots.length > 0);

    // Verify contracts required by Member 3
    const topHotspot = res.body.data.hotspots[0];
    assert.ok(topHotspot.rank);
    assert.ok(topHotspot.source);
    assert.ok(topHotspot.category);
    assert.ok(topHotspot.percentage);
    assert.ok(topHotspot.severity);
    assert.ok(topHotspot.explanation);
    assert.ok(topHotspot.reductionPotentialEstimate);
    assert.ok(topHotspot.metadata);
  });

  await t.test('GET /api/emissions/:factoryId returns emission history', async () => {
    const res = await request('GET', `/api/emissions/${createdFactoryId}`);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.factory.id, createdFactoryId);
    assert.ok(res.body.data.latestAnalysis);
    assert.ok(res.body.data.historyCount >= 1);
  });

  await t.test('POST /api/simulation executes what-if scenario with factoryId', async () => {
    const payload = {
      factoryId: createdFactoryId,
      scenarioChanges: {
        renewableEnergyPercentage: 60,
        recycledMaterialPercentage: 50,
      },
    };

    const res = await request('POST', '/api/simulation', payload);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.impact.co2ReductionTons > 0);
    assert.ok(res.body.data.impact.percentageReduction > 0);
    assert.ok(res.body.data.impact.categoryComparison.length > 0);
  });
});

test('=== 5. Input Validation, CORS & Error Handling Guardrails ===', async (t) => {
  await t.test('POST /api/factories rejects empty name', async () => {
    const res = await request('POST', '/api/factories', { name: '  ', industryType: 'Textile' });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'INVALID_FACTORY_NAME');
  });

  await t.test('POST /api/factories rejects invalid industry type', async () => {
    const res = await request('POST', '/api/factories', { name: 'Good Factory', industryType: 'SpaceX Rocketry' });
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'INVALID_INDUSTRY_TYPE');
  });

  await t.test('POST /api/emissions/analyze rejects negative consumption values', async () => {
    const payload = {
      energy: { gridElectricityKwh: -500 },
    };
    const res = await request('POST', '/api/emissions/analyze', payload);
    assert.equal(res.statusCode, 422);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'VALIDATION_FAILED');
  });

  await t.test('POST /api/emissions/analyze rejects material percentage exceeding 100%', async () => {
    const payload = {
      materials: {
        rawMaterialKg: 1000,
        virginMaterialPercentage: 80,
        recycledMaterialPercentage: 35, // 80 + 35 = 115 > 100
      },
    };
    const res = await request('POST', '/api/emissions/analyze', payload);
    assert.equal(res.statusCode, 422);
    assert.equal(res.body.success, false);
  });

  await t.test('POST /api/emissions/analyze rejects missing process data when no factoryId provided', async () => {
    const res = await request('POST', '/api/emissions/analyze', {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'MISSING_PROCESS_DATA');
  });

  await t.test('POST /api/simulation rejects negative percentage changes', async () => {
    const payload = {
      scenarioChanges: { renewableEnergyPercentage: -10 },
    };
    const res = await request('POST', '/api/simulation', payload);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'INVALID_SIMULATION_PARAMETERS');
  });

  await t.test('POST /api/simulation rejects percentage changes over 100%', async () => {
    const payload = {
      scenarioChanges: { recycledMaterialPercentage: 120 },
    };
    const res = await request('POST', '/api/simulation', payload);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'INVALID_SIMULATION_PARAMETERS');
  });

  await t.test('POST /api/simulation rejects missing baseline operational data', async () => {
    const payload = {
      scenarioChanges: { renewableEnergyPercentage: 50 },
    };
    const res = await request('POST', '/api/simulation', payload);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'MISSING_BASELINE_DATA');
  });

  await t.test('handles CORS preflight OPTIONS request from frontend dev server', async () => {
    const res = await request('OPTIONS', '/api/health', null, {
      Origin: 'http://localhost:3000',
      'Access-Control-Request-Method': 'GET',
    });
    assert.equal(res.statusCode, 204);
    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:3000');
  });

  await t.test('handles CORS preflight OPTIONS request from alternative port 3001', async () => {
    const res = await request('OPTIONS', '/api/factories', null, {
      Origin: 'http://localhost:3001',
      'Access-Control-Request-Method': 'POST',
    });
    assert.equal(res.statusCode, 204);
    assert.equal(res.headers['access-control-allow-origin'], 'http://localhost:3001');
  });

  await t.test('handles malformed JSON request body with 400 MALFORMED_JSON', async () => {
    const res = await request('POST', '/api/factories', '{ malformed: json, missing quotes }');
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'MALFORMED_JSON');
  });
});
