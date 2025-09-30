// PHP API Configuration
// Update this URL to match your PHP backend location
export const API_BASE_URL = 'http://localhost/api';

// API endpoints
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login.php`,
    logout: `${API_BASE_URL}/auth/logout.php`,
    session: `${API_BASE_URL}/auth/session.php`,
  },
  quotations: `${API_BASE_URL}/quotations/index.php`,
  invoices: `${API_BASE_URL}/invoices/index.php`,
  users: `${API_BASE_URL}/users/index.php`,
  clients: `${API_BASE_URL}/clients/index.php`,
};

// Fetch wrapper with credentials
export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};
