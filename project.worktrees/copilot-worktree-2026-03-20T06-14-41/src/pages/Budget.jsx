import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import BudgetOverview from '../components/Budget/BudgetOverview';
import CategoryLimitCard from '../components/Budget/CategoryLimitCard';
import { getBudget, setBudget, getBudgetCategories, setBudgetCategory } from '../api/budgetApi';
import { getIncome } from '../api/incomeApi';
import { getErrorMessage, toArray } from '../utils/http';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export default function Budget() {
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState(0);
  const [actualIncome, setActualIncome] = useState(0);
  const [limits, setLimits] = useState([]);
  const [targetInput, setTargetInput] = useState('');
  const [catForm, setCatForm] = useState({ category: 'FOOD', limitAmount: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [budget, categories, income] = await Promise.all([getBudget(), getBudgetCategories(), getIncome()]);
      const t = Number(budget?.target || budget?.incomeTarget || 0);
      setTarget(t);
      setTargetInput(String(t || ''));
      const incomeSum = toArray(income).reduce((s, i) => s + Number(i.amount || 0), 0);
      setActualIncome(incomeSum);

      const limitRows = toArray(categories).map((x) => ({
        category: x.category,
        limitAmount: Number(x.limitAmount || x.limit || 0),
        spentAmount: Number(x.spentAmount || x.spent || x.actual || 0),
      }));
      setLimits(limitRows);

      limitRows.forEach((row) => {
        const pct = row.limitAmount > 0 ? (row.spentAmount / row.limitAmount) * 100 : 0;
        if (pct > 100) toast.warning(`${row.category} is overspent`);
      });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load budget'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveTarget = async (e) => {
    e.preventDefault();
    try {
      await setBudget({ target: Number(targetInput) });
      toast.success('Budget target updated');
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update budget target'));
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    try {
      await setBudgetCategory({ category: catForm.category, limitAmount: Number(catForm.limitAmount) });
      toast.success('Category limit updated');
      setCatForm((p) => ({ ...p, limitAmount: '' }));
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update category limit'));
    }
  };

  const used = useMemo(() => limits.reduce((s, l) => s + Number(l.spentAmount || 0), 0), [limits]);

  return (
    <AppShell title="Budget">
      <div className="fade-page space-y-4">
        <h2 className="text-2xl font-bold">Budget & Planning</h2>
        {loading ? <LoadingSpinner label="Loading budget..." /> : (
          <>
            <BudgetOverview target={target} actual={actualIncome} />
            <div className="rounded-2xl border bg-white p-4">
              <p className="text-sm text-slate-600">Budget health used: <span className="font-semibold">{used.toLocaleString()}</span></p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <form onSubmit={saveTarget} className="rounded-2xl border bg-white p-4 space-y-3">
                <h3 className="text-lg font-semibold">Set monthly income target</h3>
                <input required min="0" type="number" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} className="w-full rounded-lg border px-3 py-2" />
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">Save target</button>
              </form>

              <form onSubmit={saveCategory} className="rounded-2xl border bg-white p-4 space-y-3">
                <h3 className="text-lg font-semibold">Set category limit</h3>
                <select value={catForm.category} onChange={(e) => setCatForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border px-3 py-2">{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
                <input required min="0" type="number" value={catForm.limitAmount} onChange={(e) => setCatForm((p) => ({ ...p, limitAmount: e.target.value }))} className="w-full rounded-lg border px-3 py-2" placeholder="Limit amount" />
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">Save limit</button>
              </form>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {limits.length ? limits.map((item) => <CategoryLimitCard key={item.category} item={item} />) : <p className="text-slate-500">No category limits set yet.</p>}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
