'use client';

import { useState } from 'react';

export default function TestFacebookLogin() {
  const [loginUrl, setLoginUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const getLoginUrl = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/facebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'get_login_url' }),
      });

      const data = await response.json();
      
      if (response.ok && data.loginUrl) {
        setLoginUrl(data.loginUrl);
      } else {
        setError(data.error || 'Failed to get login URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Facebook Login</h1>
      
      <div className="space-y-4">
        <button
          onClick={getLoginUrl}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Get Facebook Login URL'}
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error: {error}
          </div>
        )}

        {loginUrl && (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Login URL generated successfully!
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Login URL:</label>
              <textarea
                value={loginUrl}
                readOnly
                className="w-full p-2 border rounded text-sm font-mono"
                rows={3}
              />
            </div>
            
            <a
              href={loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Open Facebook Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}