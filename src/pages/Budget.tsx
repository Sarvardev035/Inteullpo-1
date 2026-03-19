import React, { useState, useEffect } from 'react';
import { getBudget, setIncomeTarget, getCategoryLimits, setCategoryLimit } from '../api/budgetApi';
import { toast } from 'react-toastify';
import { Target, Save } from 'lucide-react';

const CATEGORIES = ['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'HEALTH', 'OTHER'];

const Budget: React.FC = () => {
  const [target, setTarget] = useState<number | ''>('');
  const [categories, setCategories] = useState<any[]>(CATEGORIES.map(c => ({ category: c, limitAmount: 0 })));
  const [loading, setLoading] = useState(true);
  const [savingTarget, setSavingTarget] = useState(false);
  const [savingCategory, setSavingCategory] = useState<string | null>(null);

  const fetchBudgetData = async () => {
    setLoading(true);
    try {
      const budgetData = await getBudget();
      setTarget(budgetData.target || 0);

      const catData = await getCategoryLimits();
      const limits = Array.isArray(catData) ? catData : catData?.content || [];
      
      const merged = CATEGORIES.map(cat => {
        const found = limits.find((l: any) => l.category === cat);
        return { category: cat, limitAmount: found ? found.limitAmount : 0 };
      });
      setCategories(merged);

    } catch (err) {
      toast.error('Failed to load budget data');
      // Set defaults if API fails
      setTarget(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (target === '' || Number(target) < 0) return;
    setSavingTarget(true);
    try {
      await setIncomeTarget({ target: Number(target) } as any);
      toast.success('Monthly budget target updated');
    } catch (error: any) {
      toast.error('Failed to update target');
    } finally {
      setSavingTarget(false);
    }
  };

  const handleUpdateCategoryLimit = async (category: string, limitAmount: number) => {
    if (limitAmount < 0) return;
    setSavingCategory(category);
    try {
      await setCategoryLimit({ category, limitAmount } as any);
      toast.success(`Limit updated for ${category}`);
      setCategories(prev => prev.map(c => c.category === category ? { ...c, limitAmount } : c));
    } catch (error: any) {
      toast.error('Failed to update limit');
    } finally {
      setSavingCategory(null);
    }
  };

  const handleLimitChange = (category: string, val: string) => {
    const num = Number(val);
    setCategories(prev => prev.map(c => c.category === category ? { ...c, limitAmount: num } : c));
  };

  if (loading) return <div className="p-8">Loading budget settings...</div>;

  const totalLimits = categories.reduce((sum, c) => sum + Number(c.limitAmount), 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Budget Settings</h1>
        <p className="text-gray-500 mt-1">Set your total monthly spending target and detailed category limits.</p>
      </div>

      {/* Global Target */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
          <Target className="w-5 h-5 mr-2 text-primary-500" /> 
          Overall Monthly Target
        </h2>
        <form onSubmit={handleUpdateTarget} className="flex gap-4 items-end">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (UZS/USD)</label>
            <input 
              required type="number" min="0" 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-lg"
              value={target} onChange={e => setTarget(e.target.value === '' ? '' : Number(e.target.value))} 
            />
          </div>
          <button disabled={savingTarget} type="submit" className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 h-[46px]">
            <Save size={18} />
            <span>{savingTarget ? 'Saving...' : 'Save Target'}</span>
          </button>
        </form>
      </div>

      {/* Category Limits */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Category Limits</h2>
          <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            Total Allocated: <span className={totalLimits > Number(target) ? 'text-red-500' : 'text-primary-600'}>{totalLimits.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-4">
          {categories.map(cat => (
            <div key={cat.category} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-1/3">
                <span className="font-semibold text-gray-700">{cat.category}</span>
              </div>
              <div className="flex-1 flex gap-3">
                <input 
                  type="number" min="0" placeholder="0"
                  className="w-full max-w-[200px] border border-gray-300 p-2 rounded focus:ring-1 focus:ring-primary-500 outline-none select-all"
                  value={cat.limitAmount === 0 ? '' : cat.limitAmount} 
                  onChange={e => handleLimitChange(cat.category, e.target.value)} 
                />
                <button 
                  onClick={() => handleUpdateCategoryLimit(cat.category, cat.limitAmount)}
                  disabled={savingCategory === cat.category}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded font-medium transition disabled:opacity-50"
                >
                  {savingCategory === cat.category ? 'Saving...' : 'Save Limit'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Budget;
