import api from './axios'
import { validatePayload, ENDPOINT_VALIDATION } from '../utils/apiValidation'

/**
 * Transfers API endpoints
 * Handles money transfers between accounts
 * All methods require Bearer token
 */
export const transfersApi = {
  /**
   * GET /api/transfers
   * Returns: Array of transfer transactions
   */
  getAll: () => api.get('/api/transfers'),

  /**
   * POST /api/transfers
   * Fields: fromAccountId (required), toAccountId (required), amount (required), date (required), description (optional)
   * Returns: Created transfer object
   */
  create: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.TRANSFER_CREATE, 'POST /api/transfers')
    return api.post('/api/transfers', validated)
  },
}

// Backward compatibility
export const getTransfers = async () => {
  const response = await transfersApi.getAll()
  return response.data
}

export const createTransfer = async (payload) => {
  const response = await transfersApi.create(payload)
  return response.data
}
