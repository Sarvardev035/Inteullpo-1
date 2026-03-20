import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns';
import AppShell from '../components/Layout/AppShell';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { EmptyState, Button } from '../components/ui';
import { getExpenses } from '../api/expensesApi';
import { getIncome } from '../api/incomeApi';
import { useFinance } from '../context/FinanceContext';
import { getErrorMessage, toArray } from '../utils/http';
import { formatCurrency, getCategoryMeta, smartDate } from '../utils/helpers';
import { pageVariants, listVariants, itemVariants, cardVariants } from '../utils/animations';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [expenses, income] = await Promise.all([getExpenses(), getIncome()]);
      const exp = toArray(expenses).map((e) => ({ ...e, txType: 'expense' }));
      const inc = toArray(income).map((i) => ({ ...i, txType: 'income' }));
      setTransactions([...exp, ...inc]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load calendar data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Get all days in current month
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Get transactions for selected date
  const selectedDateStr = selectedDate.toISOString().slice(0, 10);
  const selectedDateTransactions = useMemo(() => {
    return transactions.filter((t) => String(t.date).slice(0, 10) === selectedDateStr);
  }, [transactions, selectedDateStr]);

  // Summary for selected date
  const selectedDaySummary = useMemo(() => {
    const income = selectedDateTransactions
      .filter((t) => t.txType === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const expense = selectedDateTransactions
      .filter((t) => t.txType === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { income, expense, net: income - expense };
  }, [selectedDateTransactions]);

  // Get transaction indicators for a day
  const getTransactionCountForDay = (day) => {
    const dayStr = day.toISOString().slice(0, 10);
    return transactions.filter((t) => String(t.date).slice(0, 10) === dayStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  // Weekday headers
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days before month starts (for padding)
  const firstDay = monthDays[0];
  const paddingDays = Array(firstDay.getDay()).fill(null);

  return (
    <AppShell title="Calendar View">
      <motion.div
        initial={pageVariants.initial}
        animate={pageVariants.enter}
        className="space-y-6 pb-24"
      >
        {/* Header */}
        <motion.div variants={cardVariants} className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
        </motion.div>

        {loading ? (
          <LoadingSpinner label="Loading calendar..." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Calendar Section */}
            <motion.div variants={cardVariants} className="lg:col-span-2 rounded-2xl border bg-white p-6">
              {/* Month Navigation */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="mb-4 grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Padding for days before month */}
                {paddingDays.map((_, idx) => (
                  <div key={`padding-${idx}`} className="aspect-square" />
                ))}

                {/* Days of month */}
                {monthDays.map((day) => {
                  const dayTransactions = getTransactionCountForDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const hasIncome = dayTransactions.some((t) => t.txType === 'income');
                  const hasExpense = dayTransactions.some((t) => t.txType === 'expense');

                  return (
                    <motion.button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg'
                          : isCurrentMonth
                          ? 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200'
                          : 'text-slate-300'
                      }`}
                    >
                      {format(day, 'd')}

                      {/* Transaction Indicators */}
                      {dayTransactions.length > 0 && (
                        <div className="absolute bottom-1 flex gap-0.5">
                          {hasIncome && (
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          )}
                          {hasExpense && (
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 flex gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Expense</span>
                </div>
              </div>
            </motion.div>

            {/* Selected Day Details */}
            <motion.div variants={cardVariants} className="rounded-2xl border bg-white p-6">
              {/* Date Header */}
              <div className="mb-6">
                <p className="text-sm text-slate-500 uppercase tracking-wider">
                  {smartDate(selectedDate.toISOString())}
                </p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {format(selectedDate, 'MMM d, yyyy')}
                </h3>
              </div>

              {/* Summary Cards */}
              {selectedDateTransactions.length > 0 && (
                <motion.div
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="mb-6 space-y-3"
                >
                  {selectedDaySummary.income > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="rounded-lg bg-green-50 border border-green-200 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-green-100 p-2">
                            <TrendingUp size={16} className="text-green-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">Income</span>
                        </div>
                        <p className="text-lg font-bold text-green-600">
                          +{formatCurrency(selectedDaySummary.income)}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {selectedDaySummary.expense > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="rounded-lg bg-red-50 border border-red-200 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-red-100 p-2">
                            <TrendingDown size={16} className="text-red-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-600">Expenses</span>
                        </div>
                        <p className="text-lg font-bold text-red-600">
                          -{formatCurrency(selectedDaySummary.expense)}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {selectedDaySummary.net !== 0 && (
                    <motion.div
                      variants={itemVariants}
                      className={`rounded-lg p-3 ${
                        selectedDaySummary.net > 0
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-slate-50 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600">Net</span>
                        <p
                          className={`text-lg font-bold ${
                            selectedDaySummary.net > 0 ? 'text-blue-600' : 'text-slate-600'
                          }`}
                        >
                          {selectedDaySummary.net > 0 ? '+' : ''}
                          {formatCurrency(selectedDaySummary.net)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Transactions List */}
              <div>
                <h4 className="mb-3 font-semibold text-slate-900">
                  Transactions ({selectedDateTransactions.length})
                </h4>
                {selectedDateTransactions.length > 0 ? (
                  <motion.div
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {selectedDateTransactions.map((tx, idx) => {
                        const meta = getCategoryMeta(tx.category || tx.source);
                        return (
                          <motion.div
                            key={`${tx.txType}-${tx.id}`}
                            variants={itemVariants}
                            className="flex items-center justify-between rounded-lg border p-2 hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="rounded-full p-2"
                                style={{ backgroundColor: meta?.bg }}
                              >
                                <span className="text-sm">{meta?.emoji}</span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {tx.description || tx.source || tx.category}
                                </p>
                                <p className="text-xs text-slate-500">{meta?.label}</p>
                              </div>
                            </div>
                            <p
                              className={`whitespace-nowrap font-semibold text-sm ${
                                tx.txType === 'income'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {tx.txType === 'income' ? '+' : '-'}
                              {formatCurrency(tx.amount, tx.currency || 'UZS')}
                            </p>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-slate-500">No transactions on this day</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
