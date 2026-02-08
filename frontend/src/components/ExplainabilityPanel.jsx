import React from 'react';
import { AlertTriangle, ShieldCheck, Activity, Info, BarChart3, Leaf, MapPin, Target } from 'lucide-react';

const ExplainabilityPanel = ({ analysisData }) => {
  // Destructuring your prewritten data
  const { 
    riskClassification = {},
    ndvi = {},
    factors = [],
    regionName = 'Unknown Region',
    vegetationLossPercentage = 0,
    areaAffected = 0,
    confidenceScore = 0
  } = analysisData || {};

  const riskLevel = riskClassification?.riskLevel || 'LOW';
  const riskScore = riskClassification?.riskScore || 0;
  const confidence = riskClassification?.confidenceScore || confidenceScore || 0;
  const ndviValue = typeof ndvi === 'number' ? ndvi : (ndvi?.mean || 0);
  const ndviMax = ndvi?.max || 0;
  const ndviMin = ndvi?.min || 0;
  const ndviStdDev = ndvi?.stdDev || 0;

  return (
    <div className="space-y-8">
      {/* 1. Summary Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Activity size={20} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Analysis Summary</h2>
          <span className="text-xs text-slate-400 ml-auto">Region: {regionName}</span>
        </div>
        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-500">
          This region was analyzed for vegetation health and environmental risks. Analysis shows 
          <span className="font-semibold text-slate-900"> {ndviValue.toFixed(3)} NDVI</span>, 
          with <span className="font-semibold text-slate-900">{vegetationLossPercentage.toFixed(1)}%</span> vegetation loss, 
          classified as <span className="font-bold text-orange-600">{riskLevel} RISK</span>.
        </p>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard 
          label="Risk Score" 
          value={`${(riskScore * 100).toFixed(0)}%`}
          icon={<Target className="text-blue-500" size={20} />}
          color="blue"
        />
        <MetricCard 
          label="Vegetation Loss" 
          value={`${vegetationLossPercentage.toFixed(1)}%`}
          icon={<Leaf className="text-rose-500" size={20} />}
          color="rose"
        />
        <MetricCard 
          label="Area Affected" 
          value={`${areaAffected.toFixed(1)} km²`}
          icon={<MapPin className="text-amber-500" size={20} />}
          color="amber"
        />
        <MetricCard 
          label="Confidence" 
          value={`${(confidence * 100).toFixed(0)}%`}
          icon={<ShieldCheck className="text-emerald-500" size={20} />}
          color="emerald"
        />
      </div>

      {/* 3. Detailed NDVI Analysis */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="text-emerald-600" size={24} />
          <h3 className="text-xl font-bold text-slate-800">Vegetation Index (NDVI) Details</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <NDVIMetric 
            label="Mean NDVI" 
            value={ndviValue.toFixed(3)} 
            color="text-slate-900"
            desc="Average vegetation health across the region"
          />
          <NDVIMetric 
            label="Max NDVI" 
            value={ndviMax.toFixed(3)} 
            color="text-emerald-600"
            desc="Healthiest vegetation points"
          />
          <NDVIMetric 
            label="Min NDVI" 
            value={ndviMin.toFixed(3)} 
            color="text-rose-600"
            desc="Lowest health points in region"
          />
          <NDVIMetric 
            label="Variation (Std Dev)" 
            value={ndviStdDev.toFixed(3)} 
            color="text-amber-600"
            desc="Consistency of vegetation health"
          />
        </div>
      </div>

      {/* 4. Confidence Gauge */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-800">Detection Confidence</h3>
          <span className="text-3xl font-bold text-indigo-600">{(confidence * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4">
          <div 
            className="bg-indigo-600 h-4 rounded-full transition-all duration-1000" 
            style={{ width: `${confidence * 100}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-500 mt-3">This indicates the reliability and accuracy of the analysis based on image quality and model certainty.</p>
      </div>

      {/* 5. Key Factors */}
      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Info size={20} className="text-slate-600" />
          <h3 className="text-lg font-bold text-slate-800">Key Analysis Factors</h3>
        </div>
        
        <div className="space-y-3">
          <FactorRow 
            label="Vegetation Health Index (NDVI)" 
            value={ndviValue.toFixed(3)}
            status="normal"
            description="Measure of vegetation density and health"
          />
          <FactorRow 
            label="Risk Assessment Level" 
            value={riskLevel}
            status={riskLevel.toLowerCase()}
            description="Overall threat level for this region"
          />
          <FactorRow 
            label="Vegetation Loss Detected" 
            value={`${vegetationLossPercentage.toFixed(1)}%`}
            status={vegetationLossPercentage > 5 ? 'high' : 'low'}
            description="Percentage of green canopy that has thinned"
          />
          <FactorRow 
            label="Area of Concern" 
            value={`${areaAffected.toFixed(1)} km²`}
            status="normal"
            description="Physical ground area showing vegetation changes"
          />
          <FactorRow 
            label="Analysis Reliability" 
            value={`${(confidence * 100).toFixed(0)}%`}
            status={confidence > 0.8 ? 'high' : 'normal'}
            description="Accuracy and confidence of the detection"
          />
        </div>
      </div>

      {/* 6. Recommended Actions */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 text-white shadow-sm">
        <h3 className="flex items-center gap-2 font-bold mb-6 text-lg text-indigo-200">
          <ShieldCheck size={20} /> Recommended Actions
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <li className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
            <span className="text-indigo-300 font-bold mt-0.5">•</span>
            <span>Conduct field verification of the flagged region to confirm satellite findings</span>
          </li>
          <li className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
            <span className="text-indigo-300 font-bold mt-0.5">•</span>
            <span>Obtain high-resolution imagery from the area for detailed analysis</span>
          </li>
          <li className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
            <span className="text-indigo-300 font-bold mt-0.5">•</span>
            <span>Investigate potential causes (fire, drought, deforestation, disease)</span>
          </li>
          <li className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
            <span className="text-indigo-300 font-bold mt-0.5">•</span>
            <span>Develop and implement intervention and restoration strategies</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

function MetricCard({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}

function NDVIMetric({ label, value, color, desc }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-2xl font-bold ${color} mb-2`}>{value}</p>
      <p className="text-xs text-slate-600 leading-snug">{desc}</p>
    </div>
  );
}

function FactorRow({ label, value, status, description }) {
  const statusColors = {
    high: 'text-rose-600 bg-rose-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-emerald-600 bg-emerald-50',
    normal: 'text-slate-600 bg-slate-50'
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
      <div>
        <p className="font-semibold text-slate-700">{label}</p>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      </div>
      <div className={`px-4 py-2 rounded-lg font-bold text-sm ${statusColors[status]}`}>
        {value}
      </div>
    </div>
  );
}

export { ExplainabilityPanel };
export default ExplainabilityPanel;