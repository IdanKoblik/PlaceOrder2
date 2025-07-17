// API Configuration
export const API_CONFIG = {
  // Backend base URL - adjust this to match your backend server
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://papi.idank.dev',
  
  // API version prefix
  API_PREFIX: import.meta.env.VITE_API_PREFIX || '/api/v1',
  
  // Request timeout in milliseconds
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  
  // Default headers for all requests
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/${cleanEndpoint}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  RESERVATIONS: 'reservations',
  TABLES: 'tables',
  CONFIG: 'config',
  VERIFY_PASSWORD: 'verify-password',
} as const;

// Environment-specific configurations
export const getApiConfig = () => {
  // You can add environment-specific logic here
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;
  
  if (isDevelopment) {
    return {
      ...API_CONFIG,
      BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://papi.idank.dev', // Development server
    };
  }
  
  if (isProduction) {
    return {
      ...API_CONFIG,
      BASE_URL: import.meta.env.VITE_API_BASE_URL || window.location.origin, // Use same origin in production
    };
  }
  
  return API_CONFIG;
};
