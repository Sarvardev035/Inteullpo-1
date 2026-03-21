import api from './axios'
import { validatePayload, ENDPOINT_VALIDATION } from '../utils/apiValidation'

/**
 * Expenses API endpoints
 * Handles expense transaction management
 * All methods require Bearer token
 */
export const expensesApi = {
  /**
   * GET /api/expenses
   * Query params: period, category, accountId (all optional)
   * Returns: Array of expense transactions
   */
  getAll: (params) => api.get('/api/expenses', { params }),

  /**
   * POST /api/expenses
   * Fields: amount (required), category (required), date (required), description (optional), accountId (optional)
   * Returns: Created expense object
   */
  create: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.EXPENSE_CREATE, 'POST /api/expenses')
    return api.post('/api/expenses', validated)
  },

  /**
   * PUT /api/expenses/:id
   * Fields: amount, category, date, description (all optional)
   * Returns: Updated expense object
   */
  update: (id, data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.EXPENSE_CREATE, `PUT /api/expenses/${id}`)
    return api.put(`/api/expenses/${id}`, validated)
  },

  /**
   * DELETE /api/expenses/:id
   * Returns: { success: true }
   */
  delete: (id) => api.delete(`/api/expenses/${id}`),
}

// Backward compatibility
export const getExpenses = async (params = {}) => {
  const response = await expensesApi.getAll(params)
  return response.data
}

export const createExpense = async (payload) => {
  const response = await expensesApi.create(payload)
  return response.data
}

export const updateExpense = async (id, payload) => {
  const response = await expensesApi.update(id, payload)
  return response.data
}

export const removeExpense = async (id) => {
  const response = await expensesApi.delete(id)
  return response.data
}
