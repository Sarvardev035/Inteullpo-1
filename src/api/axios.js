import axios from 'axios'

// IMPORTANT: On Vercel dashboard → Project Settings → Environment Variables
// Add VITE_API_BASE_URL = https://finly.uyqidir.uz
// Then redeploy. This is required because client-side Vite env vars need the VITE_ prefix.

// Use environment variable for API base URL
// In development: use '' so Vite proxy handles /api/* requests
// In production: use full backend URL from env var
const API_BASE_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://finly.uyqidir.uz')
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 10000

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: parseInt(API_TIMEOUT),
})

api.interceptors.request.use(
  (config) => {
    // Add bearer token to all requests if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // Log if token is missing for protected endpoints
      if (config.url && config.url.startsWith('/api/') && 
          !config.url.includes('/auth/') && 
          config.method !== 'get') {
        console.warn(`⚠️ [API WARNING] Token missing for ${config.method.toUpperCase()} ${config.url}`)
      }
    }
    
    // Validate Content-Type for POST/PUT requests
    if ((config.method === 'post' || config.method === 'put') && config.data) {
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json'
      }
    }
    
    // Debug logging - log every request for inspection
    console.log(`📡 [API REQUEST] ${config.method.toUpperCase()} ${config.url}`, {
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method.toUpperCase(),
      headers: config.headers,
      data: config.data || 'no body',
      params: config.params || 'no params',
      hasToken: !!token,
    })
    
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ [API SUCCESS] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
      endpoint: `${response.config.baseURL}${response.config.url}`,
    })
    return response
  },
  (error) => {
    // Enhanced error logging with all details for debugging
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      fullUrl: `${error.config?.baseURL}${error.config?.url}`,
      requestBody: error.config?.data ? JSON.parse(error.config?.data) : null,
      requestHeaders: error.config?.headers,
      responseBody: error.response?.data,
      responseHeaders: error.response?.headers,
      CORS: error.code === 'ERR_NETWORK' ? 'Possible CORS issue' : 'Not a CORS error',
      timeout: error.code === 'ECONNABORTED' ? 'Request timeout' : null,
    }
    
    // Detailed error logging
    if (error.response?.status === 400) {
      console.error(`❌ [API ERROR 400 - BAD REQUEST] ${error.message}`, {
        message: 'Invalid request body - check your fields match backend requirements',
        received: errorInfo.requestBody,
        backend_response: errorInfo.responseBody,
      })
    } else if (error.response?.status === 401) {
      console.error(`❌ [API ERROR 401 - UNAUTHORIZED] ${error.message}`, {
        message: 'Missing or invalid authentication token',
        hasToken: !!localStorage.getItem('token'),
      })
    } else if (error.response?.status === 403) {
      console.error(`❌ [API ERROR 403 - FORBIDDEN] ${error.message}`, {
        message: 'You do not have permission for this action',
      })
    } else if (error.response?.status === 404) {
      console.error(`❌ [API ERROR 404 - NOT FOUND] ${error.message}`, {
        message: 'Endpoint or resource not found',
        endpoint: errorInfo.fullUrl,
      })
    } else if (error.response?.status === 500) {
      console.error(`❌ [API ERROR 500 - SERVER ERROR] ${error.message}`, {
        message: 'Backend server error - likely invalid request format or missing required fields',
        sent: errorInfo.requestBody,
        response: errorInfo.responseBody,
      })
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      console.error(`❌ [API ERROR - NETWORK] ${error.message}`, {
        message: 'Network error or backend unreachable',
        possibleCORSerror: 'Check if backend allows cross-origin requests',
      })
    } else {
      console.error(`❌ [API ERROR] ${error.message}`, errorInfo)
    }
    
    // Handle 401 - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api
