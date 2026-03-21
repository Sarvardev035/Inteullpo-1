import api from './axios'
import { validatePayload, ENDPOINT_VALIDATION } from '../utils/apiValidation'

/**
 * Accounts API endpoints
 * Handles user bank accounts / wallet management
 * All methods require Bearer token in Authorization header
 */
export const accountsApi = {
  /**
   * GET /api/accounts
   * Requires: Bearer token
   * Returns: Array of account objects
   */
  getAll: () => api.get('/api/accounts'),

  /**
   * POST /api/accounts
   * Requires: Bearer token
   * Fields: name, type (CHECKING/SAVINGS), currency (UZS/USD/EUR), initialBalance
   * Returns: Created account object
   */
  create: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.ACCOUNT_CREATE, 'POST /api/accounts')
    return api.post('/api/accounts', validated)
  },

  /**
   * PUT /api/accounts/:id
   * Requires: Bearer token
   * Fields: name, type, currency, initialBalance (all optional)
   * Returns: Updated account object
   */
  update: (id, data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.ACCOUNT_UPDATE, `PUT /api/accounts/${id}`)
    return api.put(`/api/accounts/${id}`, validated)
  },

  /**
   * DELETE /api/accounts/:id
   * Requires: Bearer token
   * Returns: { success: true }
   */
  delete: (id) => api.delete(`/api/accounts/${id}`),
}

// Backward compatibility
export const getAccounts = async () => {
  const response = await accountsApi.getAll()
  return response.data
}

export const createAccount = async (payload) => {
  const response = await accountsApi.create(payload)
  return response.data
}

export const updateAccount = async (id, payload) => {
  const response = await accountsApi.update(id, payload)
  return response.data
}

export const removeAccount = async (id) => {
  const response = await accountsApi.delete(id)
  return response.data
}
