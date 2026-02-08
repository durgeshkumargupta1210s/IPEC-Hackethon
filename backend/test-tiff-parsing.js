const axios = require('axios');
const { getAccessToken } = require('./src/services/sentinelHubOAuth');

const APIs = {
  PROCESS: 'https://services.sentinel-hub.com/api/v1/process'
};

const PROCESSING_API_TIMEOUT = 30 * 1000;

async function testTIFFParsing() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     TIFF DATA RETRIEVAL & PARSING TEST SUITE        ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  try {
    // Test location: Amazon Rainforest
    const latitude = -3;
    const longitude = -60;
    const sizeKm = 10;
    const startDate = '2024-11-01';
    const endDate = '2024-12-15';

    const degreesPerKm = 1 / 111;
    const halfSizeDegrees = (sizeKm / 2) * degreesPerKm;
    const bbox = [
      longitude - halfSizeDegrees,
      latitude - halfSizeDegrees,
      longitude + halfSizeDegrees,
      latitude + halfSizeDegrees
    ];

    const width = Math.max(64, Math.min(512, Math.round(sizeKm * 100 / 20)));
    const height = width;

    const evalscript = `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04", "B08"],
          output: { bands: 4, sampleType: "FLOAT32" }
        };
      }

      function evaluatePixel(sample) {
        return [sample.B02, sample.B03, sample.B04, sample.B08];
      }
    `;

    const payload = {
      input: {
        bounds: { bbox: bbox },
        data: [{
          type: "sentinel-2-l2a",
          dataFilter: {
            timeRange: {
              from: `${startDate}T00:00:00Z`,
              to: `${endDate}T23:59:59Z`
            }
          }
        }]
      },
      output: {
        width: width,
        height: height,
        responses: [{
          identifier: "default",
          format: { type: "image/tiff" }
        }]
      },
      evalscript: evalscript
    };

    console.log('[Test] 🔑 Getting OAuth token...');
    const token = await getAccessToken();
    console.log('[Test] ✅ Token obtained\n');

    console.log('[Test] 📍 Test Parameters:');
    console.log(`  Location: (${latitude}, ${longitude})`);
    console.log(`  Area: ${sizeKm}km × ${sizeKm}km`);
    console.log(`  BBOX: [${bbox.map(b => b.toFixed(4)).join(', ')}]`);
    console.log(`  Resolution: ${width}x${height} pixels`);
    console.log(`  Date range: ${startDate} to ${endDate}\n`);

    console.log('[Test] 🚀 Sending Processing API request...');
    const startTime = Date.now();

    const response = await axios.post(
      APIs.PROCESS,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'image/tiff'
        },
        responseType: 'arraybuffer',
        timeout: PROCESSING_API_TIMEOUT,
      }
    );

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('[Test] ✅ Response received!');
    console.log(`  Status: ${response.status}`);
    console.log(`  Duration: ${duration}s`);
    console.log(`  Content-Type: ${response.headers['content-type']}`);
    console.log(`  Data Size: ${(response.data.byteLength / 1024 || response.data.length / 1024).toFixed(2)} KB\n`);

    // Analyze TIFF structure
    console.log('[Test] 🔍 Analyzing TIFF structure...');
    
    // Ensure response.data is an ArrayBuffer
    let tiffBuffer = response.data;
    if (!(tiffBuffer instanceof ArrayBuffer)) {
      console.log('[Test] ⚠️  Converting response data to ArrayBuffer...');
      if (Buffer.isBuffer(tiffBuffer)) {
        tiffBuffer = tiffBuffer.buffer.slice(tiffBuffer.byteOffset, tiffBuffer.byteOffset + tiffBuffer.byteLength);
      } else {
        throw new Error(`Unknown data type: ${typeof tiffBuffer}`);
      }
    }
    
    // Check TIFF magic number (should be 'II' for little-endian or 'MM' for big-endian)
    const view = new DataView(tiffBuffer);
    const byte0 = view.getUint8(0);
    const byte1 = view.getUint8(1);
    const magicStr = String.fromCharCode(byte0, byte1);
    const isLittleEndian = magicStr === 'II';
    
    console.log(`  TIFF Magic: [${byte0.toString(16)}, ${byte1.toString(16)}] = "${magicStr}"`);
    console.log(`  Byte Order: ${isLittleEndian ? 'Little-endian' : 'Big-endian'}`);
    
    // Read offset to first IFD (Image File Directory)
    const ifdOffset = view.getUint32(4, isLittleEndian);
    console.log(`  First IFD Offset: 0x${ifdOffset.toString(16)}`);
    console.log(`  Total Buffer Size: ${tiffBuffer.byteLength} bytes\n`);

    // Now try to parse with geotiff
    console.log('[Test] 📦 Parsing with geotiff library...');
    const GeoTIFF = require('geotiff');
    
    try {
      const tiff = await GeoTIFF.fromArrayBuffer(tiffBuffer);
      console.log('[Test] ✅ GeoTIFF successfully parsed!');
      console.log('[Test] TIFF object keys:', Object.keys(tiff));
      
      // Try different API approaches
      let images = null;
      
      // Modern geotiff API
      if (typeof tiff.getImages === 'function') {
        images = await tiff.getImages();
      } else if (tiff.images) {
        images = tiff.images;
      } else if (typeof tiff.getImage === 'function') {
        images = [await tiff.getImage()];
      } else {
        console.log('[Test] ⚠️  Unknown geotiff API. Tiff object:', tiff);
        throw new Error('Cannot find image retrieval method in geotiff object');
      }
      
      console.log(`[Test] 📊 Found ${images.length} image(s) in TIFF`);
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const width = typeof img.getWidth === 'function' ? img.getWidth() : img.width;
        const height = typeof img.getHeight === 'function' ? img.getHeight() : img.height;
        const samplesPerPixel = typeof img.getSamplesPerPixel === 'function' ? img.getSamplesPerPixel() : img.samplesPerPixel;
        console.log(`  Image ${i}: ${width}x${height}, ${samplesPerPixel} samples/pixel`);
      }
      
      // Try to read the first band
      if (images.length > 0) {
        console.log(`\n[Test] 🔬 Reading data from first image...`);
        const readRasters = typeof images[0].readRasters === 'function' ? images[0].readRasters : images[0].getRasterData;
        const data = await readRasters.call(images[0]);
        console.log(`[Test] ✅ Raster data retrieved:`);
        console.log(`  Number of bands: ${data.length}`);
        console.log(`  First band length: ${data[0].length} pixels`);
        
        // Show sample values
        const firstBand = data[0];
        const sampleValues = firstBand.slice(0, 10);
        console.log(`  First 10 values: ${sampleValues.map(v => v.toFixed(2)).join(', ')}`);
        
        // Calculate statistics
        const min = Math.min(...firstBand);
        const max = Math.max(...firstBand);
        const mean = firstBand.reduce((a, b) => a + b) / firstBand.length;
        console.log(`  Statistics: min=${min.toFixed(2)}, max=${max.toFixed(2)}, mean=${mean.toFixed(2)}`);
      }
      
    } catch (parseError) {
      console.error('[Test] ❌ GeoTIFF parsing failed:');
      console.error(`  Error: ${parseError.message}`);
      console.error(`  Stack: ${parseError.stack}`);
    }

    console.log('\n✅ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error(`Response Data: ${error.response.data ? error.response.data.toString().substring(0, 200) : 'N/A'}`);
    }
    console.error(`Stack: ${error.stack}`);
  }
}

testTIFFParsing();
