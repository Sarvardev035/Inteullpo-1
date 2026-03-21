import api from './axios'

/**
 * Statistics API endpoints
 * Handles financial statistics and reports
 * All methods require Bearer token
 */
export const statsApi = {
  /**
   * GET /api/statistics/expenses
   * Query params: period (required: month, quarter, year)
   * Returns: Expense statistics for the period
   */
  expenses: (period) => api.get('/api/statistics/expenses', { params: { period } }),

  /**
   * GET /api/statistics/income
   * Query params: period (required: month, quarter, year)
   * Returns: Income statistics for the period
   */
  income: (period) => api.get('/api/statistics/income', { params: { period } }),

  /**
   * GET /api/statistics/category-breakdown
   * Returns: Expense breakdown by category
   */
  breakdown: () => api.get('/api/statistics/category-breakdown'),

  /**
   * GET /api/statistics/income-vs-expense
   * Returns: Comparison of income vs expenses over time
   */
  vsIncome: () => api.get('/api/statistics/income-vs-expense'),
}

// Backward compatibility
export const getExpenseStats = async (period) => {
  const response = await statsApi.expenses(period)
  return response.data
}

export const getIncomeStats = async (period) => {
  const response = await statsApi.income(period)
  return response.data
}

export const getCategoryBreakdown = async () => {
  const response = await statsApi.breakdown()
  return response.data
}

export const getIncomeVsExpense = async (period) => {
  const response = await statsApi.vsIncome()
  return response.data
}
