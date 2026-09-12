import React from 'react';
import { Cpu, Sparkles, ShieldCheck, AlertCircle, Info, BarChart3, Activity, Layers } from 'lucide-react';

/**
 * Format a decimal or percentage number into a readable percentage string
 */
function formatPercent(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0.00%';
  // If already in 0-100 range, format directly; if in 0-1 range, multiply by 100
  const normalized = value <= 1.0 ? value * 100 : value;
  return `${normalized.toFixed(2)}%`;
}

/**
 * Format raw feature key into clean title case
 */
function formatFeatureName(name) {
  if (!name) return 'Feature';
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const MLInsightsSection = ({ mlInsights, loading = false }) => {
  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl animate-pulse">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="h-4 w-48 bg-slate-200 animate-pulse rounded" />
            <div className="h-3 w-64 bg-slate-100 animate-pulse rounded mt-1.5" />
          </div>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-medium animate-pulse">
            Analyzing factory characteristics...
          </p>
        </div>
      </div>
    );
  }

  // Unavailable / Offline State
  if (!mlInsights || mlInsights.available === false || mlInsights.status === 'UNAVAILABLE') {
    return (
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-slate-800 shadow-sm">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              ML Recommendation Service Status
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              ML recommendation service unavailable. Showing deterministic recommendations based on verified GHG Protocol and emission hotspot diagnostics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const topInterventions = mlInsights.topInterventions || [];
  const keyFeatures = mlInsights.keyDrivingFeatures || [];
  const confidenceScore = mlInsights.confidenceScore ?? 0;
  const rawConfidence = (mlInsights.confidence || 'medium').toLowerCase();
  const isLowConfidence = rawConfidence === 'low' || mlInsights.status === 'LOW_CONFIDENCE';

  // Empty data / No top interventions
  if (topInterventions.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-slate-700 shadow-sm">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-slate-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Intervention Ranking Notice
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Additional factory data is required to generate an ML intervention ranking. Showing deterministic recommendations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Confidence styling
  let confidenceBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let confidenceLabel = 'High Confidence';
  if (rawConfidence === 'medium') {
    confidenceBadgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    confidenceLabel = 'Medium Confidence';
  } else if (rawConfidence === 'low') {
    confidenceBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
    confidenceLabel = 'Low Confidence';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden transition-all duration-300">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 border-b border-indigo-900/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/20 ring-1 ring-indigo-400/30 text-indigo-300 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold tracking-tight text-white">
                  ML Intervention Ranking
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 ring-1 ring-indigo-400/40 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> Live Inference
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-class probability ranking of circular economy interventions tailored to this factory's operational telemetry.
              </p>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-medium">Prediction Confidence</span>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${confidenceBadgeClass}`}>
                  <ShieldCheck className="w-3 h-3" />
                  {confidenceLabel}
                </span>
                <span className="text-xs font-extrabold text-white bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                  {formatPercent(confidenceScore)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low confidence advisory alert */}
      {isLowConfidence && (
        <div className="px-6 py-3 bg-amber-50/80 border-b border-amber-200/80 text-amber-900 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="font-medium">
            ML confidence is low. Showing deterministic recommendations based on emission and hotspot analysis.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6 space-y-6">
        
        {/* TOP 3 RECOMMENDED INTERVENTIONS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Top 3 Recommended Interventions
            </h4>
            <span className="text-[11px] font-medium text-slate-400">
              Ranked by Random Forest Class Probability
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topInterventions.slice(0, 3).map((item, idx) => {
              const rank = item.rank || idx + 1;
              const pctFormatted = formatPercent(item.score);
              const rawPct = (item.score <= 1.0 ? item.score * 100 : item.score);

              // Distinct card tint per rank
              let rankStyle = {
                badge: 'bg-indigo-600 text-white',
                border: 'border-indigo-200 bg-indigo-50/30',
                bar: 'bg-indigo-600',
                text: 'text-indigo-950',
              };
              if (rank === 2) {
                rankStyle = {
                  badge: 'bg-emerald-600 text-white',
                  border: 'border-emerald-200 bg-emerald-50/30',
                  bar: 'bg-emerald-600',
                  text: 'text-emerald-950',
                };
              } else if (rank === 3) {
                rankStyle = {
                  badge: 'bg-teal-600 text-white',
                  border: 'border-teal-200 bg-teal-50/30',
                  bar: 'bg-teal-600',
                  text: 'text-teal-950',
                };
              }

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${rankStyle.border} shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${rankStyle.badge}`}>
                      Rank {rank}
                    </span>
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">
                      {pctFormatted}
                    </span>
                  </div>

                  <div>
                    <h5 className={`text-sm font-bold leading-tight ${rankStyle.text}`}>
                      {item.category}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {rank === 1
                        ? 'Highest suitability intervention for current operational profile'
                        : rank === 2
                        ? 'Secondary high-impact circular pathway'
                        : 'Complementary closed-loop process alternative'}
                    </p>
                  </div>

                  {/* Progress probability meter */}
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${rankStyle.bar} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(100, Math.max(8, rawPct))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* WHY THE MODEL RECOMMENDED IT (EXPLAINABILITY) */}
        {keyFeatures.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-600" />
                Why the model selected these interventions
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">
                Gini Feature Importance Analysis
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {keyFeatures.map((kf, idx) => {
                const impPercent = typeof kf.importance === 'number'
                  ? `${(kf.importance * 100).toFixed(1)}% weight`
                  : 'Key Driver';
                return (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {formatFeatureName(kf.feature)}
                      </span>
                      <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {impPercent}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {kf.contribution || 'High operational driver in model decision'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODEL INFORMATION FOOTER */}
        <div className="pt-4 border-t border-slate-200/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">Model:</span>
              <span className="font-semibold text-slate-800">{mlInsights.model || 'EcoForge Circular Random Forest Classifier'}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-600">Version:</span>
              <span className="font-semibold text-slate-800">{mlInsights.version || '1.0.0'}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-slate-600">Algorithm:</span>
              <span className="font-semibold text-slate-800">Random Forest Classifier</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 max-w-lg">
            <span>Prototype disclosure: Trained on synthetic industrial dataset (98% Top-1 accuracy on unseen synthetic test split); production deployment requires real-world industrial validation data.</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default MLInsightsSection;
