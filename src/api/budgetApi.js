import api from './axios'
import { validatePayload, ENDPOINT_VALIDATION } from '../utils/apiValidation'

/**
 * Budget API endpoints
 * Handles budget configuration and category limits
 * All methods require Bearer token
 */
export const budgetApi = {
  /**
   * GET /api/budget
   * Returns: Overall budget configuration
   */
  get: () => api.get('/api/budget'),

  /**
   * POST /api/budget
   * Fields: limit (required), period (optional: monthly, quarterly, yearly)
   * Returns: Budget configuration object
   */
  set: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.BUDGET_CREATE, 'POST /api/budget')
    return api.post('/api/budget', validated)
  },

  /**
   * GET /api/budget/categories
   * Returns: Array of budget categories with limits
   */
  getCategories: () => api.get('/api/budget/categories'),

  /**
   * POST /api/budget/categories
   * Fields: category (required), limit (required)
   * Returns: Created budget category object
   */
  setCategory: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.BUDGET_CATEGORY_CREATE, 'POST /api/budget/categories')
    return api.post('/api/budget/categories', validated)
  },
}

// Backward compatibility
export const getBudget = async () => {
  const response = await budgetApi.get()
  return response.data
}

export const setBudget = async (payload) => {
  const response = await budgetApi.set(payload)
  return response.data
}

export const getBudgetCategories = async () => {
  const response = await budgetApi.getCategories()
  return response.data
}

export const setBudgetCategory = async (payload) => {
  const response = await budgetApi.setCategory(payload)
  return response.data
}
