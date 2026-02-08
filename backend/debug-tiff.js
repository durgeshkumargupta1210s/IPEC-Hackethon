/**
 * TIFF Diagnostic Tool
 * Examines the actual structure of Sentinel Hub TIFF response
 */

const axios = require('axios');
const { getAccessToken } = require('./src/services/sentinelHubOAuth');

async function diagnoseTIFF() {
  try {
    console.log('🔍 Starting TIFF Diagnostic...\n');

    const token = await getAccessToken();
    const PROCESS_URL = 'https://services.sentinel-hub.com/api/v1/process';

    const requestBody = {
      input: {
        bounds: {
          bbox: [34.5, -3, 35, -2.5]  // Serengeti Plains
        },
        data: [{
          type: 'sentinel-2-l2a',
          dataFilter: {
            timeRange: {
              from: '2026-01-24T00:00:00Z',
              to: '2026-02-08T23:59:59Z'
            },
            maxCloudCoverage: 100
          }
        }]
      },
      output: {
        width: 256,
        height: 256,
        responses: [{
          identifier: 'default',
          format: {
            type: 'image/tiff'
          }
        }]
      },
      evalscript: `
        //VERSION=3
        function setup() {
          return {
            input: [{
              bands: ["B04", "B08"]
            }],
            output: {
              bands: 2,
              sampleType: "FLOAT32"
            }
          };
        }
        
        function evaluatePixel(sample) {
          return [sample.B04 / 10000.0, sample.B08 / 10000.0];
        }
      `
    };

    console.log('📡 Fetching TIFF from Sentinel Hub...');
    const response = await axios.post(PROCESS_URL, requestBody, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'image/tiff'
      },
      timeout: 30000,
      responseType: 'arraybuffer',
      validateStatus: function(status) {
        return true; // Don't throw on any status
      }
    });

    console.log(`Response Status: ${response.status}`);
    console.log(`Response Headers:`, response.headers);

    let buffer = response.data;
    
    // Ensure we have a proper Buffer
    if (!Buffer.isBuffer(buffer)) {
      buffer = Buffer.from(buffer);
    }
    
    // Check if it's actually an error response (HTML instead of TIFF)
    const firstBytes = buffer.slice(0, 20).toString('ascii');
    if (firstBytes.includes('<!') || firstBytes.includes('<html') || firstBytes.includes('<?xml')) {
      console.log('❌ ERROR: Received HTML response instead of TIFF!');
      console.log(`Response content (first 2000 chars):\n`);
      console.log(buffer.toString('utf-8').slice(0, 2000));
      process.exit(1);
    }
    
    console.log(`✅ Received buffer: ${buffer.length} bytes (type: ${buffer.constructor.name})\n`);

    // === EXAMINE TIFF HEADER ===
    console.log('📋 TIFF HEADER ANALYSIS:');
    console.log('─'.repeat(50));

    // Check magic bytes
    const byteOrder = buffer.slice(0, 2).toString('ascii');
    console.log(`Byte order: "${byteOrder}" (${byteOrder === 'II' ? 'little-endian' : byteOrder === 'MM' ? 'big-endian' : 'UNKNOWN'})`);

    // Read magic number
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.length);
    const isLittleEndian = byteOrder === 'II';
    const magic = view.getUint16(2, isLittleEndian);
    console.log(`Magic number: ${magic} (${magic === 42 ? '✅ valid TIFF' : '❌ NOT TIFF'} - should be 42)`);

    // Read offset to first IFD
    const ifdOffset = view.getUint32(4, isLittleEndian);
    console.log(`First IFD offset: ${ifdOffset}`);
    console.log(`IFD exists in buffer: ${ifdOffset < buffer.length ? '✅' : '❌'}\n`);

    // === EXAMINE IFD (Image File Directory) ===
    console.log('📊 IFD ANALYSIS:');
    console.log('─'.repeat(50));

    let offset = ifdOffset;
    let ifdNumber = 0;

    while (offset < buffer.length && ifdNumber < 10) {
      if (offset + 2 > buffer.length) break;

      const entryCount = view.getUint16(offset, isLittleEndian);
      console.log(`\n📍 IFD #${ifdNumber} at offset ${offset}:`);
      console.log(`   Entries: ${entryCount}`);

      // Read important tags
      const tags = {};
      for (let i = 0; i < Math.min(entryCount, 20); i++) {
        const entryOffset = offset + 2 + (i * 12);
        if (entryOffset + 12 > buffer.length) break;

        const tag = view.getUint16(entryOffset, isLittleEndian);
        const type = view.getUint16(entryOffset + 2, isLittleEndian);
        const count = view.getUint32(entryOffset + 4, isLittleEndian);
        const valueOffset = entryOffset + 8;

        let value = null;
        const tagNames = {
          0x0100: 'ImageWidth',
          0x0101: 'ImageLength',
          0x0102: 'BitsPerSample',
          0x0103: 'Compression',
          0x0106: 'PhotometricInterpretation',
          0x0111: 'StripOffsets',
          0x0115: 'SamplesPerPixel',
          0x0116: 'RowsPerStrip',
          0x0117: 'StripByteCounts',
          0x011A: 'XResolution',
          0x011B: 'YResolution',
          0x0128: 'ResolutionUnit',
          0x012F: 'Software',
          0x0131: 'DateTime',
        };

        if (type === 3 && tag !== 0x0112) { // SHORT except for Orientation
          value = view.getUint16(valueOffset, isLittleEndian);
        } else if (type === 4) { // LONG
          value = view.getUint32(valueOffset, isLittleEndian);
        } else if (type === 5) { // RATIONAL
          value = view.getUint32(valueOffset, isLittleEndian) + '/' + view.getUint32(valueOffset + 4, isLittleEndian);
        }

        if (value !== null) {
          tags[tag] = { name: tagNames[tag] || `Tag0x${tag.toString(16)}`, value, type };
          console.log(`   [0x${tag.toString(16).padStart(4, '0')}] ${tags[tag].name}: ${value} (type: ${type})`);
        }
      }

      // Next IFD offset
      const nextIFDOffset = offset + 2 + (entryCount * 12);
      if (nextIFDOffset + 4 > buffer.length) break;

      offset = view.getUint32(nextIFDOffset, isLittleEndian);
      ifdNumber++;

      if (offset === 0) {
        console.log(`   Next IFD: None (end of chain)`);
        break;
      } else {
        console.log(`   Next IFD: offset ${offset}`);
      }
    }

    // === EXAMINE DATA SECTION ===
    console.log('\n\n📦 DATA SECTION ANALYSIS:');
    console.log('─'.repeat(50));

    // Try to find strip offsets from tags
    if (ifdOffset + 2 <= buffer.length) {
      const entryCount = view.getUint16(ifdOffset, isLittleEndian);

      // Look for StripOffsets (0x0111)
      console.log('\nSearching for data strips...');
      for (let i = 0; i < entryCount; i++) {
        const entryOffset = ifdOffset + 2 + (i * 12);
        const tag = view.getUint16(entryOffset, isLittleEndian);

        if (tag === 0x0111) { // StripOffsets
          const valueOffset = entryOffset + 8;
          const stripOffset = view.getUint32(valueOffset, isLittleEndian);
          console.log(`✅ Found StripOffsets: ${stripOffset}`);

          // Look for StripByteCounts
          for (let j = 0; j < entryCount; j++) {
            const countEntryOffset = ifdOffset + 2 + (j * 12);
            const countTag = view.getUint16(countEntryOffset, isLittleEndian);

            if (countTag === 0x0117) { // StripByteCounts
              const countValueOffset = countEntryOffset + 8;
              const stripBytes = view.getUint32(countValueOffset, isLittleEndian);
              console.log(`✅ Found StripByteCounts: ${stripBytes} bytes`);
              console.log(`   Data range: bytes ${stripOffset}-${stripOffset + stripBytes}`);
              console.log(`   Data available: ${stripOffset + stripBytes <= buffer.length ? '✅' : '❌'}`);

              // Examine compression
              for (let k = 0; k < entryCount; k++) {
                const compEntryOffset = ifdOffset + 2 + (k * 12);
                const compTag = view.getUint16(compEntryOffset, isLittleEndian);

                if (compTag === 0x0103) { // Compression
                  const compValueOffset = compEntryOffset + 8;
                  const compression = view.getUint16(compValueOffset, isLittleEndian);
                  const compNames = { 1: 'None', 2: 'CCITT G3', 3: 'CCITT G4', 4: 'LZW', 5: 'JPEG', 6: 'JPEG', 7: 'JPEG', 32773: 'PackBits' };
                  console.log(`✅ Compression: ${compNames[compression] || `Unknown(${compression})`}`);

                  if (compression === 5 || compression === 6 || compression === 7) {
                    console.log(`   ⚠️  Data is JPEG compressed - needs decompression!`);
                  } else if (compression === 4) {
                    console.log(`   ⚠️  Data is LZW compressed - needs decompression!`);
                  }
                }
              }

              break;
            }
          }
          break;
        }
      }
    }

    // === HEX DUMP OF START ===
    console.log('\n\n🔍 HEX DUMP (first 256 bytes):');
    console.log('─'.repeat(50));

    let hexOutput = '';
    for (let i = 0; i < Math.min(256, buffer.length); i++) {
      hexOutput += buffer[i].toString(16).padStart(2, '0').toUpperCase();
      if ((i + 1) % 16 === 0) {
        hexOutput += '\n';
      } else {
        hexOutput += ' ';
      }
    }
    console.log(hexOutput);

    // === CHECK FOR FLOAT32 SEQUENCES ===
    console.log('\n\n🔢 FLOAT32 SEQUENCE CHECK:');
    console.log('─'.repeat(50));

    const floatCountsByAlignment = [0, 0, 0, 0];
    const validFloatsByAlignment = [[], [], [], []];

    for (let alignment = 0; alignment < 4; alignment++) {
      let consecutiveCount = 0;
      for (let i = alignment; i <= buffer.length - 4; i += 4) {
        try {
          const float = view.getFloat32(i, true);
          if (Number.isFinite(float)) {
            if (Math.abs(float) < 10000) {
              consecutiveCount++;
              if (validFloatsByAlignment[alignment].length < 10) {
                validFloatsByAlignment[alignment].push({ offset: i, value: float });
              }
            }
          }
        } catch (e) {}
      }
      floatCountsByAlignment[alignment] = consecutiveCount;
    }

    floatCountsByAlignment.forEach((count, alignment) => {
      console.log(`Alignment ${alignment}: ${count} valid finite floats < 10000`);
      if (validFloatsByAlignment[alignment].length > 0) {
        console.log(`   Sample values (first 10):`);
        validFloatsByAlignment[alignment].forEach(({ offset, value }) => {
          console.log(`     @${offset}: ${value.toFixed(6)}`);
        });
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnoseTIFF();
