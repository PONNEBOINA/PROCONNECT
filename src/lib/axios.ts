import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // This is important for sending cookies with cross-origin requests
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Helps identify AJAX requests
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to include the auth token and handle tokens
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from localStorage (works in incognito for the session)
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      // Add Authorization header if token exists
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // For non-GET requests, ensure we have a CSRF token
      if (config.method !== 'get' && config.method !== 'head') {
        // Try to get CSRF token from meta tag or cookie
        let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        if (!csrfToken && document.cookie) {
          const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
          csrfToken = match ? decodeURIComponent(match[1]) : null;
        }
        
        if (csrfToken) {
          config.headers['X-XSRF-TOKEN'] = csrfToken;
          config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
      }
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors and refresh tokens
api.interceptors.response.use(
  (response) => {
    // You can handle successful responses here if needed
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle token expiration (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          
          // Store the new tokens
          localStorage.setItem('token', token);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          // Update the Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Handle other errors
    if (error.response) {
      // Server responded with a status code outside 2xx
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
      
      // Handle specific status codes
      if (error.response.status === 403) {
        console.error('Forbidden: You do not have permission to access this resource');
      } else if (error.response.status === 404) {
        console.error('Resource not found');
      } else if (error.response.status >= 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
