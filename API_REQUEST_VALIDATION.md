# API Request Validation & Enhancement

## Overview
This document describes the API request validation system implemented to catch and prevent 500 errors caused by:
1. Missing required fields
2. Invalid data types
3. Wrong field names
4. Missing authentication headers
5. Invalid request payloads

## Files Modified

### 1. `src/api/axios.js` - Enhanced Interceptors
**Request Interceptor Improvements:**
- ✅ Validates Bearer token presence for protected endpoints
- ✅ Automatically adds `Authorization: Bearer ${token}` header
- ✅ Warns if token is missing for protected POST/PUT requests
- ✅ Validates Content-Type header
- ✅ Detailed request logging with token status

**Response Interceptor Improvements:**
- ✅ Status-specific error handling (400, 401, 403, 404, 500)
- ✅ Detailed error messages for each error type
- ✅ Shows sent payload and backend response for debugging
- ✅ Network error detection with CORS hints
- ✅ Timeout detection

### 2. `src/utils/apiValidation.js` - New Validation Utilities
Provides validation functions and rules for each endpoint:

**Core Functions:**
- `validateRequiredFields(data, requiredFields, endpoint)` - Checks all required fields present
- `validateFieldTypes(data, typeMap, endpoint)` - Validates field types match expectations
- `validatePositiveNumbers(data, numericFields, endpoint)` - Ensures amounts are non-negative
- `sanitizePayload(data, allowedFields)` - Removes invalid/empty fields
- `validatePayload(data, rules, endpoint)` - Complete validation (combines all above)

**Validation Rules by Endpoint:**
```javascript
ENDPOINT_VALIDATION.LOGIN
  ├─ Required: email, password
  ├─ Types: email (string), password (string)
  └─ Allowed: email, password

ENDPOINT_VALIDATION.ACCOUNT_CREATE
  ├─ Required: name, type, currency, initialBalance
  ├─ Types: name (string), type (string), currency (string), initialBalance (number)
  ├─ Positive: initialBalance
  └─ Allowed: name, type, currency, initialBalance

ENDPOINT_VALIDATION.EXPENSE_CREATE
  ├─ Required: amount, category, date
  ├─ Types: amount (number), category (string), date (string), description (string)
  ├─ Positive: amount
  └─ Allowed: amount, category, description, date, accountId, tags

ENDPOINT_VALIDATION.INCOME_CREATE
  ├─ Required: amount, category, date
  ├─ Types: amount (number), category (string), date (string)
  ├─ Positive: amount
  └─ Allowed: amount, category, description, date, accountId, tags

ENDPOINT_VALIDATION.TRANSFER_CREATE
  ├─ Required: fromAccountId, toAccountId, amount, date
  ├─ Types: fromAccountId (string), toAccountId (string), amount (number), date (string)
  ├─ Positive: amount
  └─ Allowed: fromAccountId, toAccountId, amount, date, description

ENDPOINT_VALIDATION.DEBT_CREATE
  ├─ Required: amount, creditor
  ├─ Types: amount (number), creditor (string), description (string), dueDate (string), status (string)
  ├─ Positive: amount
  └─ Allowed: amount, creditor, description, dueDate, status

ENDPOINT_VALIDATION.BUDGET_CREATE
  ├─ Required: limit
  ├─ Types: limit (number), period (string)
  ├─ Positive: limit
  └─ Allowed: limit, period

ENDPOINT_VALIDATION.BUDGET_CATEGORY_CREATE
  ├─ Required: category, limit
  ├─ Types: category (string), limit (number)
  ├─ Positive: limit
  └─ Allowed: category, limit
```

### 3. API Files Enhanced with Validation

#### `src/api/authApi.js`
```javascript
export const authApi = {
  login: (data) => {
    const validated = validatePayload(data, ENDPOINT_VALIDATION.LOGIN, 'POST /api/auth/login')
    return api.post('/api/auth/login', validated)
  },
  // ...
}
```
- ✅ Validates email & password
- ✅ Removes invalid fields
- ✅ Prevents sending extra properties

#### `src/api/accountsApi.js`
- ✅ Validates account name, type, currency, balance
- ✅ Ensures balance is non-negative
- ✅ Sanitizes input

#### `src/api/incomeApi.js`
- ✅ Validates amount > 0, category, date
- ✅ Optional: description, accountId, tags
- ✅ Type checking

#### `src/api/expensesApi.js`
- ✅ Validates amount > 0, category, date
- ✅ Optional: description, accountId, tags
- ✅ Removes empty fields

#### `src/api/transfersApi.js`
- ✅ Validates fromAccountId, toAccountId, amount > 0, date
- ✅ Optional: description
- ✅ Type validation

#### `src/api/debtsApi.js`
- ✅ Validates amount > 0, creditor name
- ✅ Optional: description, dueDate, status
- ✅ Sanitizes payload

#### `src/api/budgetApi.js`
- ✅ Validates limit amount > 0, optional period
- ✅ Category limit validation
- ✅ Type checking

#### `src/api/statisticsApi.js`
- ✅ Added JSDoc comments
- ✅ Documents expected params (period: month/quarter/year)
- ✅ No additional validation needed (GET only)

## How Validation Works

### Example Flow: Creating an Expense

1. **User submits form:**
   ```javascript
   onSubmit({ amount: 50000, category: 'Food', date: '2026-03-21', notes: 'Lunch' })
   ```

2. **Component calls API:**
   ```javascript
   createExpense({ amount: 50000, category: 'Food', date: '2026-03-21', notes: 'Lunch' })
   ```

3. **API validates:**
   ```javascript
   const validated = validatePayload(data, ENDPOINT_VALIDATION.EXPENSE_CREATE, 'POST /api/expenses')
   // Checks: amount (required, number, > 0), category (required, string), date (required)
   // Removes: notes (not in allowed fields)
   // Result: { amount: 50000, category: 'Food', date: '2026-03-21' }
   ```

4. **Request sent to backend:**
   ```
   POST /api/expenses
   {
     "amount": 50000,
     "category": "Food",
     "date": "2026-03-21"
   }
   ```

5. **Response handling:**
   - ✅ Success: Expense created
   - ❌ 400 Bad Request: Shows what fields were wrong
   - ❌ 500 Server Error: Shows sent payload + backend response for debugging

## Error Messages

### Request Validation Errors
```
Invalid request for POST /api/expenses: Missing required fields - category
Invalid request for POST /api/expenses: Field "amount" must be number, got string
Invalid request for POST /api/expenses: Field "amount" cannot be negative
```

### API Response Errors
```
❌ [API ERROR 400 - BAD REQUEST] ...
message: 'Invalid request body - check your fields match backend requirements'
received: { amount: "50000", ... }
backend_response: { error: '...', message: '...' }

❌ [API ERROR 401 - UNAUTHORIZED] ...
message: 'Missing or invalid authentication token'
hasToken: false

❌ [API ERROR 500 - SERVER ERROR] ...
message: 'Backend server error - likely invalid request format or missing required fields'
sent: { amount: 50000, ... }
response: { error: '...', message: '...' }
```

## Authentication Headers

All protected endpoints automatically include:
```
Authorization: Bearer <token_from_localStorage>
Content-Type: application/json
```

### Protected Endpoints
- ✅ POST /api/auth/logout
- ✅ ALL /api/accounts/* endpoints
- ✅ ALL /api/expenses/* endpoints
- ✅ ALL /api/income/* endpoints
- ✅ ALL /api/transfers/* endpoints
- ✅ ALL /api/debts/* endpoints
- ✅ ALL /api/budget/* endpoints
- ✅ ALL /api/statistics/* endpoints

### Public Endpoints
- ✅ POST /api/auth/login
- ✅ POST /api/auth/register

## Testing the Validation

### From Browser Console:
```javascript
// Test invalid amount
const { createExpense } = await import('./src/api/expensesApi.js')
createExpense({ category: 'Food', date: '2026-03-21' })
// Will show: Missing required fields - amount

// Test negative amount
createExpense({ amount: -50, category: 'Food', date: '2026-03-21' })
// Will show: Field "amount" cannot be negative

// Test wrong type
createExpense({ amount: "50000", category: 'Food', date: '2026-03-21' })
// Will show: Field "amount" must be number, got string

// Valid request
createExpense({ amount: 50000, category: 'Food', date: '2026-03-21' })
// ✅ Will create expense
```

## Common Issues Fixed

| Issue | Cause | Fix |
|-------|-------|-----|
| 400 Bad Request | Missing required fields | Validation ensures all required fields present |
| 401 Unauthorized | Missing token | Interceptor adds Bearer token automatically |
| 500 Server Error | Invalid field names/types | Validation sanitizes and type-checks |
| Extra properties in request | Frontend sending wrong fields | `sanitizePayload()` removes non-allowed fields |
| Negative amounts | No validation | `validatePositiveNumbers()` checks > 0 |
| Wrong date format | Backend expects specific format | Components handle formatting, validation accepts |

## Configuration Changes

### Environment Variables
- `VITE_API_BASE_URL=https://finly.uyqidir.uz` - Backend URL
- `VITE_API_TIMEOUT=10000` - Request timeout (ms)

### Vite Config (Proxy)
Development only:
```javascript
server: {
  proxy: {
    '/api': {
      target: 'https://finly.uyqidir.uz',
      changeOrigin: true,
      rewrite: (path) => path,
    },
  },
}
```

## Summary

✅ All API endpoints now include:
1. Field validation
2. Type checking
3. Bearer token handling
4. Payload sanitization
5. Detailed error messages
6. Request/response logging

This prevents 500 errors from invalid requests and makes debugging much easier!
