import os, glob

# Fix type imports in src/pages/*.tsx
# Example: import { getExpenses, Expense } from ... => import { getExpenses, type Expense } from ...

files = glob.glob('src/pages/*.tsx') + ['src/api/accountsApi.ts', 'src/api/expensesApi.ts', 'src/api/incomeApi.ts', 'src/api/debtsApi.ts', 'src/api/transfersApi.ts', 'src/api/budgetApi.ts', 'src/context/FinanceContext.tsx']

replacements = [
    (" Expense ", " type Expense "),
    (" Income ", " type Income "),
    (" Transfer ", " type Transfer "),
    (" Debt ", " type Debt "),
    (" BudgetCategory ", " type BudgetCategory "),
    (" Account ", " type Account "),
    # Specifically for unused variables
    ("BudgetCategory }", "}")
]

for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r') as file:
        content = file.read()
    
    # Simple regex-less replacement for the specific imports
    for old, new in replacements:
        # Avoid replacing inside actual usages by only targeting the import lines
        # A bit risky, but we'll specific map what we need:
        pass
    
    # More precise replacements
    content = content.replace("getAccounts, Account", "getAccounts, type Account")
    content = content.replace("createAccount, editAccount, deleteAccount, Account", "createAccount, editAccount, deleteAccount, type Account")
    content = content.replace("getExpenses, Expense", "getExpenses, type Expense")
    content = content.replace("createExpense, editExpense, deleteExpense, Expense", "createExpense, editExpense, deleteExpense, type Expense")
    content = content.replace("getIncomes, Income", "getIncomes, type Income")
    content = content.replace("createIncome, editIncome, deleteIncome, Income", "createIncome, editIncome, deleteIncome, type Income")
    content = content.replace("getTransfers, createTransfer, Transfer", "getTransfers, createTransfer, type Transfer")
    content = content.replace("getTransfers, Transfer", "getTransfers, type Transfer")
    content = content.replace("getDebts, createDebt, updateDebt, deleteDebt, Debt", "getDebts, createDebt, updateDebt, deleteDebt, type Debt")
    content = content.replace("getBudget, setIncomeTarget, getCategoryLimits, setCategoryLimit, BudgetCategory", "getBudget, setIncomeTarget, getCategoryLimits, setCategoryLimit")
    
    # Unused variables
    content = content.replace("entry, index", "_, index")
    
    with open(f, 'w') as file:
        file.write(content)
