import assert from 'node:assert/strict';
import test from 'node:test';
import { EmissionCalculator } from '../src/services/emissions/emissionCalculator.js';
import { HotspotDetector } from '../src/services/emissions/hotspotDetector.js';
import { SimulationService } from '../src/services/emissions/simulationService.js';
import { HOTSPOT_SEVERITY } from '../src/constants/index.js';
import app from '../src/app.js';
import { FactoryRepository } from '../src/utils/repository.js';

test('=== 1. Deterministic Emission Calculation Engine ===', async (t) => {
  await t.test('calculates accurate emissions for energy, materials, waste, and logistics', () => {
    const processData = {
      energy: {
        gridElectricityKwh: 10000,    // 10000 * 0.82 = 8200 kg CO2e
        renewableElectricityKwh: 2000,// 2000 * 0.015 = 30 kg CO2e
        dieselLiters: 1000,           // 1000 * 2.68 = 2680 kg CO2e
        coalKg: 5000,                 // 5000 * 2.42 = 12100 kg CO2e
        naturalGasM3: 1000,           // 1000 * 2.03 = 2030 kg CO2e
      },
      materials: {
        materialType: 'cotton',
        rawMaterialKg: 10000,
        virginMaterialPercentage: 80, // 8000 kg * 5.5 = 44000 kg CO2e
        recycledMaterialPercentage: 20,// 2000 kg * 1.2 = 2400 kg CO2e
      },
      waste: {
        wasteGeneratedKg: 1000,
        wasteLandfillPercentage: 100, // 1000 * 0.58 = 580 kg CO2e
        wasteRecycledPercentage: 0,
      },
      logistics: {
        transportTkm: 10000,          // 10000 * 0.105 = 1050 kg CO2e
      },
      production: {
        productionVolumeUnits: 50000,
        productionUnit: 'meters',
      },
    };

    const result = EmissionCalculator.calculate(processData);

    // Expected total kg = 8200 + 30 + 2680 + 12100 + 2030 + 44000 + 2400 + 580 + 1050 = 73070 kg CO2e
    const expectedTotalKg = 73070;
    assert.equal(result.totalEmissionsKgCO2e, expectedTotalKg);
    assert.equal(result.totalEmissionsTonsCO2e, 73.07);

    // Verify categories sum to total
    const sumCategories = result.categories.reduce((acc, c) => acc + c.emissionsKgCO2e, 0);
    assert.equal(Math.round(sumCategories), expectedTotalKg);

    // Verify category percentages sum to 100%
    const sumPercentages = result.categories.reduce((acc, c) => acc + c.percentage, 0);
    assert.ok(Math.abs(sumPercentages - 100) < 0.2);

    // Verify production intensity
    assert.equal(result.baselineMetrics.productionUnit, 'meters');
    assert.ok(result.baselineMetrics.emissionIntensityPerUnit > 0);
  });
});

test('=== 2. Deterministic Hotspot Ranking & Severity ===', async (t) => {
  await t.test('ranks leak points in descending order and assigns correct severity', () => {
    const processData = {
      energy: {
        gridElectricityKwh: 100000, // 82000 kg
        dieselLiters: 1000,         // 2680 kg
      },
      materials: {
        materialType: 'cotton',
        rawMaterialKg: 1000,
        virginMaterialPercentage: 100, // 5500 kg
      },
    };

    const calculation = EmissionCalculator.calculate(processData);
    const hotspots = HotspotDetector.detectHotspots(
      calculation.sources,
      calculation.totalEmissionsKgCO2e
    );

    assert.ok(hotspots.length > 0);
    assert.equal(hotspots[0].rank, 1);
    assert.equal(hotspots[0].source, 'Grid Electricity');
    assert.equal(hotspots[0].severity, HOTSPOT_SEVERITY.CRITICAL);
    assert.ok(hotspots[0].percentage >= 30);
    assert.ok(hotspots[0].explanation.includes('Grid electricity constitutes'));
    assert.ok(hotspots[0].reductionPotentialEstimate.potentialTonsReduction > 0);
  });
});

test('=== 3. What-If Simulation Engine ===', async (t) => {
  await t.test('models operational changes and computes CO2 and cost reduction', () => {
    const baseline = {
      energy: {
        gridElectricityKwh: 500000, // 500,000 * 0.82 = 410,000 kg CO2e
        renewableElectricityKwh: 0,
      },
      materials: {
        materialType: 'steel',
        rawMaterialKg: 200000,
        virginMaterialPercentage: 100, // 200,000 * 2.3 = 460,000 kg CO2e
        recycledMaterialPercentage: 0,
      },
    };

    const scenarioChanges = {
      renewableEnergyPercentage: 80, // 80% solar/wind
      recycledMaterialPercentage: 50, // 50% recycled steel
    };

    const simulation = SimulationService.simulate(baseline, scenarioChanges);

    assert.ok(simulation.impact.co2ReductionTons > 0);
    assert.ok(simulation.impact.percentageReduction > 0);
    assert.ok(simulation.projected.totalEmissionsTonsCO2e < simulation.baseline.totalEmissionsTonsCO2e);
    assert.ok(simulation.impact.categoryComparison.length > 0);
    assert.ok(simulation.disclaimer.length > 0);
  });
});

test('=== 4. REST API Endpoint Integration ===', async (t) => {
  // Helper to make mock requests using Node http against express app
  const request = (method, url, body = null) => {
    return new Promise((resolve, reject) => {
      const server = app.listen(0, () => {
        const port = server.address().port;
        const reqOptions = {
          hostname: '127.0.0.1',
          port,
          path: url,
          method,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        import('node:http').then(({ default: http }) => {
          const req = http.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
              server.close();
              resolve({
                statusCode: res.statusCode,
                body: data ? JSON.parse(data) : null,
              });
            });
          });

          req.on('error', (err) => {
            server.close();
            reject(err);
          });

          if (body) {
            req.write(JSON.stringify(body));
          }
          req.end();
        });
      });
    });
  };

  await t.test('GET /api/health returns healthy and database mode', async () => {
    const res = await request('GET', '/api/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'healthy');
    assert.ok(res.body.database);
  });

  await t.test('POST /api/factories/seed creates synthetic demo factories', async () => {
    const res = await request('POST', '/api/factories/seed');
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 3);
    assert.ok(res.body.data[0].totalEmissionsTonsCO2e > 0);
  });

  await t.test('GET /api/factories lists seeded factories', async () => {
    const res = await request('GET', '/api/factories');
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
  });

  await t.test('POST /api/emissions/analyze calculates footprint and hotspots', async () => {
    const payload = {
      energy: {
        gridElectricityKwh: 250000,
        dieselLiters: 5000,
      },
      materials: {
        materialType: 'cotton',
        rawMaterialKg: 40000,
        virginMaterialPercentage: 90,
        recycledMaterialPercentage: 10,
      },
    };

    const res = await request('POST', '/api/emissions/analyze', payload);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.totalEmissionsTonsCO2e > 0);
    assert.ok(res.body.data.hotspots.length > 0);
  });

  await t.test('POST /api/simulation executes what-if scenario', async () => {
    const payload = {
      processData: {
        energy: { gridElectricityKwh: 100000 },
      },
      scenarioChanges: {
        renewableEnergyPercentage: 50,
      },
    };

    const res = await request('POST', '/api/simulation', payload);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.impact.co2ReductionTons > 0);
  });

  await t.test('POST /api/factories rejects invalid factory name', async () => {
    const payload = { name: '', industryType: 'Textile' };
    const res = await request('POST', '/api/factories', payload);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.errorCode, 'INVALID_FACTORY_NAME');
  });

  await t.test('POST /api/emissions/analyze rejects invalid percentages', async () => {
    const payload = {
      materials: {
        virginMaterialPercentage: 80,
        recycledMaterialPercentage: 30, // Sum 110 > 100
      },
    };
    const res = await request('POST', '/api/emissions/analyze', payload);
    assert.equal(res.statusCode, 422);
    assert.equal(res.body.success, false);
  });
});
