import React from 'react';
import { 
  BarChart3, GitCompare, Shield
} from 'lucide-react';

export function HealthMetricsPanel({ analysis }) {
  if (!analysis) return null;

  const confidenceScore = (analysis.confidenceScore || 0.92) * 100;

  return (
    <div className="space-y-3 animate-in fade-in duration-700">

      {/* SITE QUALITY & PIXEL ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Site Quality */}
        <div className="rounded-[2.5rem] p-10 border border-slate-100 bg-white shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-600" /> Site Quality
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-700">Image Clarity</span>
                <span className="text-3xl font-black text-blue-600 tracking-tighter">92.7%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="w-[92.7%] h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-700">Pixel Quality</span>
                <span className="text-3xl font-black text-indigo-600 tracking-tighter">88.4%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="w-[88.4%] h-full bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.3)]"></div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                High-quality satellite imagery ensures accurate vegetation health assessment and reliable trend analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Pixel Change Analysis */}
        <div className="rounded-[2.5rem] p-10 border border-slate-100 bg-white shadow-sm">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <GitCompare size={16} className="text-purple-600" /> Pixel Change Analysis
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 rounded-[1.5rem] border border-emerald-100 text-center">
                <p className="text-3xl font-black text-emerald-600 tracking-tighter">45.2%</p>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-2">Stable Pixels</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-[1.5rem] border border-amber-100 text-center">
                <p className="text-3xl font-black text-amber-600 tracking-tighter">32.1%</p>
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-2">Changed Pixels</p>
              </div>
              <div className="p-4 bg-rose-50 rounded-[1.5rem] border border-rose-100 text-center">
                <p className="text-3xl font-black text-rose-600 tracking-tighter">22.7%</p>
                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mt-2">Degraded Pixels</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                Distribution of pixel-level changes showing vegetation stability, natural changes, and degradation patterns.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYSIS CONFIDENCE */}
      <div className="rounded-[2.5rem] p-10 border border-slate-100 bg-white shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Shield size={16} className="text-green-600" /> Analysis Confidence
            </h3>
            <p className="text-sm text-slate-600 font-medium mb-4">
              Reliability Score for this analysis based on model certainty and data quality metrics.
            </p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-700">Overall Reliability</span>
                  <span className={`text-2xl font-black tracking-tighter ${
                    confidenceScore >= 85 ? 'text-emerald-600' : 
                    confidenceScore >= 70 ? 'text-amber-600' : 
                    'text-rose-600'
                  }`}>{confidenceScore.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${
                      confidenceScore >= 85 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 
                      confidenceScore >= 70 ? 'bg-amber-500 shadow-[0_0_12px_rgba(251,146,60,0.3)]' : 
                      'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    }`}
                    style={{ width: `${confidenceScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="ml-4 text-right">
            <div className={`text-6xl font-black tracking-tighter mb-2 ${
              confidenceScore >= 85 ? 'text-emerald-600' : 
              confidenceScore >= 70 ? 'text-amber-600' : 
              'text-rose-600'
            }`}>
              {confidenceScore >= 85 ? '✓' : confidenceScore >= 70 ? '◐' : '!'}
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {confidenceScore >= 85 ? 'Highly Reliable' : 
               confidenceScore >= 70 ? 'Moderate Confidence' : 
               'Low Confidence'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
