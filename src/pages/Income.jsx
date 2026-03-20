import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import { EmptyState, Button } from '../components/ui';
import AddIncomeModal from '../components/Income/AddIncomeModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { getIncome, createIncome, updateIncome, removeIncome } from '../api/incomeApi';
import { useFinance } from '../context/FinanceContext';
import { getErrorMessage, toArray } from '../utils/http';
import { formatCurrency, groupByDate, getCategoryMeta, smartDate } from '../utils/helpers';
import { pageVariants, listVariants, itemVariants, cardVariants, deleteExitVariants } from '../utils/animations';
import { INCOME_CATEGORIES } from '../utils/constants';

const INCOME_TIPS = [
  { emoji: '📊', title: 'Income Sources', desc: 'Track all your income streams in one place' },
  { emoji: '📈', title: 'Growth Tracking', desc: 'See how your income grows over time' },
  { emoji: '💼', title: 'Category Insights', desc: 'Understand which sources generate the most' },
];

export default function Income() {
  const { accounts, refreshAccounts } = useFinance();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getIncome();
      setItems(toArray(data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load income'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemDate = new Date(item.date);
      const monthMatch =
        itemDate.getMonth() === selectedMonth.getMonth() &&
        itemDate.getFullYear() === selectedMonth.getFullYear();
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      return monthMatch && categoryMatch;
    });
  }, [items, selectedMonth, selectedCategory]);

  const groupedItems = useMemo(() => {
    const grouped = groupByDate(filteredItems);
    return Object.entries(grouped).sort((a, b) => {
      const dateA = filteredItems.find((item) => smartDate(item.date) === a[0])?.date || '';
      const dateB = filteredItems.find((item) => smartDate(item.date) === b[0])?.date || '';
      return new Date(dateB) - new Date(dateA);
    });
  }, [filteredItems]);

  const submit = async (payload) => {
    setSubmitting(true);
    try {
      if (editData) {
        await updateIncome(editData.id, payload);
        toast.success('Income updated');
      } else {
        await createIncome(payload);
        toast.success('Income added');
      }
      setModalOpen(false);
      setEditData(null);
      await Promise.all([load(), refreshAccounts()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save income'));
    } finally {
      setSubmitting(false);
    }
  };

  const del = async () => {
    if (!deleteItem) return;
    setSubmitting(true);
    try {
      await removeIncome(deleteItem.id);
      toast.success('Income deleted');
      setDeleteItem(null);
      await Promise.all([load(), refreshAccounts()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete income'));
    } finally {
      setSubmitting(false);
    }
  };

  const totalIncome = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredItems]);

  return (
    <AppShell title="Income">
      <motion.div
        initial={pageVariants.initial}
        animate={pageVariants.enter}
        className="space-y-6 pb-24"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Income</h1>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
          >
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>

        {/* Info Banner */}
        {items.length === 0 && (
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border-l-4 border-l-green-500 bg-green-50 p-4"
          >
            <p className="text-sm text-green-700">
              💡 Track all your income sources to understand your earning potential. Add income from salary, freelance work, investments, and more.
            </p>
          </motion.div>
        )}

        {/* Tips Cards */}
        {items.length === 0 && (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid gap-3 md:grid-cols-3"
          >
            {INCOME_TIPS.map((tip, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="rounded-2xl border bg-white p-4 text-center"
              >
                <div className="text-3xl">{tip.emoji}</div>
                <h3 className="mt-2 font-semibold text-slate-900">{tip.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{tip.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {loading ? (
          <LoadingSpinner label="Loading income..." />
        ) : (
          <>
            {/* Filter Row */}
            <motion.div variants={cardVariants} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-500" />
                <input
                  type="month"
                  value={selectedMonth.toISOString().slice(0, 7)}
                  onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-2">
                {['All', ...INCOME_CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'All' ? '📊 All' : `${getCategoryMeta(cat)?.emoji} ${cat}`}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Income List */}
            {groupedItems.length > 0 ? (
              <motion.div variants={listVariants} initial="hidden" animate="show" className="space-y-4">
                {groupedItems.map(([date, dayItems]) => {
                  const dayTotal = dayItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
                  return (
                    <motion.div key={date} variants={itemVariants} className="rounded-2xl border bg-white p-4">
                      <div className="mb-3 flex items-center justify-between border-b pb-3">
                        <h3 className="font-semibold text-slate-900">{date}</h3>
                        <span className="text-sm font-medium text-green-600">{formatCurrency(dayTotal)}</span>
                      </div>

                      <div className="space-y-2">
                        <AnimatePresence>
                          {dayItems.map((item) => {
                            const meta = getCategoryMeta(item.category);
                            return (
                              <motion.div
                                key={item.id}
                                variants={deleteExitVariants}
                                initial={{ opacity: 1 }}
                                exit="exit"
                                className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="rounded-full p-2" style={{ backgroundColor: meta?.bg }}>
                                    <span className="text-lg">{meta?.emoji}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-900">
                                      {item.description || item.category}
                                    </p>
                                    <p className="text-xs text-slate-500">{meta?.label}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-green-600">
                                    +{formatCurrency(item.amount, item.currency)}
                                  </span>
                                  <button
                                    onClick={() => setDeleteItem(item)}
                                    className="text-slate-400 hover:text-red-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Total Summary */}
                <motion.div variants={itemVariants} className="rounded-2xl border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Total Income</span>
                    <span className="text-2xl font-bold text-green-600">+{formatCurrency(totalIncome)}</span>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <EmptyState
                icon="💰"
                title="No income recorded"
                description="Add your first income entry to get started"
                actionLabel="Add Income"
                onAction={() => {
                  setEditData(null);
                  setModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </motion.div>

      {/* Modals */}
      <AddIncomeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={submit}
        submitting={submitting}
        accounts={accounts}
        editData={editData}
      />
      <ConfirmDialog
        open={!!deleteItem}
        onOpenChange={(v) => !v && setDeleteItem(null)}
        message={`Delete ${deleteItem?.description || 'this income entry'}?`}
        onConfirm={del}
        loading={submitting}
      />
    </AppShell>
  );
}
