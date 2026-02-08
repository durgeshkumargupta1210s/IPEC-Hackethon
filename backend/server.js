const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');

// Load environment variables
dotenv.config();

const mongoose = require('mongoose');
const analysisRoutes = require('./src/api/routes/analysis');
const analysisExtendedRoutes = require('./src/api/routes/analysis-extended');
const realTimeAnalysisRoutes = require('./src/api/routes/realtime-analysis');
const regionsRoutes = require('./src/api/routes/regions');
const systemRoutes = require('./src/api/routes/system');
const healthRoutes = require('./src/api/routes/health');
const mlRoutes = require('./src/api/routes/ml');
const alertsRoutes = require('./src/api/routes/alerts');
const emailAlertsRoutes = require('./src/api/routes/emailAlerts');
const reportsRoutes = require('./src/api/routes/reports');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const httpServer = http.createServer(app);

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Try MongoDB connection (optional for demo)
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/satellite-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB connected (optional for demo)\n');
  })
  .catch(err => {
    console.warn('⚠️  MongoDB not available - running in demo mode (in-memory)\n');
  });

// Routes - Import only essential ones
const analysisRoutes = require('./src/api/routes/analysis');
const healthRoutes = require('./src/api/routes/health');
const alertsRoutes = require('./src/api/routes/alerts');
const reportsRoutes = require('./src/api/routes/reports');
const customReasonRoutes = require('./src/api/routes/custom-reasons');

app.use('/api/health', healthRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/custom-reasons', customReasonRoutes);

// ============================================
// REGIONS MANAGEMENT - Database Backed
// ============================================
const Region = require('./src/models/Region');

const defaultRegions = [
  // TROPICAL FORESTS (High Vegetation)
  {
    name: '🟢 Valmiki Nagar Forest, Bihar',
    latitude: 25.65,
    longitude: 84.12,
    sizeKm: 50,
    riskLevel: 'low',
  },
  {
    name: '🟡 Murchison Falls, Uganda',
    latitude: 2.253,
    longitude: 32.003,
    sizeKm: 50,
    riskLevel: 'medium',
  },
  {
    name: '🔴 Odzala-Kokoua, Congo',
    latitude: -1.021,
    longitude: 15.909,
    sizeKm: 50,
    riskLevel: 'high',
  },
  // TEMPERATE FOREST (Medium Vegetation)
  {
    name: '🌲 Black Forest, Germany',
    latitude: 48.5,
    longitude: 8.2,
    sizeKm: 50,
    riskLevel: 'low',
  },
  // DESERT REGION (Very Low Vegetation)
  {
    name: '🏜️ Sahara Desert, Egypt',
    latitude: 25.0,
    longitude: 25.0,
    sizeKm: 50,
    riskLevel: 'high',
  },
  // AMAZON RAINFOREST (Very High Vegetation)
  {
    name: '🌴 Amazon Rainforest, Brazil',
    latitude: -3.0,
    longitude: -60.0,
    sizeKm: 50,
    riskLevel: 'medium',
  },
  // BOREAL FOREST (Medium-Low Vegetation)
  {
    name: '❄️ Siberian Taiga, Russia',
    latitude: 65.0,
    longitude: 100.0,
    sizeKm: 50,
    riskLevel: 'low',
  },
  // GRASSLAND (Low-Medium Vegetation)
  {
    name: '🌾 Serengeti Plains, Tanzania',
    latitude: -2.5,
    longitude: 34.8,
    sizeKm: 50,
    riskLevel: 'medium',
  },
];

// Get all regions (default + persisted custom regions from MongoDB)
app.get('/api/regions', async (req, res) => {
  try {
    // Predefined region names to filter out duplicates from DB
    const predefinedNames = [
      '🟢 Valmiki Nagar Forest, Bihar',
      '🟡 Murchison Falls, Uganda',
      '🔴 Odzala-Kokoua, Congo',
      '🌲 Black Forest, Germany',
      '🏜️ Sahara Desert, Egypt',
      '🌴 Amazon Rainforest, Brazil',
      '❄️ Siberian Taiga, Russia',
      '🌾 Serengeti Plains, Tanzania',
    ];

    // Get truly custom regions from MongoDB (exclude predefined ones)
    const customRegions = await Region.find({ 
      isCustom: true,
      name: { $nin: predefinedNames }  // Exclude predefined region names
    }).sort({ createdAt: -1 }).then(regions => {
      // Further filter to remove any regions that match predefined patterns
      return regions.filter(r => {
        const isPredefined = predefinedNames.includes(r.name) || 
          ['Valmiki Nagar', 'Murchison Falls', 'Odzala-Kokoua', 'Black Forest', 
           'Sahara Desert', 'Amazon Rainforest', 'Siberian Taiga', 'Serengeti Plains']
          .some(pattern => r.name.includes(pattern));
        return !isPredefined;
      });
    });
    
    // DEBUG: Log what was found
    console.log(`[API] Query returned: ${customRegions.length} regions`);
    
    if (customRegions.length > 0) {
      console.log(`[API] Custom regions found:`);
      customRegions.forEach(r => {
        console.log(`  - ${r.name} (isCustom: ${r.isCustom}, _id: ${r._id})`);
      });
    }
    
    // Also check ALL regions in the collection
    const allInCollection = await Region.countDocuments();
    console.log(`[API] Total documents in Region collection: ${allInCollection}`);
    
    // Combine with default regions
    const allRegions = [
      ...defaultRegions,
      ...customRegions.map(r => ({
        _id: r._id,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        sizeKm: r.sizeKm,
        riskLevel: r.latestMetrics?.riskLevel?.toLowerCase() || 'unknown',
        isCustom: r.isCustom,
        latestMetrics: r.latestMetrics,
        analysisHistory: r.analysisHistory,
        createdAt: r.createdAt,
      }))
    ];
    
    console.log(`[API] GET /api/regions - Returning ${allRegions.length} regions (${customRegions.length} custom)`);
    res.json({
      success: true,
      count: allRegions.length,
      data: allRegions,
    });
  } catch (error) {
    console.error('[API] Error fetching regions:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Add custom region (saves to MongoDB)
app.post('/api/regions/add', async (req, res) => {
  try {
    const { name, latitude, longitude, sizeKm } = req.body;

    // Validation
    if (!name || latitude === undefined || longitude === undefined || !sizeKm) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, latitude, longitude, sizeKm',
      });
    }

    // Check if region already exists in MongoDB
    const exists = await Region.findOne({ name });
    if (exists) {
      console.log(`[API] Region "${name}" already exists (likely saved during analysis)`);
      return res.status(400).json({
        success: false,
        error: 'Region with this name already exists',
        alreadyExists: true,
      });
    }

    // Create new region and save to MongoDB
    const newRegion = new Region({
      name: name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      sizeKm: parseFloat(sizeKm),
      active: true,
      isCustom: true,
      latestMetrics: {
        vegetationLoss: 0,
        riskLevel: 'UNKNOWN',
        confidence: 0,
        trend: 'stable',
        ndviValue: 0,
      },
      analysisHistory: [],
      createdAt: new Date(),
    });

    await newRegion.save();

    console.log(`\n✅ [Regions] Custom region saved to MongoDB: "${name}"`);
    console.log(`   Location: ${latitude}, ${longitude} | Size: ${sizeKm}km`);
    console.log(`   Database ID: ${newRegion._id}\n`);

    res.json({
      success: true,
      message: `Region "${name}" saved to database successfully`,
      region: newRegion,
    });
  } catch (error) {
    console.error('[Regions] Error adding region:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/analysis', analysisExtendedRoutes);
app.use('/api/analysis', realTimeAnalysisRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/alerts', emailAlertsRoutes);
app.use('/api/reports', reportsRoutes);

const PORT = process.env.PORT || 3000;

// Initialize WebSocket (NO REDIS/BULL NEEDED!)
const io = initializeWebSocket(httpServer);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║       🌳 ForestGuard Real-Time Server 🌳       ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  console.log(`✅ Server running: http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready: ws://localhost:${PORT}`);
  console.log(`⚡ Real-time streaming: ENABLED`);
  console.log(`� Real Satellite API: ENABLED ✅`);
  console.log(`   → Sentinel Hub Token: ${process.env.SENTINEL_HUB_TOKEN ? 'LOADED' : 'USING DEFAULT'}`);
  console.log(`   → Test endpoint: GET http://localhost:${PORT}/api/test-real-api`);
  console.log(`🎯 CORS Origins: ${allowedOrigins.join(', ')}`);
  console.log(`📊 Analysis: Uses real satellite data with ML models\n`);
  console.log('Ready for judges! 🚀\n');
});

module.exports = { app, io };
