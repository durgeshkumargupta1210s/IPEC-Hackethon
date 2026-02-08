import React, { useEffect, useState } from 'react';
import { LayoutGrid, Clock, Repeat, Lightbulb, Globe, Bell, Menu, X, Leaf, MapPin, Activity, Target } from 'lucide-react';

// Your Components
import { InteractiveMap } from './components/InteractiveMap';
import { AnalysisControls } from './components/AnalysisControls';
import { AnalysisResultCard } from './components/AnalysisResultCard';
import { AnalysisHistory } from './components/AnalysisHistory';
import { SystemStatusBar } from './components/SystemStatusBar';
import { TimelineSlider } from './components/TimelineSlider';
import { ComparisonMode } from './components/ComparisonMode';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { MultiRegionDashboard } from './components/MultiRegionDashboard';
import { AlertsPanel } from './components/AlertsPanel';
import { EmailAlertSetup } from './components/EmailAlertSetup';
import RequestlyDemoPanel from './components/RequestlyDemoPanel';

// Services and Hooks
import { api } from './services/api';
import { useAnalysis } from './hooks/useAnalysis';

// Styles
import './App.css';

const DEFAULT_REGIONS = [
  { 
    name: '🟢 Valmiki Nagar Forest, Bihar', 
    latitude: 25.65, 
    longitude: 84.12, 
    sizeKm: 50, 
    riskLevel: 'LOW',
    vegetationLoss: 3.9,
    confidence: 90,
    trend: 'stable',
    description: 'High altitude ecosystem remains healthy.',
    ndvi: { mean: 0.701, min: 0.520, max: 0.920, stdDev: 0.082 },
    riskClassification: { riskLevel: 'LOW', riskScore: 0.08, confidenceScore: 0.90 }
  },
  { 
    name: '🟡 Murchison Falls, Uganda', 
    latitude: 2.253, 
    longitude: 32.003, 
    sizeKm: 50, 
    riskLevel: 'MEDIUM',
    vegetationLoss: 22.4,
    confidence: 87,
    trend: 'stable',
    description: 'Moderate mangrove degradation.',
    ndvi: { mean: 0.498, min: 0.150, max: 0.780, stdDev: 0.136 },
    riskClassification: { riskLevel: 'MEDIUM', riskScore: 0.52, confidenceScore: 0.87 }
  },
  { 
    name: '🔴 Odzala-Kokoua, Congo', 
    latitude: -1.021, 
    longitude: 15.909, 
    sizeKm: 60, 
    riskLevel: 'HIGH',
    vegetationLoss: 52.8,
    confidence: 89,
    trend: 'increasing',
    description: 'Significant vegetation damage detected.',
    ndvi: { mean: 0.245, min: -0.120, max: 0.680, stdDev: 0.180 },
    riskClassification: { riskLevel: 'HIGH', riskScore: 0.85, confidenceScore: 0.89 }
  },
  { 
    name: '🟢 Kasai Biosphere, DRC', 
    latitude: -4.338, 
    longitude: 20.823, 
    sizeKm: 80, 
    riskLevel: 'LOW',
    vegetationLoss: 5.1,
    confidence: 88,
    trend: 'stable',
    description: 'Stable wetland ecosystem.',
    ndvi: { mean: 0.612, min: 0.320, max: 0.810, stdDev: 0.108 },
    riskClassification: { riskLevel: 'LOW', riskScore: 0.12, confidenceScore: 0.88 }
  },
];

function App() {
  const analysis = useAnalysis();
  const [regions, setRegions] = useState(DEFAULT_REGIONS);
  const [historyRegion, setHistoryRegion] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(3);
  const [detectedProblems, setDetectedProblems] = useState([]);
  const [currentAnalyzingRegion, setCurrentAnalyzingRegion] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // --- ALL YOUR ORIGINAL LOGIC FUNCTIONS (STAY INSIDE APP) ---
  useEffect(() => {
    analysis.checkHealth();
    analysis.getLatestAnalyses();
    analysis.getStats();
    fetchRegionsFromBackend();
    loadSavedCoordinates();
  }, []);

  useEffect(() => {
    if (activeTab === 'timeline') {
      const selectedRegionName = analysis.selectedRegion?.name;
      if (selectedRegionName) fetchAnalysisHistory(selectedRegionName);
    }
  }, [activeTab, analysis.selectedRegion?.name]);

  const loadSavedCoordinates = () => {
    try {
      const savedCoordinates = JSON.parse(localStorage.getItem('savedCoordinates') || '[]');
      setRegions(prev => {
        const merged = [...prev];
        savedCoordinates.forEach(saved => {
          if (!merged.find(r => r.name === saved.name)) {
            merged.push(saved);
          }
        });
        return merged;
      });
    } catch (error) {
      console.warn('Failed to load saved coordinates');
    }
  };

  const fetchRegionsFromBackend = async () => {
    try {
      const response = await api.get('/regions');
      // Backend returns { success: true, count, data: [...regions...] }
      const regionsData = response.data?.data || response.data || [];
      const dataArray = Array.isArray(regionsData) ? regionsData : [regionsData].filter(Boolean);
      
      if (dataArray.length > 0) {
        const backendRegions = dataArray.map(r => ({
          name: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          sizeKm: r.sizeKm || 50,
          riskLevel: (r.latestMetrics?.riskLevel || r.riskLevel || 'low').toLowerCase(),
          vegetationLoss: r.latestMetrics?.vegetationLoss || r.vegetationLoss || (Math.random() * 50),
          confidence: r.latestMetrics?.confidence || r.confidence || (Math.random() * 30 + 70),
          trend: r.latestMetrics?.trend || r.trend || 'stable',
          ndvi: r.latestMetrics?.ndvi || r.ndvi || { mean: 0.5, min: 0.3, max: 0.7, stdDev: 0.1 },
          riskClassification: r.riskClassification || { riskLevel: (r.latestMetrics?.riskLevel || r.riskLevel || 'LOW').toUpperCase(), riskScore: 0.5 },
          isCustom: r.isCustom || false,
        }));
        setRegions(prev => {
          const merged = [...backendRegions];
          DEFAULT_REGIONS.forEach(def => {
            if (!merged.find(r => r.name === def.name)) merged.push(def);
          });
          // Add saved coordinates from localStorage
          const savedCoordinates = JSON.parse(localStorage.getItem('savedCoordinates') || '[]');
          savedCoordinates.forEach(saved => {
            if (!merged.find(r => r.name === saved.name)) {
              merged.push(saved);
            }
          });
          return merged;
        });
      }
    } catch (error) {
      console.warn('Backend fetch failed, using defaults');
    }
  };

  const handleAnalyze = async (latitude, longitude, name) => {
    try {
      analysis.clearError();
      const regionObj = regions.find(r => r.name === name);
      if (regionObj) analysis.setSelectedRegion(regionObj);
      fetchAnalysisHistory(name);
      
      setCurrentAnalyzingRegion({ latitude, longitude, name, sizeKm: 5, riskLevel: 'low', isCustom: true });
      const result = await analysis.analyzeRegion(latitude, longitude, 50, name);
      const riskLevel = result?.riskClassification?.riskLevel || 'low';

      await fetchRegionsFromBackend();
      setCurrentAnalyzingRegion(null);
    } catch (error) {
      console.error('Analysis failed');
      setTimeout(() => setCurrentAnalyzingRegion(null), 3000);
    }
  };

  const handleRegionSelect = async (region) => {
    try {
      analysis.clearError();
      
      // Set region as selected
      analysis.setSelectedRegion(region);
      setHistoryRegion(region.name);
      setMapCenter([region.latitude, region.longitude]);
      setMapZoom(11);

      // Show loading state
      setCurrentAnalyzingRegion(region);

      // Run analysis for this region
      console.log(`Running analysis for ${region.name}...`);
      const result = await analysis.analyzeRegion(
        region.latitude || region.location?.lat || 0, 
        region.longitude || region.location?.lng || 0, 
        region.sizeKm || 50, 
        region.name
      );

      // Fetch history for this region
      fetchAnalysisHistory(region.name);

      // Clear loading and navigate to explainability tab
      setCurrentAnalyzingRegion(null);
      setActiveTab('explainability');
      
      console.log('Analysis complete, navigating to explainability tab');
    } catch (error) {
      console.error('Analysis failed:', error);
      setCurrentAnalyzingRegion(null);
    }
  };

  const handleSaveRegion = (newRegion) => {
    setRegions(prev => {
      const exists = prev.some(r => r.name === newRegion.name);
      if (!exists) {
        return [...prev, newRegion];
      }
      return prev;
    });
  };

  const handleUpdateRegions = (savedCoordinates) => {
    setRegions(prev => {
      // Remove old custom regions and add updated ones
      const nonCustom = prev.filter(r => !r.isCustom);
      return [...nonCustom, ...savedCoordinates];
    });
  };

  const fetchAnalysisHistory = async (regionName) => {
    try {
      const response = await api.get(`/analysis/history/${encodeURIComponent(regionName)}`);
      setAnalysisHistory(response.data.analyses || []);
    } catch (error) {
      setAnalysisHistory([]);
    }
  };

  const handleLocationChange = (lat, lon) => {
    setMapCenter([lat, lon]);
    setMapZoom(11);
  };

  // --- THE UI RENDER FUNCTIONS (CRITICAL TO FIX YOUR ERROR) ---
  const renderDashboard = () => (
  <div className="space-y-8 animate-in fade-in duration-700 h-full">
    {/* Grid adjusted to 5 columns: 3 for Map (60%), 2 for Sidebar (40%) */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start h-full">
      
      {/* MAP SECTION: Breath is now 60% of the screen */}
      <div className="lg:col-span-3">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden relative h-[850px] lg:h-[calc(100vh-160px)]">
          <div className="absolute top-6 left-6 z-[10]">
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 px-5 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-700 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Live Intelligence Feed
            </div>
          </div>
          
          <InteractiveMap
            regions={regions}
            onRegionSelect={handleRegionSelect}
            selectedRegion={analysis.selectedRegion}
            mapCenter={mapCenter}
            mapZoom={mapZoom}
            detectedProblems={detectedProblems}
            currentAnalyzingRegion={currentAnalyzingRegion}
          />
        </div>
      </div>

      {/* SIDEBAR SECTION: Breath increased to 40% for a "Normal/Professional" card size */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Analysis Controls Card with Premium Padding */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Operations Center</h3>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
              <Target size={18} />
            </div>
          </div>
          
          <AnalysisControls
            onAnalyze={handleAnalyze}
            regions={regions}
            loading={analysis.loading}
            onLocationChange={handleLocationChange}
            onSaveRegion={handleSaveRegion}
            onUpdateRegions={handleUpdateRegions}
          />
        </div>
        
        {/* System Health Card with Side-by-Side Stats */}
        {analysis.stats && (
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> System Health
            </h3>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-slate-500 font-medium">Global Coverage</span>
                  <span className="font-bold text-slate-900">{regions.length} Active Areas</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-1000"
                    style={{ width: '100%' }}
                  ></div>
                </div>
              </div>
              
              {/* Stat Widgets: Now side-by-side due to increased card breath */}
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Total Analyses</p>
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">{analysis.stats.totalAnalyses}</p>
                </div>
                <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100/50">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-2">Avg. Accuracy</p>
                  <p className="text-4xl font-bold text-emerald-600 tracking-tight">{analysis.stats.successRate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Result Card: Spans full width for clarity */}
    {analysis.currentAnalysis && (
      <div className="mt-12 pb-10">
        <AnalysisResultCard analysis={analysis.currentAnalysis} />
      </div>
    )}
  </div>
);
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'timeline': return <TimelineSlider analysisHistory={analysisHistory} />;
      case 'comparison': return <ComparisonMode analysisHistory={analysisHistory} regions={regions} />;
      case 'explainability': return (
        <div className="space-y-6">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Environmental Analysis</h1>
            <p className="text-slate-500">Real-time satellite monitoring and vegetation health tracking.</p>
          </header>
          <ExplainabilityPanel analysisData={analysis.currentAnalysis} />
        </div>
      );
      case 'multi-region': return <MultiRegionDashboard onSelectRegion={handleRegionSelect} />;
      case 'alerts': return <AlertsPanel selectedRegion={analysis.selectedRegion} />;
      default: return renderDashboard();
    }
  };

  // --- THE ACTUAL APP RENDER ---
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Overlay for Mobile */}
      {!sidebarOpen && (
        <button onClick={() => setSidebarOpen(true)} className="fixed bottom-6 right-6 z-50 p-4 bg-emerald-600 text-white rounded-full shadow-2xl lg:hidden">
          <Menu size={24} />
        </button>
      )}

      {/* Modern Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <Globe size={24} />
            </div>
            <h1 className="font-bold text-slate-800 tracking-tight">EcoScan <br/><span className="text-emerald-600 text-xs">Satellite Intel</span></h1>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-400 lg:hidden"><X size={20} /></button>
          </div>
          <nav className="space-y-1 flex-1">
            <button onClick={() => setActiveTab('dashboard')} className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}><LayoutGrid size={18} /> Dashboard</button>
            <button onClick={() => setActiveTab('timeline')} className={`sidebar-nav-btn ${activeTab === 'timeline' ? 'active' : ''}`}><Clock size={18} /> Time-Lapse</button>
            <button onClick={() => setActiveTab('comparison')} className={`sidebar-nav-btn ${activeTab === 'comparison' ? 'active' : ''}`}><Repeat size={18} /> Comparison</button>
            <button onClick={() => setActiveTab('explainability')} className={`sidebar-nav-btn ${activeTab === 'explainability' ? 'active' : ''}`}><Lightbulb size={18} /> Analysis</button>
            <div className="h-px bg-slate-100 my-4"></div>
            <button onClick={() => setActiveTab('multi-region')} className={`sidebar-nav-btn ${activeTab === 'multi-region' ? 'active' : ''}`}><Globe size={18} /> Multi-Region</button>
            <button onClick={() => setActiveTab('alerts')} className={`sidebar-nav-btn ${activeTab === 'alerts' ? 'active' : ''}`}><Bell size={18} /> Alerts</button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <div className="max-w-[1400px] mx-auto p-6 lg:p-10">
          {analysis.error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 p-4 rounded-2xl flex justify-between items-center text-rose-700">
              <p className="text-sm font-medium">{analysis.error}</p>
              <button onClick={() => analysis.clearError()} className="font-bold">✕</button>
            </div>
          )}
          {renderContent()}
        </div>
      </main>

      {/* Email Alert Setup Component */}
      <EmailAlertSetup />
    </div>
  );
}

export default App;