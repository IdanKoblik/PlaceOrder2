# API Configuration

This directory contains configuration files for managing API connections and settings.

## Files

### `api.ts`
Main configuration file for API settings including:
- Backend base URL
- API endpoints
- Request timeouts
- Default headers
- Environment-specific configurations

## Usage

### Basic Usage
```typescript
import { buildApiUrl, API_ENDPOINTS } from '../config/api';

// Build a complete API URL
const url = buildApiUrl(API_ENDPOINTS.RESERVATIONS);
// Result: http://localhost:3000/api/v1/reservations
```

### Environment Configuration
The configuration automatically adapts based on the environment:
- **Development**: Uses `http://localhost:3000`
- **Production**: Uses the same origin as the frontend

### Customizing Backend URL

#### Method 1: Edit the config file directly
Edit `frontend/src/config/api.ts` and change the `BASE_URL`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-backend-domain.com', // Change this
  // ... rest of config
};
```

#### Method 2: Use environment variables (recommended)
1. Create a `.env` file in the frontend directory:
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

2. Update the config to use environment variables:
```typescript
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  // ... rest of config
};
```

## Available Endpoints

- `RESERVATIONS`: `/reservations`
- `TABLES`: `/tables`
- `VERIFY_PASSWORD`: `/verify-password`

## Configuration Options

- `BASE_URL`: Backend server URL
- `API_PREFIX`: API version prefix (default: `/api/v1`)
- `TIMEOUT`: Request timeout in milliseconds
- `DEFAULT_HEADERS`: Headers sent with every request

## Environment Variables

Create a `.env` file in the frontend directory with these variables:

```bash
# Required
VITE_API_BASE_URL=http://localhost:3000

# Optional
VITE_API_PREFIX=/api/v1
VITE_API_TIMEOUT=10000
```

## Examples

### Different environments:
```typescript
// Development
const devConfig = {
  BASE_URL: 'http://localhost:3000'
};

// Staging
const stagingConfig = {
  BASE_URL: 'https://api-staging.yourapp.com'
};

// Production
const prodConfig = {
  BASE_URL: 'https://api.yourapp.com'
};
```

### Custom headers:
```typescript
const customConfig = {
  ...API_CONFIG,
  DEFAULT_HEADERS: {
    ...API_CONFIG.DEFAULT_HEADERS,
    'Authorization': 'Bearer your-token',
    'X-Custom-Header': 'value'
  }
};
```