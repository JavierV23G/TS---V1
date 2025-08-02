// ===================================
// 🧪 TEST DEVICE FINGERPRINTING
// Para testear desde la consola del navegador
// ===================================

import DeviceFingerprint from './DeviceFingerprint';

// Hacer disponible globalmente para tests
window.DeviceFingerprint = DeviceFingerprint;

// Test functions
window.testDeviceFingerprint = async () => {
  try {
    console.log('🧪 [TEST] Starting Device Fingerprint test...');
    
    const fp = await DeviceFingerprint.generate();
    
    console.log('🖥️ DEVICE FINGERPRINT:', fp);
    console.log('📊 Features detected:', Object.keys(fp).length);
    console.log('🔑 Hash:', fp.hash);
    console.log('🎯 User Agent:', fp.userAgent?.substring(0, 100) + '...');
    console.log('📺 Screen:', `${fp.screen.width}x${fp.screen.height}`);
    console.log('🌍 Timezone:', fp.timezone);
    console.log('🎨 Canvas available:', fp.canvas !== 'error');
    console.log('🎮 WebGL available:', fp.webgl !== 'not_supported');
    
    return fp;
  } catch (error) {
    console.error('❌ [TEST] Device fingerprint error:', error);
    return null;
  }
};

window.testFingerprintComparison = async () => {
  try {
    console.log('🧪 [TEST] Testing fingerprint comparison...');
    
    const [fp1, fp2] = await Promise.all([
      DeviceFingerprint.generate(),
      DeviceFingerprint.generate()
    ]);
    
    const similarity = DeviceFingerprint.compareFingerprints(fp1, fp2);
    
    console.log('🔍 Fingerprint 1 Hash:', fp1.hash);
    console.log('🔍 Fingerprint 2 Hash:', fp2.hash);
    console.log('📊 Similarity Score:', similarity + '%');
    
    if (similarity >= 90) {
      console.log('✅ [TEST] Fingerprints are highly similar (expected)');
    } else {
      console.log('⚠️ [TEST] Fingerprints differ more than expected');
    }
    
    return { fp1, fp2, similarity };
  } catch (error) {
    console.error('❌ [TEST] Comparison test error:', error);
    return null;
  }
};

window.testBotDetection = async () => {
  try {
    console.log('🧪 [TEST] Testing bot detection...');
    
    const fp = await DeviceFingerprint.generate();
    const isBot = DeviceFingerprint.isLikelyBot(fp);
    
    console.log('🤖 Is likely bot:', isBot);
    console.log('🎯 Bot indicators:', {
      webgl: fp.webgl === 'not_supported',
      canvas: fp.canvas === 'error',
      languages: fp.languages === '',
      plugins: !fp.plugins || fp.plugins.length === 0
    });
    
    return { isBot, fingerprint: fp };
  } catch (error) {
    console.error('❌ [TEST] Bot detection error:', error);
    return null;
  }
};

// Auto-run basic test on load
console.log('🧪 [TEST] Device Fingerprint Test Suite Loaded');
console.log('📝 Available commands:');
console.log('  - testDeviceFingerprint()');
console.log('  - testFingerprintComparison()');
console.log('  - testBotDetection()');
console.log('  - DeviceFingerprint (direct access)');

export default {
  testDeviceFingerprint: window.testDeviceFingerprint,
  testFingerprintComparison: window.testFingerprintComparison,
  testBotDetection: window.testBotDetection
};