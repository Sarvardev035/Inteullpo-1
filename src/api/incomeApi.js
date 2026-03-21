import api from './axios'
import { validatePayload, ENDPOINT_VALIDATION } from '../utils/apiValidation'

/**
 * Income API endpoints
 * Handles income transaction management
 * All methods require Bearer token
 */
export const incomeApi = {
  /**
   * GET /api/income
   * Query params: period, category, accountId (all optional)
   * Returns: Array of income transactions
   */
  getAll: (params) => api.get('/api/income', { params }),

  /**
   * POST /api/income
   * Fields: amount (required), category (required), date (required), description (optional), accountId (optional)
   * Returns: Created income object
   */
  create: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.INCOME_CREATE, 'POST /api/income')
    return api.post('/api/income', validated)
  },

  /**
   * PUT /api/income/:id
   * Fields: amount, category, date, description (all optional)
   * Returns: Updated income object
   */
  update: (id, data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.INCOME_CREATE, `PUT /api/income/${id}`)
    return api.put(`/api/income/${id}`, validated)
  },

  /**
   * DELETE /api/income/:id
   * Returns: { success: true }
   */
  delete: (id) => api.delete(`/api/income/${id}`),
}

// Backward compatibility
export const getIncome = async (params = {}) => {
  const response = await incomeApi.getAll(params)
  return response.data
}

export const createIncome = async (payload) => {
  const response = await incomeApi.create(payload)
  return response.data
}

export const updateIncome = async (id, payload) => {
  const response = await incomeApi.update(id, payload)
  return response.data
}

export const removeIncome = async (id) => {
  const response = await incomeApi.delete(id)
  return response.data
}
