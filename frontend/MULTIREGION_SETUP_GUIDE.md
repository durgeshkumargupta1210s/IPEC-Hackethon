## MultiRegionDashboard Setup & Troubleshooting Guide

### Data Flow Architecture

```
Backend API (/api/regions)
    ↓
    Returns: { success: true, count: N, data: [regions] }
    ↓
useAnalysisStore (Zustand Hook)
    ↓
    fetchRegions() → Calls api.get('/regions')
    ↓
    Extracts response.data.data and stores in `regions` state
    ↓
MultiRegionDashboard Component
    ↓
    useAnalysisStore() → { regions, loading, fetchRegions }
    ↓
    Renders regions data or shows loading/empty states
```

### Required Data Structure

Each region object from backend should have:

```javascript
{
  _id: "ObjectId",
  name: "Region Name",
  riskLevel: "HIGH" | "MEDIUM" | "LOW",
  vegetationLoss: 52.8,           // Percentage
  confidence: 89,                 // Percentage 0-100
  trend: "increasing" | "stable" | "decreasing",
  description: "Region description",
  location: { lat: 40.7128, lng: -74.0060 },
  area: 125.5,                    // km²
  active: true,
  latestMetrics: {                // Optional but recommended
    riskLevel: "HIGH",
    ndvi: { mean: 0.245, min: -0.120, max: 0.680, stdDev: 0.180 }
  }
}
```

### Component Hook Setup

**File:** `frontend/src/hooks/useAnalysisStore.js`

```javascript
import { create } from 'zustand';
import api from '../services/api';

export const useAnalysisStore = create((set) => ({
  regions: [],
  loading: false,
  error: null,
  
  fetchRegions: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/regions');
      // Backend returns { success: true, count, data: regions }
      const regionsData = response.data?.data || response.data || [];
      set({ regions: regionsData, loading: false, error: null });
    } catch (error) {
      console.error("Error fetching regions:", error);
      set({ 
        error: error.message || 'Failed to fetch regions',
        loading: false,
        regions: []
      });
    }
  },
  
  // ... other state and methods
}));
```

### Component Usage

**File:** `frontend/src/components/MultiRegionDashboard.jsx`

```javascript
import { useAnalysisStore } from '../hooks/useAnalysisStore';

const MultiRegionDashboard = ({ onSelectRegion }) => {
  // Pull directly from Zustand store
  const { regions, loading, fetchRegions } = useAnalysisStore();
  
  // Fetch on mount
  useEffect(() => {
    if (regions.length === 0) {
      fetchRegions();
    }
  }, [regions.length]);
  
  // Show loading state
  if (loading) return <LoadingSpinner />;
  
  // Show empty state
  if (regions.length === 0) return <NoDataMessage />;
  
  // Render regions
  return <RegionsList regions={regions} />;
};
```

### Testing Checklist

#### 1. Backend Connection
- [ ] Backend running on `http://localhost:5000`
- [ ] Route `/api/regions` accessible
- [ ] Returns proper data structure with `data` field

Test with curl:
```bash
curl http://localhost:5000/api/regions
```

Expected response:
```json
{
  "success": true,
  "count": 8,
  "data": [
    { "name": "Eastern Valley Park", "riskLevel": "HIGH", ... },
    ...
  ]
}
```

#### 2. Frontend Verification
- [ ] `useAnalysisStore` has `fetchRegions` method
- [ ] `MultiRegionDashboard` imports from `useAnalysisStore`
- [ ] Component calls `fetchRegions()` in `useEffect`
- [ ] Loading and empty states render properly
- [ ] Regions data displays after fetch

#### 3. Data Display
- [ ] Risk level badges show correctly
- [ ] Vegetation loss percentages display
- [ ] Confidence scores visible
- [ ] Region cards show all information

### Common Issues & Solutions

**Issue 1: "No regional data found" message**
```
Possible Causes:
1. Backend is not running
2. /api/regions endpoint returns empty array
3. Zustand store not initialized properly
4. Fetch not being called

Solutions:
✓ Start backend: npm start
✓ Check backend console for errors
✓ Verify api.js baseURL is correct (http://localhost:5000/api)
✓ Check browser DevTools Network tab for API calls
```

**Issue 2: Loading spinner never stops**
```
Possible Causes:
1. API request hangs
2. fetchRegions() not setting loading to false
3. Network timeout

Solutions:
✓ Check browser console for errors
✓ Verify API endpoint is correct
✓ Check network timeout in api.js (currently 30s)
✓ Look at Network tab for pending requests
```

**Issue 3: Data shows but formatting is wrong**
```
Possible Causes:
1. Backend returns different field names
2. Data structure mismatch
3. Missing required fields

Solutions:
✓ Log regions in browser console: console.log(regions)
✓ Compare with expected structure above
✓ Update backend response if field names differ
✓ Update component mapping if needed
```

### Quick Test with Mock Data

If backend is unavailable, temporarily use mock data:

```javascript
// In useAnalysisStore.js, replace fetchRegions with:
fetchRegions: async () => {
  // Temporary mock for testing
  const mockRegions = [...]; // from mockRegions.js
  set({ regions: mockRegions, loading: false });
}
```

### Files Modified

1. ✅ `frontend/src/hooks/useAnalysisStore.js` - Added fetchRegions
2. ✅ `frontend/src/components/MultiRegionDashboard.jsx` - Uses Zustand store
3. ✅ `frontend/src/utils/mockRegions.js` - Mock data for testing
4. ✓ `backend/src/api/routes/regions.js` - Already configured

### Next Steps

1. Start backend: `npm start` in `/backend`
2. Check browser DevTools Console for errors
3. Check Network tab for API responses
4. Verify data structure matches expectations
5. If issues persist, check the troubleshooting guide above
