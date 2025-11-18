'use client';

import { useState, useEffect } from 'react';

export default function TestSocialMediaService() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<any[]>([]);

  useEffect(() => {
    // Test if we can access the social media service from the browser
    if (typeof window !== 'undefined') {
      testBrowserFunctionality();
    }
  }, []);

  const testBrowserFunctionality = async () => {
    try {
      setStatus('Testing browser functionality...');
      
      // Test 1: Check if localStorage is available
      const testKey = 'test_social_media';
      localStorage.setItem(testKey, 'test_value');
      const testValue = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (testValue === 'test_value') {
        setStatus('✅ localStorage is working');
      } else {
        setStatus('❌ localStorage test failed');
        return;
      }

      // Test 2: Test Facebook login URL generation via API
      setStatus('Testing Facebook login URL generation...');
      
      const response = await fetch('/api/test-facebook-login');
      const data = await response.json();
      
      if (data.success && data.loginUrl) {
        setStatus('✅ Facebook login URL generated successfully');
        
        // Test 3: Test environment configuration
        if (data.appId && data.appId !== 'not_set') {
          setStatus('✅ Facebook app is properly configured');
        } else {
          setStatus('⚠️ Facebook app ID not configured');
        }
        
        // Test 4: Test OAuth callback endpoint
        setStatus('Testing OAuth callback endpoint...');
        const oauthResponse = await fetch('/api/auth/facebook');
        
        if (oauthResponse.status === 307 || oauthResponse.status === 302) {
          setStatus('✅ OAuth callback endpoint is accessible');
        } else {
          setStatus('❌ OAuth callback endpoint issue');
        }
        
      } else {
        setStatus(`❌ Facebook login URL generation failed: ${data.error}`);
      }
      
    } catch (error) {
      setStatus(`❌ Browser test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testFacebookConnection = async () => {
    setLoading(true);
    try {
      // Open Facebook login in a new window
      const response = await fetch('/api/test-facebook-login');
      const data = await response.json();
      
      if (data.success && data.loginUrl) {
        window.open(data.loginUrl, 'facebook-login', 'width=600,height=600');
        setStatus('🔄 Facebook login window opened. Check if connection succeeds.');
      } else {
        setStatus('❌ Failed to get Facebook login URL');
      }
    } catch (error) {
      setStatus(`❌ Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Social Media Service</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Current Status:</h2>
          <p className="text-sm">{status || 'Initializing...'}</p>
        </div>

        <button
          onClick={testFacebookConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Facebook Connection'}
        </button>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">Test Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Click "Test Facebook Connection" to open the login window</li>
            <li>Log in to your Facebook account</li>
            <li>Grant the requested permissions</li>
            <li>You should be redirected back to the admin dashboard</li>
            <li>Check the admin dashboard for your connected pages</li>
          </ol>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">Expected Behavior:</h3>
          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
            <li>Facebook login window should open successfully</li>
            <li>You should see your Facebook pages after authorization</li>
            <li>Messages from your pages should appear in the admin dashboard</li>
            <li>Webhook validation is not required for basic functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
}