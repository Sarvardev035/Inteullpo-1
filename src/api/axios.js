import axios from 'axios'

// IMPORTANT: On Vercel dashboard → Project Settings → Environment Variables
// Add VITE_API_BASE_URL = https://finly.uyqidir.uz
// Then redeploy. This is required because client-side Vite env vars need the VITE_ prefix.

// Use environment variable for API base URL, fallback to production URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://finly.uyqidir.uz'
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
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Debug logging - log every request for inspection
    console.log(`📡 [API REQUEST] ${config.method.toUpperCase()} ${config.url}`, {
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method.toUpperCase(),
      headers: config.headers,
      data: config.data || 'no body',
      params: config.params || 'no params',
    })
    
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log(`✅ [API SUCCESS] ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`, {
      data: response.data,
    })
    return response
  },
  (error) => {
    // Enhanced error logging
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      fullUrl: error.config?.baseURL + error.config?.url,
      CORS: error.code === 'ERR_NETWORK' ? 'Possible CORS issue' : 'Not a CORS error',
      headers: error.response?.headers,
      data: error.response?.data,
    }
    
    console.error(`❌ [API ERROR] ${error.message}`, errorInfo)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api
