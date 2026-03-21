/**
 * API Request Validation Utilities
 * Validates request payloads match backend expectations
 */

/**
 * Validates that all required fields are present in the request body
 * @param {Object} data - The request payload
 * @param {Array<string>} requiredFields - List of required field names
 * @param {string} endpoint - Endpoint name for error messages
 * @throws {Error} If required fields are missing
 */
export const validateRequiredFields = (data, requiredFields, endpoint) => {
  const missing = requiredFields.filter(field => 
    data[field] === undefined || data[field] === null || data[field] === ''
  )
  
  if (missing.length > 0) {
    throw new Error(
      `Invalid request for ${endpoint}: Missing required fields - ${missing.join(', ')}`
    )
  }
}

/**
 * Validates that fields have the correct data types
 * @param {Object} data - The request payload
 * @param {Object} typeMap - Map of field names to expected types (e.g., {amount: 'number'})
 * @param {string} endpoint - Endpoint name for error messages
 * @throws {Error} If field types don't match
 */
export const validateFieldTypes = (data, typeMap, endpoint) => {
  Object.entries(typeMap).forEach(([field, expectedType]) => {
    if (data[field] === undefined || data[field] === null) return
    
    const actualType = typeof data[field]
    const isArray = Array.isArray(data[field])
    
    if (expectedType === 'array' && !isArray) {
      throw new Error(`Invalid request for ${endpoint}: Field "${field}" must be an array`)
    }
    
    if (expectedType !== 'array' && actualType !== expectedType) {
      throw new Error(
        `Invalid request for ${endpoint}: Field "${field}" must be ${expectedType}, got ${actualType}`
      )
    }
  })
}

/**
 * Validates numeric fields are non-negative
 * @param {Object} data - The request payload
 * @param {Array<string>} numericFields - List of field names that should be numeric
 * @param {string} endpoint - Endpoint name for error messages
 * @throws {Error} If numeric fields are negative
 */
export const validatePositiveNumbers = (data, numericFields, endpoint) => {
  numericFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null) {
      const num = Number(data[field])
      if (isNaN(num)) {
        throw new Error(`Invalid request for ${endpoint}: Field "${field}" must be a number`)
      }
      if (num < 0) {
        throw new Error(`Invalid request for ${endpoint}: Field "${field}" cannot be negative`)
      }
    }
  })
}

/**
 * Sanitizes data by removing undefined/null/empty string values
 * Helps prevent "missing required fields" errors from extra properties
 * @param {Object} data - The request payload
 * @param {Array<string>} allowedFields - List of fields to keep
 * @returns {Object} Cleaned payload
 */
export const sanitizePayload = (data, allowedFields) => {
  const clean = {}
  allowedFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      clean[field] = data[field]
    }
  })
  return clean
}

/**
 * Common endpoint validation rules
 */
export const ENDPOINT_VALIDATION = {
  LOGIN: {
    required: ['email', 'password'],
    types: { email: 'string', password: 'string' },
    allowed: ['email', 'password'],
  },
  REGISTER: {
    required: ['email', 'password'],
    types: { email: 'string', password: 'string' },
    allowed: ['email', 'password', 'name', 'confirmPassword'],
  },
  ACCOUNT_CREATE: {
    required: ['name', 'type', 'currency', 'initialBalance'],
    types: { name: 'string', type: 'string', currency: 'string', initialBalance: 'number' },
    positiveNumbers: ['initialBalance'],
    allowed: ['name', 'type', 'currency', 'initialBalance'],
  },
  ACCOUNT_UPDATE: {
    required: [],
    types: { name: 'string', type: 'string', currency: 'string', initialBalance: 'number' },
    positiveNumbers: ['initialBalance'],
    allowed: ['name', 'type', 'currency', 'initialBalance'],
  },
  EXPENSE_CREATE: {
    required: ['amount', 'category', 'date'],
    types: { amount: 'number', category: 'string', date: 'string', description: 'string' },
    positiveNumbers: ['amount'],
    allowed: ['amount', 'category', 'description', 'date', 'accountId', 'tags'],
  },
  INCOME_CREATE: {
    required: ['amount', 'category', 'date'],
    types: { amount: 'number', category: 'string', date: 'string', description: 'string' },
    positiveNumbers: ['amount'],
    allowed: ['amount', 'category', 'description', 'date', 'accountId', 'tags'],
  },
  TRANSFER_CREATE: {
    required: ['fromAccountId', 'toAccountId', 'amount', 'date'],
    types: { 
      fromAccountId: 'string', 
      toAccountId: 'string', 
      amount: 'number', 
      date: 'string',
      description: 'string'
    },
    positiveNumbers: ['amount'],
    allowed: ['fromAccountId', 'toAccountId', 'amount', 'date', 'description'],
  },
  DEBT_CREATE: {
    required: ['amount', 'creditor'],
    types: { 
      amount: 'number', 
      creditor: 'string', 
      description: 'string',
      dueDate: 'string',
      status: 'string'
    },
    positiveNumbers: ['amount'],
    allowed: ['amount', 'creditor', 'description', 'dueDate', 'status'],
  },
  BUDGET_CREATE: {
    required: ['limit'],
    types: { limit: 'number', period: 'string' },
    positiveNumbers: ['limit'],
    allowed: ['limit', 'period'],
  },
  BUDGET_CATEGORY_CREATE: {
    required: ['category', 'limit'],
    types: { category: 'string', limit: 'number' },
    positiveNumbers: ['limit'],
    allowed: ['category', 'limit'],
  },
}

/**
 * Validates a complete request payload against rules
 * @param {Object} data - The request payload
 * @param {Object} rules - Validation rules from ENDPOINT_VALIDATION
 * @param {string} endpoint - Endpoint name for error messages
 * @returns {Object} Sanitized and validated payload
 */
export const validatePayload = (data, rules, endpoint) => {
  if (rules.required) {
    validateRequiredFields(data, rules.required, endpoint)
  }
  
  if (rules.types) {
    validateFieldTypes(data, rules.types, endpoint)
  }
  
  if (rules.positiveNumbers) {
    validatePositiveNumbers(data, rules.positiveNumbers, endpoint)
  }
  
  // Sanitize to only allowed fields
  if (rules.allowed) {
    return sanitizePayload(data, rules.allowed)
  }
  
  return data
}
