import React, { useState } from 'react';

interface ApiTestPanelProps {
  selectedCity: string;
  selectedDay: string;
}

const ApiTestPanel: React.FC<ApiTestPanelProps> = ({ selectedCity, selectedDay }) => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);

    try {
      const dayNumber = selectedDay === 'oggi' ? new Date().getDate() : 
                       selectedDay === 'domani' ? new Date().getDate() + 1 : 
                       parseInt(selectedDay);

      const response = await fetch(`/api/meteo?city=${encodeURIComponent(selectedCity.toLowerCase())}&day=${dayNumber}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔧 Debug API
        </h3>
        <button
          onClick={testApi}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <strong>City:</strong> {selectedCity}
        </div>
        <div>
          <strong>Day:</strong> {selectedDay}
        </div>
        <div>
          <strong>API URL:</strong> /api/meteo?city={selectedCity.toLowerCase()}&day={
            selectedDay === 'oggi' ? new Date().getDate() : 
            selectedDay === 'domani' ? new Date().getDate() + 1 : 
            parseInt(selectedDay)
          }
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-red-700 dark:text-red-300 font-medium">❌ Errore:</div>
          <div className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</div>
        </div>
      )}

      {testResult && (
        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="text-green-700 dark:text-green-300 font-medium mb-2">✅ Risposta API:</div>
          <pre className="text-xs text-green-600 dark:text-green-400 overflow-x-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestPanel;
