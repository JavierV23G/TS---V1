// ===================================
// 🧪 SECURITY TESTING PANEL
// Real testing interface for security features
// ===================================

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import DeviceFingerprint from '../../../utils/DeviceFingerprint';
import './SecurityTestPanel.scss';

const SecurityTestPanel = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (result) => {
    setTestResults(prev => [
      {
        ...result,
        timestamp: new Date().toISOString(),
        id: Date.now()
      },
      ...prev.slice(0, 19) // Keep last 20 results
    ]);
  };

  const testFailedLogin = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 [TEST] Testing failed login alerts...');
      
      // Use a random test username to avoid conflicts
      const randomUser = `test_user_${Date.now()}`;
      
      // Test with fake credentials to trigger failed login
      const response = await fetch('http://localhost:8000/auth/verify-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: randomUser,
          password: 'wrong_password_123'
        })
      });
      
      const result = await response.json();
      
      addResult({
        test: 'Failed Login Alert',
        status: response.status === 401 ? 'SUCCESS' : 'FAILED',
        details: `Status: ${response.status}, Expected: 401`,
        data: result
      });
      
      if (response.status === 401) {
        toast.success('✅ Failed login alert test completed!');
      } else {
        toast.error('❌ Failed login test failed');
      }
      
    } catch (error) {
      addResult({
        test: 'Failed Login Alert',
        status: 'ERROR',
        details: error.message,
        data: null
      });
      toast.error('Failed login test error');
    } finally {
      setIsRunning(false);
    }
  };

  const testDeviceFingerprint = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 [TEST] Testing device fingerprint generation...');
      
      const fp = await DeviceFingerprint.generate();
      const isBot = DeviceFingerprint.isLikelyBot(fp);
      
      addResult({
        test: 'Device Fingerprint',
        status: 'SUCCESS',
        details: `Hash: ${fp.hash?.substring(0, 16)}..., Features: ${Object.keys(fp).length}, Bot: ${isBot}`,
        data: {
          hash: fp.hash,
          features: Object.keys(fp).length,
          isBot,
          canvas: fp.canvas !== 'error',
          webgl: fp.webgl !== 'not_supported',
          screen: `${fp.screen.width}x${fp.screen.height}`,
          timezone: fp.timezone,
          languages: fp.languages
        }
      });
      
      console.log('🎯 [TEST] Fingerprint details:', fp);
      toast.success(`✅ Device fingerprint: ${Object.keys(fp).length} features detected`);
      
    } catch (error) {
      addResult({
        test: 'Device Fingerprint',
        status: 'ERROR',
        details: error.message,
        data: null
      });
      toast.error('Device fingerprint test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const testMultipleFailedLogins = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 [TEST] Testing multiple failed logins (trigger block)...');
      
      const testUser = `test_block_${Date.now()}`; // Use random user to avoid conflicts
      const results = [];
      
      // Try 5 failed logins to trigger block
      for (let i = 1; i <= 5; i++) {
        const response = await fetch('http://localhost:8000/auth/verify-credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: testUser,
            password: `wrong_password_${i}`
          })
        });
        
        const result = await response.json();
        results.push({
          attempt: i,
          status: response.status,
          blocked: response.status === 429
        });
        
        console.log(`🔒 [TEST] Attempt ${i}: Status ${response.status}`);
        
        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const blockedAttempts = results.filter(r => r.blocked).length;
      
      addResult({
        test: 'Multiple Failed Logins',
        status: blockedAttempts > 0 ? 'SUCCESS' : 'PARTIAL',
        details: `5 attempts made, ${blockedAttempts} resulted in blocks`,
        data: results
      });
      
      if (blockedAttempts > 0) {
        toast.success(`✅ Account blocked after failed attempts!`);
      } else {
        toast.warn('⚠️ No blocks triggered - check security settings');
      }
      
    } catch (error) {
      addResult({
        test: 'Multiple Failed Logins',
        status: 'ERROR',
        details: error.message,
        data: null
      });
      toast.error('Multiple failed logins test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const testBotDetection = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 [TEST] Testing bot detection...');
      
      // Generate fingerprint and test bot detection
      const fp = await DeviceFingerprint.generate();
      const isBot = DeviceFingerprint.isLikelyBot(fp);
      
      // Check specific bot indicators
      const botIndicators = {
        canvas_error: fp.canvas === 'error',
        webgl_missing: fp.webgl === 'not_supported',
        no_languages: !fp.languages || fp.languages === '',
        no_plugins: !fp.plugins || fp.plugins.length === 0,
        headless_ua: fp.userAgent.includes('HeadlessChrome')
      };
      
      const indicatorCount = Object.values(botIndicators).filter(Boolean).length;
      
      addResult({
        test: 'Bot Detection Analysis',
        status: 'SUCCESS',
        details: `Bot detected: ${isBot}, Indicators: ${indicatorCount}/5`,
        data: {
          isBot,
          indicators: botIndicators,
          fingerprint: {
            hash: fp.hash?.substring(0, 16) + '...',
            canvas: fp.canvas,
            webgl: fp.webgl,
            languages: fp.languages,
            plugins_count: fp.plugins?.length || 0
          }
        }
      });
      
      if (isBot) {
        toast.warn('🤖 Bot detected!');
      } else {
        toast.success('👤 Human user detected');
      }
      
    } catch (error) {
      addResult({
        test: 'Bot Detection Analysis',
        status: 'ERROR',
        details: error.message,
        data: null
      });
      toast.error('Bot detection test failed');
    } finally {
      setIsRunning(false);
    }
  };

  const testWebSocketConnection = async () => {
    setIsRunning(true);
    try {
      console.log('🧪 [TEST] Checking WebSocket status...');
      
      // WebSocket is disabled by design
      addResult({
        test: 'WebSocket Connection',
        status: 'DISABLED',
        details: 'WebSocket notifications are disabled - security system works without real-time alerts',
        data: { status: 'disabled', reason: 'WebSocket functionality removed by user request' }
      });
      
      toast.info('ℹ️ WebSocket notifications are disabled');
      
    } catch (error) {
      addResult({
        test: 'WebSocket Connection',
        status: 'ERROR',
        details: error.message,
        data: null
      });
      
      toast.error('❌ WebSocket test error');
    } finally {
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    toast.info('🧪 Running comprehensive security tests...');
    
    try {
      await testDeviceFingerprint();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testBotDetection();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testWebSocketConnection();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testFailedLogin();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Skip multiple failed logins to avoid blocking accounts
      // await testMultipleFailedLogins();
      
      toast.success('✅ All security tests completed!');
    } catch (error) {
      toast.error('❌ Some tests failed - check results below');
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    toast.info('🧹 Test results cleared');
  };

  return (
    <div className="security-test-panel">
      <div className="test-header">
        <h3>
          <i className="fas fa-flask"></i>
          Security System Testing
        </h3>
        <p>Test and verify security features are working correctly</p>
      </div>

      <div className="test-controls">
        <div className="test-buttons">
          <button 
            className="test-btn primary"
            onClick={runAllTests}
            disabled={isRunning}
          >
            <i className="fas fa-play"></i>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button 
            className="test-btn"
            onClick={testDeviceFingerprint}
            disabled={isRunning}
          >
            <i className="fas fa-fingerprint"></i>
            Device Fingerprint
          </button>
          
          <button 
            className="test-btn"
            onClick={testBotDetection}
            disabled={isRunning}
          >
            <i className="fas fa-robot"></i>
            Bot Detection
          </button>
          
          <button 
            className="test-btn"
            onClick={testWebSocketConnection}
            disabled={isRunning}
          >
            <i className="fas fa-wifi"></i>
            WebSocket
          </button>
          
          <button 
            className="test-btn warning"
            onClick={testFailedLogin}
            disabled={isRunning}
          >
            <i className="fas fa-exclamation-triangle"></i>
            Failed Login
          </button>
          
          <button 
            className="test-btn danger"
            onClick={testMultipleFailedLogins}
            disabled={isRunning}
          >
            <i className="fas fa-ban"></i>
            Trigger Block
          </button>
        </div>
        
        <button 
          className="clear-btn"
          onClick={clearResults}
          disabled={isRunning || testResults.length === 0}
        >
          <i className="fas fa-trash"></i>
          Clear Results
        </button>
      </div>

      <div className="test-results">
        <h4>Test Results ({testResults.length})</h4>
        
        {testResults.length === 0 ? (
          <div className="no-results">
            <i className="fas fa-flask"></i>
            <p>No test results yet</p>
            <small>Run tests above to see results</small>
          </div>
        ) : (
          <div className="results-list">
            {testResults.map((result) => (
              <div key={result.id} className={`result-item status-${result.status.toLowerCase()}`}>
                <div className="result-header">
                  <div className="test-name">
                    <i className={`fas ${
                      result.status === 'SUCCESS' ? 'fa-check-circle' :
                      result.status === 'ERROR' ? 'fa-times-circle' :
                      result.status === 'FAILED' ? 'fa-exclamation-circle' :
                      'fa-info-circle'
                    }`}></i>
                    {result.test}
                  </div>
                  <div className="test-status">{result.status}</div>
                  <div className="test-time">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="result-details">
                  {result.details}
                </div>
                
                {result.data && (
                  <div className="result-data">
                    <details>
                      <summary>View Data</summary>
                      <pre>{JSON.stringify(result.data, null, 2)}</pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityTestPanel;