import React from 'react';
import { MapPin, List, Navigation, ChevronDown, Search, Edit2, Trash2, X, Check } from 'lucide-react';

export function AnalysisControls({ onAnalyze, regions = [], loading = false, onLocationChange, onSaveRegion, onUpdateRegions }) {
  const [selectedRegion, setSelectedRegion] = React.useState('');
  const [customLat, setCustomLat] = React.useState('');
  const [customLon, setCustomLon] = React.useState('');
  const [customName, setCustomName] = React.useState('');
  const [useCustom, setUseCustom] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [editingRegion, setEditingRegion] = React.useState(null);
  const [editName, setEditName] = React.useState('');
  const [editLat, setEditLat] = React.useState('');
  const [editLon, setEditLon] = React.useState('');

  const handleLatChange = (e) => {
    const value = e.target.value;
    setCustomLat(value);
    if (value && customLon && onLocationChange) {
      onLocationChange(parseFloat(value), parseFloat(customLon));
    }
  };

  const handleLonChange = (e) => {
    const value = e.target.value;
    setCustomLon(value);
    if (value && customLat && onLocationChange) {
      onLocationChange(parseFloat(customLat), parseFloat(value));
    }
  };

  const handleRegionSelect = (e) => {
    const regionName = e.target.value;
    setSelectedRegion(regionName);
    const region = regions.find((r) => r.name === regionName);
    if (region && onLocationChange) {
      onLocationChange(region.latitude, region.longitude);
    }
  };

  const handleSaveCoordinates = () => {
    if (!customLat || !customLon || !customName) {
      return alert('Please fill all fields before saving');
    }
    
    const newRegion = {
      name: customName,
      latitude: parseFloat(customLat),
      longitude: parseFloat(customLon),
      sizeKm: 50,
      riskLevel: 'low',
      isCustom: true,
    };

    // Save to localStorage
    const savedRegions = JSON.parse(localStorage.getItem('savedCoordinates') || '[]');
    const exists = savedRegions.some(r => r.name === newRegion.name);
    
    if (exists) {
      alert('This region name already exists. Please use a different name.');
      return;
    }

    savedRegions.push(newRegion);
    localStorage.setItem('savedCoordinates', JSON.stringify(savedRegions));

    // Notify parent if callback provided
    if (onSaveRegion) {
      onSaveRegion(newRegion);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    alert(`✓ Coordinates saved for "${customName}"!\n\nYou can now use this location in the Pre-defined tab.`);
  };

  const handleEditRegion = (region) => {
    setEditingRegion(region.name);
    setEditName(region.name);
    setEditLat(region.latitude.toString());
    setEditLon(region.longitude.toString());
  };

  const handleSaveEdit = () => {
    if (!editName || !editLat || !editLon) {
      return alert('Please fill all fields');
    }

    const savedRegions = JSON.parse(localStorage.getItem('savedCoordinates') || '[]');
    const index = savedRegions.findIndex(r => r.name === editingRegion);
    
    if (index !== -1) {
      savedRegions[index] = {
        ...savedRegions[index],
        name: editName,
        latitude: parseFloat(editLat),
        longitude: parseFloat(editLon),
      };
      
      localStorage.setItem('savedCoordinates', JSON.stringify(savedRegions));
      
      // Notify parent to update regions
      if (onUpdateRegions) {
        onUpdateRegions(savedRegions);
      }
      
      setEditingRegion(null);
      alert(`✓ Region "${editName}" updated successfully!`);
    }
  };

  const handleDeleteRegion = (regionName) => {
    if (window.confirm(`Are you sure you want to delete "${regionName}"?`)) {
      const savedRegions = JSON.parse(localStorage.getItem('savedCoordinates') || '[]');
      const filtered = savedRegions.filter(r => r.name !== regionName);
      localStorage.setItem('savedCoordinates', JSON.stringify(filtered));
      
      // Notify parent to update regions
      if (onUpdateRegions) {
        onUpdateRegions(filtered);
      }
      
      alert(`✓ Region "${regionName}" deleted successfully!`);
    }
  };

  const handleAnalyze = () => {
    if (useCustom) {
      if (!customLat || !customLon || !customName) return alert('Fill all fields');
      onAnalyze(parseFloat(customLat), parseFloat(customLon), customName);
    } else {
      if (!selectedRegion) return alert('Select a region');
      const region = regions.find((r) => r.name === selectedRegion);
      if (region) onAnalyze(region.latitude, region.longitude, region.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setUseCustom(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${!useCustom ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <List size={12} /> Pre-defined
        </button>
        <button
          onClick={() => setUseCustom(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all ${useCustom ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <MapPin size={12} /> Custom
        </button>
      </div>

      {!useCustom ? (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Choose Monitoring Zone</label>
          <div className="relative group">
            <select
              value={selectedRegion}
              onChange={handleRegionSelect}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block p-3 appearance-none transition-all hover:bg-white cursor-pointer"
            >
              <option value="">-- Select a forest region --</option>
              {regions.map((region) => (
                <option key={region.name} value={region.name}>{region.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-600 transition-colors" size={16} />
          </div>

          {/* Edit/Delete buttons for custom saved regions */}
          {selectedRegion && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const region = regions.find(r => r.name === selectedRegion);
                  if (region) handleEditRegion(region);
                }}
                className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button
                onClick={() => handleDeleteRegion(selectedRegion)}
                className="flex-1 py-2 px-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Region Name</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter area name..."
              className="w-full bg-slate-50 border border-slate-200 text-sm rounded-2xl p-4 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
              <input
                type="number"
                value={customLat}
                onChange={handleLatChange}
                placeholder="25.65"
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-2xl p-4 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
              <input
                type="number"
                value={customLon}
                onChange={handleLonChange}
                placeholder="84.12"
                className="w-full bg-slate-50 border border-slate-200 text-sm rounded-2xl p-4 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Save Coordinates Button */}
          <button
            onClick={handleSaveCoordinates}
            className={`w-full py-3 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${saveSuccess ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95'}`}
          >
            {saveSuccess ? (
              <>
                <span>✓ Saved Successfully!</span>
              </>
            ) : (
              <>
                <MapPin size={16} />
                Save Coordinates for Future Use
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Action Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className={`w-full py-3 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-lg ${loading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 active:scale-95'}`}
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            Scanning...
          </>
        ) : (
          <>
            <Search size={18} />
            Run Satellite Analysis
          </>
        )}
      </button>

      {/* Edit Modal */}
      {editingRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Edit Region</h3>
              <button
                onClick={() => setEditingRegion(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-sm rounded-2xl p-4 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-2xl p-4 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={editLon}
                    onChange={(e) => setEditLon(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-sm rounded-2xl p-4 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setEditingRegion(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} /> Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 px-4 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}