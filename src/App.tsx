import React, { useState, useEffect, useRef } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { SheetData } from './types/sheets';
import SheetDisplay from './components/SheetDisplay';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const RANGE = 'Sheet1!A1:Z1000';
const POLLING_INTERVAL = 60 * 1000; // Poll every minute

declare global {
  interface Window {
    gapi: any;
  }
}

function App() {
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [gapiInited, setGapiInited] = useState(false);
  const pollingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!API_KEY) {
      setError('Missing API key. Please check your environment variables.');
      return;
    }

    if (!SHEET_ID) {
      setError('Missing Sheet ID. Please check your environment variables.');
      return;
    }

    // Load the Google API client library
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = initializeGapi;
    document.body.appendChild(gapiScript);

    return () => {
      if (gapiScript.parentNode) {
        gapiScript.parentNode.removeChild(gapiScript);
      }
      clearInterval(pollingIntervalRef.current!);
    };
  }, []);

  async function initializeGapi() {
    try {
      await window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          
          setGapiInited(true);
          startPolling();
        } catch (err) {
          console.error('Error initializing GAPI client:', err);
          setError('Failed to initialize Google API client. Please check your API key.');
        }
      });
    } catch (err) {
      console.error('Error loading GAPI:', err);
      setError('Error loading Google API. Please check your internet connection and try again.');
    }
  }

  const startPolling = () => {
    loadSheetData(); // Initial load
    // Start new polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    pollingIntervalRef.current = window.setInterval(loadSheetData, POLLING_INTERVAL);
  };

  async function loadSheetData() {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await window.gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: RANGE,
      });
      setSheetData({
        range: response.result.range,
        values: response.result.values || [],
      });
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching sheet data:', err);
      setError('Error loading sheet data. Please check your sheet permissions and make sure the sheet is shared publicly or with the service account.');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  }

  const formatLastUpdate = () => {
    if (!lastUpdate) return 'Never';
    return lastUpdate.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8 px-4">
          <FileSpreadsheet className="w-12 h-12 mx-auto text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Google Sheets Viewer</h1>
          <p className="mt-2 text-gray-600">
            View your Google Sheet data
          </p>
          {gapiInited && (
            <p className="mt-1 text-sm text-gray-500">
              Updates automatically every minute
            </p>
          )}
          {lastUpdate && (
            <p className="mt-1 text-xs text-gray-400">
              Last updated: {formatLastUpdate()}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-8 bg-red-50 p-4 rounded-md mx-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <SheetDisplay
            data={sheetData}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

export default App;