// API Configuration
// Automatically detects environment and uses correct API URL

const getApiUrl = () => {
  // If we're on localhost, use local backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // If we're on production domain, use production API
  if (window.location.hostname === 'nuwendo.dev' || window.location.hostname === 'www.nuwendo.dev') {
    return 'https://api.nuwendo.dev';
  }
  
  // Default to localhost for any other case
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl() + '/api';
export const BASE_URL = getApiUrl();

console.log('🌐 API Configuration:', { 
  hostname: window.location.hostname, 
  API_URL, 
  BASE_URL 
});

console.log('🌐 API URL:', API_URL);
