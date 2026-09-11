import mongoose from 'mongoose';
import { Factory } from '../models/Factory.js';
import { FactoryProcessData } from '../models/FactoryProcessData.js';
import { EmissionAnalysis } from '../models/EmissionAnalysis.js';
import { SimulationResult } from '../models/SimulationResult.js';

// In-Memory Storage for zero-downtime offline fallback
const memoryStore = {
  factories: new Map(),
  processData: new Map(),
  emissionAnalyses: new Map(),
  simulations: new Map(),
};

const generateId = () => new mongoose.Types.ObjectId().toString();

const isMongoActive = () => mongoose.connection.readyState === 1;

// 1. Factory Repository
export const FactoryRepository = {
  async create(data) {
    if (isMongoActive()) {
      return await Factory.create(data);
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.factories.set(id, doc);
    return doc;
  },

  async find(filter = {}) {
    if (isMongoActive()) {
      return await Factory.find(filter).sort({ createdAt: -1 });
    }
    const list = Array.from(memoryStore.factories.values());
    if (Object.keys(filter).length === 0) return list.reverse();
    return list.filter((item) => {
      return Object.entries(filter).every(([key, val]) => item[key] === val);
    }).reverse();
  },

  async findById(id) {
    if (isMongoActive()) {
      return await Factory.findById(id);
    }
    return memoryStore.factories.get(id.toString()) || null;
  },

  async findByIdAndUpdate(id, update, options = { new: true }) {
    if (isMongoActive()) {
      return await Factory.findByIdAndUpdate(id, update, options);
    }
    const existing = memoryStore.factories.get(id.toString());
    if (!existing) return null;
    const updated = { ...existing, ...update, updatedAt: new Date() };
    memoryStore.factories.set(id.toString(), updated);
    return updated;
  },

  async deleteMany(filter = {}) {
    if (isMongoActive()) {
      return await Factory.deleteMany(filter);
    }
    if (filter.isSyntheticDemo) {
      for (const [id, doc] of memoryStore.factories.entries()) {
        if (doc.isSyntheticDemo) memoryStore.factories.delete(id);
      }
    } else {
      memoryStore.factories.clear();
    }
    return { acknowledged: true };
  },
};

// 2. Factory Process Data Repository
export const ProcessDataRepository = {
  async create(data) {
    if (isMongoActive()) {
      return await FactoryProcessData.create(data);
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.processData.set(id, doc);
    return doc;
  },

  async findByFactoryId(factoryId) {
    if (isMongoActive()) {
      return await FactoryProcessData.find({ factoryId }).sort({ createdAt: -1 });
    }
    const list = Array.from(memoryStore.processData.values()).filter(
      (p) => p.factoryId.toString() === factoryId.toString()
    );
    return list.reverse();
  },

  async findLatestByFactoryId(factoryId) {
    if (isMongoActive()) {
      return await FactoryProcessData.findOne({ factoryId }).sort({ createdAt: -1 });
    }
    const list = await this.findByFactoryId(factoryId);
    return list.length > 0 ? list[0] : null;
  },

  async deleteMany(filter = {}) {
    if (isMongoActive()) {
      return await FactoryProcessData.deleteMany(filter);
    }
    memoryStore.processData.clear();
    return { acknowledged: true };
  },
};

// 3. Emission Analysis Repository
export const EmissionAnalysisRepository = {
  async create(data) {
    if (isMongoActive()) {
      return await EmissionAnalysis.create(data);
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...data,
      calculatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.emissionAnalyses.set(id, doc);
    return doc;
  },

  async findByFactoryId(factoryId) {
    if (isMongoActive()) {
      return await EmissionAnalysis.find({ factoryId }).sort({ createdAt: -1 });
    }
    const list = Array.from(memoryStore.emissionAnalyses.values()).filter(
      (a) => a.factoryId.toString() === factoryId.toString()
    );
    return list.reverse();
  },

  async findLatestByFactoryId(factoryId) {
    if (isMongoActive()) {
      return await EmissionAnalysis.findOne({ factoryId }).sort({ createdAt: -1 });
    }
    const list = await this.findByFactoryId(factoryId);
    return list.length > 0 ? list[0] : null;
  },

  async deleteMany(filter = {}) {
    if (isMongoActive()) {
      return await EmissionAnalysis.deleteMany(filter);
    }
    memoryStore.emissionAnalyses.clear();
    return { acknowledged: true };
  },
};

// 4. Simulation Result Repository
export const SimulationRepository = {
  async create(data) {
    if (isMongoActive()) {
      return await SimulationResult.create(data);
    }
    const id = generateId();
    const doc = {
      _id: id,
      id,
      ...data,
      createdAt: new Date(),
    };
    memoryStore.simulations.set(id, doc);
    return doc;
  },
};
