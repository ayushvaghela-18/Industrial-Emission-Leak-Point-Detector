export const INITIAL_FACTORIES = [
  {
    id: "fac-001",
    name: "Apex Steel Fabrication & Forging",
    industry: "Metal Processing & Metallurgy",
    location: "Ohio, USA",
    size: "Medium Enterprise (450 Employees)",
    annualProduction: "85,000 Tonnes Steel Components",
    operationalData: {
      electricityKw: 14500000, // 14.5 GWh
      electricitySource: "Grid (Coal/Gas heavy mix)",
      dieselLiters: 480000, // 480k L/yr
      coalTonnes: 1200,
      naturalGasM3: 650000,
      renewablePct: 12,
      rawMaterialType: "Virgin Structural Steel Billets",
      rawMaterialQuantityTonnes: 92000,
      recycledMaterialPct: 8,
      wasteGeneratedTonnes: 14500,
      wasteRecycledPct: 35,
      transportDistanceKm: 185000,
    },
    metrics: {
      totalEmissionsTonnes: 18450,
      carbonIntensity: "0.217 tCO2e / tonne product",
      potentialCo2Reduction: 5920,
      potentialAnnualSavings: 384000,
      sustainabilityScore: 42,
    },
    breakdown: [
      { category: "Electricity Consumption", amount: 7032, pct: 38.1, color: "#0B3D2E", scope: "Scope 2" },
      { category: "Diesel Process Heating", amount: 4981, pct: 27.0, color: "#DC2626", scope: "Scope 1" },
      { category: "Virgin Raw Material Sourcing", amount: 3874, pct: 21.0, color: "#F59E0B", scope: "Scope 3" },
      { category: "Logistics & Transport", amount: 1845, pct: 10.0, color: "#0F766E", scope: "Scope 3" },
      { category: "Solid & Hazardous Waste", amount: 718, pct: 3.9, color: "#64748B", scope: "Scope 1 & 3" }
    ],
    hotspots: [
      {
        id: "hot-01",
        title: "Diesel Heavy Furnace Process Heating",
        severity: "CRITICAL",
        category: "Diesel Process Heating",
        contributionPct: 27.0,
        annualEmissions: 4981,
        unit: "tCO2e/yr",
        rootCause: "High-volume direct burning of diesel fuel in non-heat-recovered forging furnaces.",
        impactAnalysis: "Accounts for over a quarter of total facility carbon output and major local particulate matter emissions.",
        primaryIntervention: "Electric Arc Furnace Conversion & Waste Heat Recovery Loop",
        potentialCo2Savings: 3120,
        potentialCostSavings: 210000
      },
      {
        id: "hot-02",
        title: "Grid Power Mix Carbon Intensity",
        severity: "HIGH",
        category: "Electricity Consumption",
        contributionPct: 38.1,
        annualEmissions: 7032,
        unit: "tCO2e/yr",
        rootCause: "Heavy reliance on regional fossil-fueled grid power without dedicated PPA or rooftop solar offset.",
        impactAnalysis: "Largest single emission cost, highly vulnerable to tightening carbon taxes.",
        primaryIntervention: "On-site Rooftop Solar PV & Corporate Renewable PPA Procurement",
        potentialCo2Savings: 2150,
        potentialCostSavings: 115000
      },
      {
        id: "hot-03",
        title: "Virgin Steel Billet Material Extraction",
        severity: "MEDIUM",
        category: "Virgin Raw Material Sourcing",
        contributionPct: 21.0,
        annualEmissions: 3874,
        unit: "tCO2e/yr",
        rootCause: "Low circular scrap metal input (only 8% recycled feed stock).",
        impactAnalysis: "Embodied Scope 3 emissions from blast furnace iron ore smelting.",
        primaryIntervention: "Closed-Loop Metal Scrap Integration with Local Recyclers",
        potentialCo2Savings: 650,
        potentialCostSavings: 59000
      }
    ],
    recommendations: [
      {
        id: "rec-01",
        title: "Closed-Loop Scrap Scrap Recycling Integration",
        category: "Circular Materials",
        hotspotId: "hot-03",
        priority: "HIGH",
        feasibility: "High (88%)",
        feasibilityScore: 88,
        whyRecommended: "Increases secondary scrap metal usage in billet manufacturing, cutting Scope 3 upstream mining emissions drastically.",
        currentSituation: "8% recycled material usage in production feedstock.",
        proposedIntervention: "Establish direct buyback agreement with tier-1 industrial clients to re-melt off-cuts and secondary scrap up to 35% mix.",
        co2ReductionTonnes: 1420,
        co2ReductionPct: 36.6,
        annualSavingsUSD: 125000,
        implementationCostUSD: 180000,
        paybackPeriodYears: 1.44,
        steps: [
          "Establish scrap quality verification protocols",
          "Modify furnace batch charging ratios",
          "Partner with regional metal collection network"
        ]
      },
      {
        id: "rec-02",
        title: "Waste Heat Recovery System for Forging Lines",
        category: "Energy Efficiency",
        hotspotId: "hot-01",
        priority: "CRITICAL",
        feasibility: "High (92%)",
        feasibilityScore: 92,
        whyRecommended: "Captures 450°C stack exhaust heat to preheat combustion air and boiler feed water.",
        currentSituation: "Exhaust gases vented directly into atmosphere without heat exchange.",
        proposedIntervention: "Install cross-flow metallic recuperators on exhaust flues of furnaces #1 through #4.",
        co2ReductionTonnes: 2850,
        co2ReductionPct: 57.2,
        annualSavingsUSD: 195000,
        implementationCostUSD: 240000,
        paybackPeriodYears: 1.23,
        steps: [
          "Engineering heat balance survey",
          "Install metallic recuperator units",
          "Integrate automated temperature feedback controls"
        ]
      },
      {
        id: "rec-03",
        title: "2.5 MW Rooftop Solar PV & Clean PPA",
        category: "Renewable Energy",
        hotspotId: "hot-02",
        priority: "MEDIUM",
        feasibility: "Medium (78%)",
        feasibilityScore: 78,
        whyRecommended: "Replaces high-carbon grid peak electricity with zero-carbon solar generation.",
        currentSituation: "12% clean energy share (passive grid renewables).",
        proposedIntervention: "Utilize 18,000 m² factory rooftop for solar panel deployment + virtual PPA for remaining load.",
        co2ReductionTonnes: 1650,
        co2ReductionPct: 23.4,
        annualSavingsUSD: 64000,
        implementationCostUSD: 310000,
        paybackPeriodYears: 4.84,
        steps: [
          "Structural roof weight audit",
          "PPA developer bidding",
          "Grid interconnection approval"
        ]
      }
    ]
  },
  {
    id: "fac-002",
    name: "Verdant Eco-Textile Processing Plant",
    industry: "Textiles & Synthetic Fabrics",
    location: "North Carolina, USA",
    size: "Small Enterprise (180 Employees)",
    annualProduction: "4,200 Tonnes Dyed Fabric",
    operationalData: {
      electricityKw: 5800000,
      electricitySource: "Regional Grid",
      dieselLiters: 95000,
      coalTonnes: 0,
      naturalGasM3: 420000,
      renewablePct: 25,
      rawMaterialType: "Virgin Polyester & Conventional Cotton",
      rawMaterialQuantityTonnes: 4500,
      recycledMaterialPct: 15,
      wasteGeneratedTonnes: 850,
      wasteRecycledPct: 40,
      transportDistanceKm: 75000,
    },
    metrics: {
      totalEmissionsTonnes: 8920,
      carbonIntensity: "2.12 tCO2e / tonne fabric",
      potentialCo2Reduction: 2950,
      potentialAnnualSavings: 182000,
      sustainabilityScore: 58,
    },
    breakdown: [
      { category: "Natural Gas Thermal Boilers", amount: 3568, pct: 40.0, color: "#DC2626", scope: "Scope 1" },
      { category: "Electricity Consumption", amount: 2676, pct: 30.0, color: "#0B3D2E", scope: "Scope 2" },
      { category: "Virgin Synthetic Fiber Raw Materials", amount: 1784, pct: 20.0, color: "#F59E0B", scope: "Scope 3" },
      { category: "Wastewater Sludge & Effluent", amount: 535, pct: 6.0, color: "#0F766E", scope: "Scope 1 & 3" },
      { category: "Logistics", amount: 357, pct: 4.0, color: "#64748B", scope: "Scope 3" }
    ],
    hotspots: [
      {
        id: "hot-201",
        title: "Gas Steam Boilers for Fabric Dyeing",
        severity: "CRITICAL",
        category: "Natural Gas Thermal Boilers",
        contributionPct: 40.0,
        annualEmissions: 3568,
        unit: "tCO2e/yr",
        rootCause: "Low-efficiency thermal steam generation for high-temperature chemical dyeing baths.",
        impactAnalysis: "Dominates thermal energy footprint with heavy flue heat losses.",
        primaryIntervention: "Industrial Heat Pump & Wastewater Heat Recovery Unit",
        potentialCo2Savings: 1850,
        potentialCostSavings: 110000
      }
    ],
    recommendations: [
      {
        id: "rec-201",
        title: "Effluent Heat Recovery & High-Temp Heat Pump",
        category: "Thermal Decarbonization",
        hotspotId: "hot-201",
        priority: "CRITICAL",
        feasibility: "High (90%)",
        feasibilityScore: 90,
        whyRecommended: "Recovers thermal energy from hot 70°C wastewater effluent stream to preheat incoming water.",
        currentSituation: "Wastewater discharged into cooling ponds without energy capture.",
        proposedIntervention: "Install shell-and-tube heat exchangers and 500kW industrial heat pump.",
        co2ReductionTonnes: 1850,
        co2ReductionPct: 51.8,
        annualSavingsUSD: 110000,
        implementationCostUSD: 145000,
        paybackPeriodYears: 1.31,
        steps: [
          "Filtration skid integration",
          "Heat pump installation",
          "Dye house piping loop tie-in"
        ]
      }
    ]
  }
];

export const MOCK_AI_SUGGESTED_QUESTIONS = [
  "Why is diesel my largest emission source?",
  "What intervention has the fastest financial payback?",
  "How much CO2 can I reduce by switching to 40% recycled feedstock?",
  "What is the total implementation cost for all critical recommendations?",
  "How does my facility sustainability score compare to industry benchmark?"
];

export const MOCK_AI_KNOWLEDGE_BASE = {
  "diesel": "Based on your calculated emission breakdown, Diesel Process Heating accounts for 27.0% (4,981 tCO2e/yr) of total emissions due to high-volume direct burning in non-heat-recovered forging furnaces. Implementing the recommended Waste Heat Recovery System will cut diesel CO2 by 57.2% and save $195,000 annually.",
  "payback": "The recommendation with the fastest payback is the 'Waste Heat Recovery System for Forging Lines' with a payback period of only 1.23 years (15 months), yielding $195,000 annual savings for an upfront investment of $240,000.",
  "recycled": "Increasing your recycled material feedstock ratio from 8% to 40% will reduce Scope 3 raw material emissions by approximately 1,420 tCO2e annually and decrease raw billet procurement expenses by $125,000/yr.",
  "cost": "Implementing all top 3 circular recommendations requires an estimated total capital investment of $730,000 ($240k heat recovery + $180k circular scrap + $310k solar), generating $384,000 in net annual operational savings with an average payback of 1.9 years.",
  "benchmark": "Your facility currently scores 42/100 on the EcoForge Sustainability Index. Implementing the prioritized top 3 recommendations will boost your score to 74/100, placing your facility in the top 15th percentile of decarbonized metal processing plants."
};
