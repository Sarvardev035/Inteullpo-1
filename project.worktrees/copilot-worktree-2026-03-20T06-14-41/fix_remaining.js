const fs = require('fs');

const fixFile = (path, replacements) => {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  for (const [oldStr, newStr] of replacements) {
    // Only replace if it exists
    if (content.includes(oldStr)) {
        content = content.replace(newStr === false ? new RegExp(oldStr, 'g') : oldStr, newStr === false ? '' : newStr);
    }
  }
  fs.writeFileSync(path, content);
};

// 1. FinanceContext
fixFile('./src/context/FinanceContext.tsx', [
  ['import React, { createContext, useState, useEffect, ReactNode }', 'import React, { createContext, useState, useEffect, type ReactNode }'],
  ['import { getAccounts, Account }', 'import { getAccounts, type Account }']
]);

// 2. Budget
fixFile('./src/pages/Budget.tsx', [
  ['setCategoryLimit, BudgetCategory', 'setCategoryLimit, type BudgetCategory'],
  ['await setIncomeTarget(Number(target));', 'await setIncomeTarget({ target: Number(target) } as any);'],
  ['await setCategoryLimit({ category, limitAmount });', 'await setCategoryLimit({ category, limitAmount } as any);']
]);

// 3. Dashboard
fixFile('./src/pages/Dashboard.tsx', [
  ['import { getExpenses, Expense }', 'import { getExpenses, type Expense }'],
  ['import { getIncomes, Income }', 'import { getIncomes, type Income }'],
  ['import { getDebts, Debt }', 'import { getDebts, type Debt }'],
  ['import { getBudget, BudgetCategory }', 'import { getBudget, type BudgetCategory }']
]);
