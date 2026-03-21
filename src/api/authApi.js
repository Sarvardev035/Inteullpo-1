import api from './axios'
import { validatePayload, ENDPOINT_VALIDATION } from '../utils/apiValidation'

/**
 * Authentication API endpoints
 * Handles user login, registration, and logout
 */
export const authApi = {
  /**
   * POST /api/auth/login
   * Required fields: email, password
   * Returns: { token, user }
   */
  login: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.LOGIN, 'POST /api/auth/login')
    return api.post('/api/auth/login', validated)
  },

  /**
   * POST /api/auth/register
   * Required fields: email, password
   * Optional fields: name, confirmPassword
   * Returns: { token, user }
   */
  register: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.REGISTER, 'POST /api/auth/register')
    return api.post('/api/auth/register', validated)
  },

  /**
   * POST /api/auth/logout
   * Requires: Bearer token in Authorization header
   * Returns: { success: true }
   */
  logout: () => api.post('/api/auth/logout'),
}
