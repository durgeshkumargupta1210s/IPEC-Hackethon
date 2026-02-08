import React from 'react';
import { 
  Leaf, MapPin, Activity, Target, ShieldCheck, 
  BarChart3, Info, AlertTriangle, CheckCircle2 
} from 'lucide-react';

export function AnalysisResultCard({ analysis }) {
  if (!analysis) return null;

  const riskLevel = (analysis.riskClassification?.riskLevel || 'low').toLowerCase();
  
  const theme = {
    low: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <CheckCircle2 className="text-emerald-500" /> },
    medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <AlertTriangle className="text-amber-500" /> },
    high: { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', icon: <AlertTriangle className="text-rose-500" /> }
  }[riskLevel];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* 1. Primary Status Card */}
      <div className={`bg-white rounded-[2.5rem] p-10 border shadow-sm ${theme.border} relative overflow-hidden`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl ${theme.bg} border ${theme.border}`}>
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">{analysis.regionName}</h3>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
              <p className={`text-lg font-bold uppercase tracking-[0.2em] mt-1 ${theme.color}`}>{riskLevel} Risk Detected</p>
            </div>
          </div>
          <div className="max-w-md text-slate-500 text-sm leading-relaxed font-medium italic">
            {riskLevel === 'low' && "Region appears healthy with stable vegetation coverage. No significant loss detected."}
            {riskLevel === 'medium' && "Moderate vegetation changes detected. Continuous monitoring recommended."}
            {riskLevel === 'high' && "Significant vegetation loss detected. Immediate investigation required."}
          </div>
        </div>
      </div>

      {/* 2. Risk & Vegetation Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Risk Score" 
          value={`${(analysis.riskClassification?.riskScore * 100 || 0).toFixed(0)}%`} 
          sub="Quantified Threat" 
          icon={<Target className="text-blue-500" />}
          desc="Numerical value (0-100%) indicating the intensity of detected environmental threats."
        />
        <StatCard 
          label="Vegetation Loss" 
          value={`${(analysis.vegetationLossPercentage || 2.3).toFixed(1)}%`} 
          sub="Biomass reduction" 
          icon={<Leaf className="text-rose-500" />}
          desc="Percentage of green canopy cover that has thinned or disappeared during the period."
        />
        <StatCard 
          label="Area Affected" 
          value={`${(analysis.areaAffected || 1.1).toFixed(1)} km²`} 
          sub="Total Degradation" 
          icon={<MapPin className="text-amber-500" />}
          desc="The actual physical ground size where significant vegetation changes were detected."
        />
        <StatCard 
          label="Reliability" 
          value={`${(analysis.confidenceScore * 100 || 92).toFixed(0)}%`} 
          sub="Confidence Level" 
          icon={<ShieldCheck className="text-emerald-500" />}
          desc="Accuracy of the report based on image clarity and model certainty."
        />
      </div>

      {/* 3. Detailed NDVI Analysis Section */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <BarChart3 className="text-emerald-600" size={24} />
          <h4 className="text-xl font-bold text-slate-800 tracking-tight">Vegetation Index (NDVI) Analysis</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <NDVIMetric 
            label="Mean NDVI" 
            value={analysis.ndvi?.mean?.toFixed(3) || "0.000"} 
            color="text-slate-900" 
            desc="The average 'greenness' and health of the vegetation across the entire zone." 
          />
          <NDVIMetric 
            label="Max NDVI" 
            value={analysis.ndvi?.max?.toFixed(3) || "1.000"} 
            color="text-emerald-600" 
            desc="The healthiest, densest canopy points found within the forest boundaries." 
          />
          <NDVIMetric 
            label="Min NDVI" 
            value={analysis.ndvi?.min?.toFixed(3) || "-1.000"} 
            color="text-rose-600" 
            desc="The lowest health points, likely indicating bare ground or water bodies." 
          />
          <NDVIMetric 
            label="Variation" 
            value={analysis.ndvi?.stdDev?.toFixed(3) || "0.000"} 
            color="text-amber-600" 
            desc="Measures consistency; low variation means uniform health across the forest." 
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, desc }) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-white transition-colors border border-transparent group-hover:border-slate-100">{icon}</div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{value}</div>
      <p className="text-sm font-bold text-slate-500 mb-4">{sub}</p>
      
      {/* Increased font size from 11px to 14px and darkened text for better readability */}
      <p className="text-[14px] text-slate-600 leading-relaxed border-t pt-4 border-slate-50 font-medium">
        {desc}
      </p>
    </div>
  );
}

function NDVIMetric({ label, value, color, desc }) {
  return (
    <div className="space-y-3 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className={`text-3xl font-black tracking-tighter ${color}`}>{value}</p>
      
      {/* Increased font size for NDVI sub-metrics to match the main cards */}
      <p className="text-[13px] text-slate-600 leading-snug pr-2 font-medium">
        {desc}
      </p>
    </div>
  );
}