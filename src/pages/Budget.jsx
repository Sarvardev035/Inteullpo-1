import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import { Button, EmptyState, ProgressBar, Input } from '../components/ui';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import {
  getBudget,
  setBudget,
  getBudgetCategories,
  setBudgetCategory,
} from '../api/budgetApi';
import { getIncome } from '../api/incomeApi';
import { getErrorMessage, toArray } from '../utils/http';
import { formatCurrency, getCategoryMeta } from '../utils/helpers';
import {
  pageVariants,
  listVariants,
  itemVariants,
  cardVariants,
} from '../utils/animations';
import { EXPENSE_CATEGORIES } from '../utils/constants';

export default function Budget() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [target, setTarget] = useState(0);
  const [targetInput, setTargetInput] = useState('');
  const [actualIncome, setActualIncome] = useState(0);
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [limitInput, setLimitInput] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [budget, cats, income] = await Promise.all([
        getBudget(),
        getBudgetCategories(),
        getIncome(),
      ]);

      const t = Number(budget?.target || 0);
      setTarget(t);
      setTargetInput(String(t || ''));

      const incomeSum = toArray(income).reduce(
        (sum, item) => sum + (item.amount || 0),
        0
      );
      setActualIncome(incomeSum);

      const catList = toArray(cats).map((cat) => ({
        category: cat.category,
        limit: Number(cat.limit || cat.limitAmount || 0),
        spent: Number(cat.spent || cat.spentAmount || 0),
      }));
      setCategories(catList);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load budget'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveTarget = async () => {
    const t = Number(targetInput) || 0;
    if (t <= 0) {
      toast.error('Target must be greater than 0');
      return;
    }
    setSubmitting(true);
    try {
      await setBudget({ target: t });
      setTarget(t);
      toast.success('Income goal updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update budget'));
    } finally {
      setSubmitting(false);
    }
  };

  const saveCategory = async () => {
    if (!editingCategory) return;
    const limit = Number(limitInput) || 0;
    if (limit <= 0) {
      toast.error('Limit must be greater than 0');
      return;
    }
    setSubmitting(true);
    try {
      await setBudgetCategory({
        category: editingCategory.category,
        limit,
      });
      setCategories(
        categories.map((cat) =>
          cat.category === editingCategory.category ? { ...cat, limit } : cat
        )
      );
      setEditingCategory(null);
      toast.success('Category limit updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update category'));
    } finally {
      setSubmitting(false);
    }
  };

  const incomeProgress = target > 0 ? (actualIncome / target) * 100 : 0;

  const budgetHealth = useMemo(() => {
    if (categories.length === 0) return 100;
    const avgSpent = categories.reduce((sum, cat) => {
      if (cat.limit === 0) return sum;
      return sum + (cat.spent / cat.limit) * 100;
    }, 0);
    const health = 100 - Math.min(avgSpent / categories.length, 100);
    return Math.max(0, Math.round(health));
  }, [categories]);

  const categoryWithLimits = EXPENSE_CATEGORIES.map((cat) => {
    const existing = categories.find((c) => c.category === cat);
    return (
      existing || {
        category: cat,
        limit: 0,
        spent: 0,
      }
    );
  });

  return (
    <AppShell title="Budget">
      <div className="space-y-6 pb-24">
        <motion.div
          initial={pageVariants.initial}
          animate={pageVariants.enter}
        >
          <h1 className="text-3xl font-bold text-slate-900">Budget Planning</h1>
        </motion.div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="space-y-6"
        >
          {/* Monthly Income Goal */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500">
                  Monthly Income Goal
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {formatCurrency(target)}
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingCategory('target')}
              >
                Edit
              </Button>
            </div>

            {editingCategory === 'target' && (
              <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <Input
                  label="New Target"
                  type="number"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={saveTarget}
                    isLoading={submitting}
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setEditingCategory(null);
                      setTargetInput(String(target));
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {target > 0 && (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <ProgressBar percent={incomeProgress} />
                <p className="text-xs text-slate-500">
                  {formatCurrency(actualIncome)} / {formatCurrency(target)}
                </p>
              </div>
            )}
          </motion.div>

          {/* Category Limits Grid */}
          <motion.div variants={listVariants} className="grid gap-4 md:grid-cols-2">
            {categoryWithLimits.map((cat) => {
              const percent =
                cat.limit > 0 ? (cat.spent / cat.limit) * 100 : 0;
              const isOver = percent > 100;

              return (
                <motion.div
                  key={cat.category}
                  variants={itemVariants}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {getCategoryMeta(cat.category).emoji}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {getCategoryMeta(cat.category).label}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(cat.spent)} /{' '}
                          {formatCurrency(cat.limit || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {cat.limit > 0 && (
                    <div className="mt-3 space-y-1">
                      <ProgressBar
                        percent={Math.min(percent, 100)}
                        animate={false}
                      />
                      {isOver && (
                        <p className="text-xs text-red-600 font-medium">
                          Over by {formatCurrency(cat.spent - cat.limit)}
                        </p>
                      )}
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full"
                    onClick={() => {
                      setEditingCategory(cat.category);
                      setLimitInput(String(cat.limit));
                    }}
                  >
                    {cat.limit > 0 ? 'Edit Limit' : 'Set Limit'}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>

          {editingCategory && editingCategory !== 'target' && (
            <motion.div
              variants={cardVariants}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-lg font-semibold">
                Set Limit for{' '}
                {getCategoryMeta(editingCategory).label}
              </h3>
              <div className="space-y-3">
                <Input
                  label="Spending Limit"
                  type="number"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={saveCategory}
                    isLoading={submitting}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditingCategory(null);
                      setLimitInput('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Budget Health Score */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-6 text-lg font-semibold text-slate-900">
              Budget Health Score
            </h3>

            <div className="flex flex-col items-center">
              <div className="relative h-40 w-40">
                <svg
                  className="absolute inset-0 h-full w-full transform -rotate-90"
                >
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="none"
                    stroke={budgetHealth >= 70 ? '#10b981' : '#f59e0b'}
                    strokeWidth="8"
                    strokeDasharray={`${(budgetHealth / 100) * 2 * Math.PI * 40}% 100%`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-slate-900">
                    {budgetHealth}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Healthy</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
              <div className="flex gap-2 text-sm">
                <span className="text-lg">✓</span>
                <p className="text-slate-700">
                  You have set limits for{' '}
                  <span className="font-semibold">
                    {categories.filter((c) => c.limit > 0).length}
                  </span>{' '}
                  categories
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-lg">✓</span>
                <p className="text-slate-700">
                  Average spending is at{' '}
                  <span className="font-semibold">
                    {Math.round(
                      categories.reduce((sum, cat) => {
                        if (cat.limit === 0) return sum;
                        return sum + (cat.spent / cat.limit) * 100;
                      }, 0) / Math.max(1, categories.filter((c) => c.limit > 0).length)
                    )}
                    %
                  </span>{' '}
                  of your limits
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <span className="text-lg">✓</span>
                <p className="text-slate-700">
                  {formatCurrency(target - actualIncome)} needed to reach your
                  income goal
                </p>
              </div>
            </div>
          </motion.div>

          {categories.length === 0 && (
            <EmptyState
              icon="🎯"
              title="Set your monthly budget"
              description="Start by setting your monthly income goal and category limits"
              actionLabel="Set Income Goal"
              onAction={() => setEditingCategory('target')}
            />
          )}
        </motion.div>
      )}
      </div>
    </AppShell>
  );
}
