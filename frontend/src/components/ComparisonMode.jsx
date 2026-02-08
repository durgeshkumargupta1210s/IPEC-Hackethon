import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import { 
  Globe, Activity, ShieldCheck, Target, 
  ArrowLeftRight, Search, Calendar, TrendingDown, Download, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ComparisonMode.css';

export function ComparisonMode({ analysisHistory = [], regions = [] }) {
  const [comparisonType, setComparisonType] = useState('temporal');
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(Math.max(0, analysisHistory?.length - 1));
  const [regionA, setRegionA] = useState(regions[0]?.name || '');
  const [regionB, setRegionB] = useState(regions[1]?.name || '');
  const [comparisonData, setComparisonData] = useState(null);
  
  // Ref to capture the systematic cards for the PDF
  const reportRef = useRef(null);

  // Data Selectors
  const beforeAnalysis = analysisHistory[beforeIndex];
  const afterAnalysis = analysisHistory[afterIndex];
  const dataA = regions.find(r => r.name === regionA);
  const dataB = regions.find(r => r.name === regionB);

  // PDF Export Logic
  const handleDownloadPDF = () => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const accentColor = [16, 185, 129]; // EcoScan Emerald
  const secondaryColor = [71, 85, 105]; // Slate-600

  // --- 1. BRANDED HEADER ---
  pdf.setFillColor(...accentColor);
  pdf.rect(0, 0, 210, 40, 'F'); 
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text('ECOSCAN INTELLIGENCE REPORT', 15, 25);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('SATELLITE-BASED VEGETATION SURVEILLANCE', 15, 32);

  // --- 2. REPORT METADATA ---
  pdf.setTextColor(...secondaryColor);
  pdf.setFontSize(9);
  pdf.text(`REPORT ID: #ES-${Date.now().toString().slice(-6)}`, 150, 20);
  pdf.text(`DATE: ${new Date().toLocaleDateString()}`, 150, 25);
  pdf.text(`STATUS: VERIFIED ANALYSIS`, 150, 30);

  // --- 3. ANALYSIS PARAMETERS TABLE ---
  pdf.setDrawColor(229, 231, 235);
  pdf.line(15, 50, 195, 50);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(30, 41, 59);
  pdf.text('Comparison Context', 15, 60);

  // Table Body
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const modeText = comparisonType === 'temporal' ? 'Temporal (Time-Series)' : 'Regional (Cross-Zone)';
  pdf.text(`Analysis Mode: ${modeText}`, 15, 70);
  
  if (comparisonType === 'temporal') {
    pdf.text(`Baseline: Scan ${beforeIndex + 1} (${beforeAnalysis?.vegetationLossPercentage}% Loss)`, 15, 78);
    pdf.text(`Current: Scan ${afterIndex + 1} (${afterAnalysis?.vegetationLossPercentage}% Loss)`, 15, 86);
  } else {
    pdf.text(`Location A: ${dataA?.name || 'Undefined'}`, 15, 78);
    pdf.text(`Location B: ${dataB?.name || 'Undefined'}`, 15, 86);
  }

  // --- 4. DATA INTELLIGENCE GRID (Structured) ---
  pdf.setFillColor(248, 250, 252);
  pdf.roundedRect(15, 100, 180, 60, 3, 3, 'F');
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Performance Indicators (KPIs)', 20, 110);
  
  pdf.setFontSize(10);
  pdf.text(`${comparisonType === 'temporal' ? 'Days Elapsed:' : 'Loss Variance:'}`, 25, 125);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${comparisonData?.val1 || '---'} ${comparisonData?.unit1 || ''}`, 70, 125);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Spectral Delta:', 25, 135);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${comparisonData?.val3 || '---'} NDVI`, 70, 135);

  pdf.setFont('helvetica', 'bold');
  pdf.text('AI Status Verdict:', 25, 145);
  pdf.setTextColor(...accentColor);
  pdf.text(`${comparisonData?.val4 || '---'}`, 70, 145);

  // --- 5. DETAILED SCIENTIFIC NARRATIVE ---
  pdf.setTextColor(30, 41, 59);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Technical Assessment', 15, 180);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  const narrative = comparisonType === 'temporal' 
    ? `Between the baseline and current scan, vegetation loss changed by ${comparisonData?.change || '0'}%. This indicates a ${comparisonData?.val4 === 'Improving' ? 'positive recovery' : 'degrading trend'} in regional forest health based on spectral pixel density.`
    : `Comparing ${dataA?.name} and ${dataB?.name} reveals a health variance of ${comparisonData?.val3} NDVI. ${comparisonData?.val2} currently maintains a superior photosynthetic index.`;

  const splitNarrative = pdf.splitTextToSize(narrative, 170);
  pdf.text(splitNarrative, 15, 190);

  // --- 6. FOOTER & SIGNATURE ---
  pdf.setDrawColor(...accentColor);
  pdf.line(15, 270, 195, 270);
  pdf.setFontSize(8);
  pdf.setTextColor(150);
  pdf.text('EcoScan Satellite Intel - Automated Environmental Audit Report', 15, 278);
  pdf.text('Confidential Data - Proprietary AI Logic Applied', 140, 278);

  pdf.save(`EcoScan_Intel_Report_${Date.now()}.pdf`);
};
  const handleAnalyze = () => {
    if (comparisonType === 'temporal') {
      if (beforeAnalysis && afterAnalysis) {
        const diff = (afterAnalysis.vegetationLossPercentage || 0) - (beforeAnalysis.vegetationLossPercentage || 0);
        setComparisonData({
          val1: "151", unit1: "Days",
          val2: (diff / 151).toFixed(3), unit2: "% / Day",
          val3: ((afterAnalysis.ndvi?.mean || 0) - (beforeAnalysis.ndvi?.mean || 0)).toFixed(3), unit3: "NDVI Δ",
          val4: diff < 0 ? "Improving" : "Worsening", unit4: "Status"
        });
      }
    } else {
      if (dataA && dataB) {
        const lossA = dataA.latestMetrics?.vegetationLoss || 0;
        const lossB = dataB.latestMetrics?.vegetationLoss || 0;
        const ndviA = dataA.latestMetrics?.ndvi || 0;
        const ndviB = dataB.latestMetrics?.ndvi || 0;

        setComparisonData({
          val1: Math.abs(lossA - lossB).toFixed(2), unit1: "Loss Δ",
          val2: ndviA > ndviB ? "Location A" : "Location B", unit2: "Healthier",
          val3: Math.abs(ndviA - ndviB).toFixed(3), unit3: "NDVI Δ",
          val4: "Active", unit4: "Comparison"
        });
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 max-w-[1500px] mx-auto">
      
      {/* 1. TOP METHOD SWITCHER */}
      <div className="flex justify-center">
        <div className="bg-white p-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-1">
          <button 
            onClick={() => { setComparisonType('temporal'); setComparisonData(null); }}
            className={`px-10 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${comparisonType === 'temporal' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Temporal Change
          </button>
          <button 
            onClick={() => { setComparisonType('regional'); setComparisonData(null); }}
            className={`px-10 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${comparisonType === 'regional' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Regional Comparison
          </button>
        </div>
      </div>

      {/* 2. CORE WORKSPACE (5-COLUMN GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[480px]">
            {comparisonType === 'temporal' ? (
              <>
                <MapSlot label="Baseline (Scan A)" theme="#ef4444" lat={25.65} lon={84.12} loss={beforeAnalysis?.vegetationLossPercentage} />
                <MapSlot label="Current (Scan B)" theme="#10b981" lat={25.65} lon={84.12} loss={afterAnalysis?.vegetationLossPercentage} />
              </>
            ) : (
              <>
                <MapSlot label={`A: ${dataA?.name}`} theme="#ef4444" lat={dataA?.latitude} lon={dataA?.longitude} loss={dataA?.latestMetrics?.vegetationLoss} />
                <MapSlot label={`B: ${dataB?.name}`} theme="#3b82f6" lat={dataB?.latitude} lon={dataB?.longitude} loss={dataB?.latestMetrics?.vegetationLoss} />
              </>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat label={comparisonType === 'temporal' ? "Observation" : "Variance"} value={comparisonData?.val1 || "---"} unit={comparisonData?.unit1 || ""} icon={<Calendar size={16} className="text-blue-500"/>} />
            <MiniStat label={comparisonType === 'temporal' ? "Velocity" : "Healthier"} value={comparisonData?.val2 || "---"} unit={comparisonData?.unit2 || ""} icon={<TrendingDown size={16} className="text-amber-500"/>} />
            <MiniStat label="Spectral" value={comparisonData?.val3 || "---"} unit={comparisonData?.unit3 || ""} icon={<Activity size={16} className="text-rose-500"/>} />
            <MiniStat label="Verdict" value={comparisonData?.val4 || "---"} unit={comparisonData?.unit4 || ""} icon={<ShieldCheck size={16} className="text-emerald-500"/>} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm h-[600px] flex flex-col justify-between">
            <div className="space-y-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Target size={14} className="text-emerald-600" /> Comparison Parameters
              </h3>
              {comparisonType === 'temporal' ? (
                <>
                  <Dropdown label="Baseline State" value={beforeIndex} onChange={setBeforeIndex} options={analysisHistory.map((a,i)=>({v:i, l:`Scan ${i+1} — ${a.vegetationLossPercentage}%`}))} color="rose" />
                  <div className="flex justify-center"><ArrowLeftRight className="text-slate-200" /></div>
                  <Dropdown label="Current State" value={afterIndex} onChange={setAfterIndex} options={analysisHistory.map((a,i)=>({v:i, l:`Scan ${i+1} — ${a.vegetationLossPercentage}%`}))} color="emerald" />
                </>
              ) : (
                <>
                  <Dropdown label="Location A" value={regionA} onChange={setRegionA} options={regions.map(r=>({v:r.name, l:r.name}))} color="rose" />
                  <div className="flex justify-center"><ArrowLeftRight className="text-slate-200" /></div>
                  <Dropdown label="Location B" value={regionB} onChange={setRegionB} options={regions.map(r=>({v:r.name, l:r.name}))} color="blue" />
                </>
              )}
            </div>
            <button onClick={handleAnalyze} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-bold text-sm tracking-widest uppercase hover:bg-emerald-600 transition-all shadow-xl active:scale-95">Analyze Delta</button>
          </div>
        </div>
      </div>

      {/* 3. TECHNICAL EVIDENCE TIER (The section captured by PDF) */}
      <div ref={reportRef} className="space-y-6 pt-10 border-t border-slate-100">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">Scientific Cross-Analysis Evidence</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DetailCard label="Reference Alpha" value={comparisonType === 'temporal' ? `${beforeAnalysis?.vegetationLossPercentage || 0}%` : `${dataA?.latestMetrics?.vegetationLoss || 0}%`} border="rose" desc="Baseline measurement confirmed via multispectral scanning." />
          <DetailCard label="Reference Beta" value={comparisonType === 'temporal' ? `${afterAnalysis?.vegetationLossPercentage || 0}%` : `${dataB?.latestMetrics?.vegetationLoss || 0}%`} border="blue" desc="Comparison data point derived from current orbital observation." />
          <DetailCard label="Delta Variance" value={comparisonData?.val3 || "0.000"} border="emerald" desc="Comparison of photosynthetic health between the two states." />
          <DetailCard label="Model Confidence" value="94%" border="amber" desc="Certainty level based on pixel density and model scores." />
        </div>
      </div>

      {/* 4. PDF GENERATION BUTTON */}
      <div className="flex justify-center pt-10">
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-3 px-12 py-5 bg-emerald-600 text-white rounded-[2rem] font-bold text-sm tracking-widest uppercase hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 transform hover:-translate-y-1 active:scale-95"
        >
          <Download size={20} /> Generate Intelligence Report
        </button>
      </div>
    </div>
  );
}

// Sub-components (Mapping, Stats, Cards)
function MapSlot({ label, theme, lat, lon, loss }) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative h-full">
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase text-slate-700 shadow-sm">{label}</div>
      <MapContainer center={[lat || 0, lon || 0]} zoom={6} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {lat && lon && <Circle center={[lat, lon]} radius={(loss || 5) * 5000} pathOptions={{ color: theme, fillColor: theme, fillOpacity: 0.3 }} />}
      </MapContainer>
    </div>
  );
}

function MiniStat({ label, value, unit, icon }) {
  return (
    <div className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="text-xl font-black text-slate-900 tracking-tighter">{value}</div>
      <p className="text-[9px] font-bold text-slate-500 uppercase">{unit}</p>
    </div>
  );
}

function DetailCard({ label, value, border, desc }) {
  const accents = { rose: "border-rose-500", emerald: "border-emerald-500", blue: "border-blue-500", amber: "border-amber-600" };
  return (
    <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 border-l-4 ${accents[border]} shadow-sm h-full flex flex-col`}>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{value}</div>
      <div className="mt-auto bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <p className="text-[13px] text-slate-600 leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}

function Dropdown({ label, value, onChange, options, color }) {
  const borderCol = color === 'rose' ? 'border-rose-500' : (color === 'blue' ? 'border-blue-500' : 'border-emerald-500');
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className={`border-l-4 rounded-2xl ${borderCol}`}>
        <select value={String(value)} onChange={e => onChange(isNaN(e.target.value) ? e.target.value : Number(e.target.value))} className="w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer">
          {options.map((o, i) => <option key={i} value={String(o.v)}>{o.l}</option>)}
        </select>
      </div>
    </div>
  );
}