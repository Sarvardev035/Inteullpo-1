import api from './axios'
import { validatePayload, ENDPOINT_VALIDATION } from '../utils/apiValidation'

/**
 * Debts API endpoints
 * Handles debt tracking (money you owe)
 * All methods require Bearer token
 */
export const debtsApi = {
  /**
   * GET /api/debts
   * Returns: Array of debt objects
   */
  getAll: () => api.get('/api/debts'),

  /**
   * POST /api/debts
   * Fields: amount (required), creditor (required), description (optional), dueDate (optional), status (optional)
   * Returns: Created debt object
   */
  create: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.DEBT_CREATE, 'POST /api/debts')
    return api.post('/api/debts', validated)
  },

  /**
   * PUT /api/debts/:id
   * Fields: amount, creditor, description, dueDate, status (all optional)
   * Returns: Updated debt object
   */
  update: (id, data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.DEBT_CREATE, `PUT /api/debts/${id}`)
    return api.put(`/api/debts/${id}`, validated)
  },

  /**
   * DELETE /api/debts/:id
   * Returns: { success: true }
   */
  delete: (id) => api.delete(`/api/debts/${id}`),

  /**
   * PUT /api/debts/:id
   * Closes/marks debt as paid by setting status to CLOSED
   * Returns: Updated debt object
   */
  close: (id) => api.put(`/api/debts/${id}`, { status: 'CLOSED' }),
}

// Backward compatibility
export const getDebts = async () => {
  const response = await debtsApi.getAll()
  return response.data
}

export const createDebt = async (payload) => {
  const response = await debtsApi.create(payload)
  return response.data
}

export const updateDebt = async (id, payload) => {
  const response = await debtsApi.update(id, payload)
  return response.data
}

export const removeDebt = async (id) => {
  const response = await debtsApi.delete(id)
  return response.data
}
