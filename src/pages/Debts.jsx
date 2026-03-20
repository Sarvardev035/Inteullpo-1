import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import { Button, EmptyState } from '../components/ui';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import AddDebtModal from '../components/Debts/AddDebtModal';
import { getDebts, createDebt, removeDebt } from '../api/debtsApi';
import { getErrorMessage, toArray } from '../utils/http';
import { formatCurrency } from '../utils/helpers';
import {
  pageVariants,
  listVariants,
  itemVariants,
  deleteExitVariants,
} from '../utils/animations';

export default function Debts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [selectedTab, setSelectedTab] = useState('BORROWED');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDebts();
      setItems(toArray(data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load debts'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredDebts = useMemo(() => {
    return items.filter((debt) => debt.type === selectedTab);
  }, [items, selectedTab]);

  const totals = useMemo(() => {
    const iOwe = items
      .filter((d) => d.type === 'BORROWED')
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    const owedToMe = items
      .filter((d) => d.type === 'LENT')
      .reduce((sum, d) => sum + (d.amount || 0), 0);
    return { iOwe, owedToMe };
  }, [items]);

  const handleAdd = async (payload) => {
    setSubmitting(true);
    try {
      await createDebt(payload);
      toast.success('Debt added successfully');
      setModalOpen(false);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add debt'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSubmitting(true);
    try {
      await removeDebt(deleteItem.id);
      toast.success('Debt deleted');
      setDeleteItem(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete debt'));
    } finally {
      setSubmitting(false);
    }
  };

  const calculateDaysRemaining = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <AppShell title="Debts">
      <div className="space-y-6 pb-24">
        <motion.div
          initial={pageVariants.initial}
          animate={pageVariants.enter}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-slate-900">Debts</h1>
          <Button onClick={() => setModalOpen(true)}>+ Add Debt</Button>
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
          {/* Summary Cards */}
          <motion.div variants={listVariants} className="grid gap-3 md:grid-cols-2">
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-red-100 bg-red-50 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
                I Owe
              </p>
              <p className="mt-3 text-3xl font-bold text-red-700">
                {formatCurrency(totals.iOwe)}
              </p>
              <p className="mt-2 text-xs text-red-600">
                {items.filter((d) => d.type === 'BORROWED').length} debts
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-green-100 bg-green-50 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                Owed to Me
              </p>
              <p className="mt-3 text-3xl font-bold text-green-700">
                {formatCurrency(totals.owedToMe)}
              </p>
              <p className="mt-2 text-xs text-green-600">
                {items.filter((d) => d.type === 'LENT').length} debts
              </p>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2">
            {['BORROWED', 'LENT'].map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTab(tab)}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-colors ${
                  selectedTab === tab
                    ? 'bg-blue text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab === 'BORROWED' ? 'I Owe' : 'Owed to Me'}
              </motion.button>
            ))}
          </div>

          {/* Debt List */}
          {filteredDebts.length > 0 ? (
            <motion.div variants={listVariants} className="space-y-3">
              <AnimatePresence>
                {filteredDebts.map((debt) => {
                  const daysRemaining = debt.dueDate
                    ? calculateDaysRemaining(debt.dueDate)
                    : null;
                  const isOverdue = daysRemaining !== null && daysRemaining < 0;

                  return (
                    <motion.div
                      key={debt.id}
                      variants={itemVariants}
                      exit={deleteExitVariants.exit}
                      className={`rounded-2xl border-l-4 border-slate-200 bg-white p-6 shadow-sm transition-colors ${
                        selectedTab === 'BORROWED'
                          ? 'border-l-red-500'
                          : 'border-l-green-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900">
                            {debt.personName || debt.name}
                          </h3>
                          {debt.description && (
                            <p className="mt-1 text-sm text-slate-500">
                              {debt.description}
                            </p>
                          )}
                        </div>
                        {debt.status === 'OPEN' && (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                            🔵 Open
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-3xl font-bold text-slate-900">
                        {formatCurrency(debt.amount)}
                      </p>

                      {debt.dueDate && (
                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              isOverdue ? 'text-red-600' : 'text-amber-600'
                            }`}
                          >
                            {isOverdue
                              ? `Overdue by ${Math.abs(daysRemaining)} days!`
                              : `Due in ${daysRemaining} days`}
                          </span>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteItem(debt)}
                        >
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <EmptyState
              icon="💳"
              title={
                selectedTab === 'BORROWED'
                  ? 'No debts you owe'
                  : 'No debts owed to you'
              }
              description="Add a new debt to get started"
              actionLabel="Add Debt"
              onAction={() => setModalOpen(true)}
            />
          )}
        </motion.div>
      )}

      {/* Modal */}
      <AddDebtModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
        submitting={submitting}
      />

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteItem && (
          <ConfirmDialog
            title="Delete Debt?"
            description={`Are you sure you want to delete the debt with ${deleteItem.personName}?`}
            onConfirm={handleDelete}
            onCancel={() => setDeleteItem(null)}
            confirmText="Delete"
            isLoading={submitting}
            isDangerous
          />
        )}
      </AnimatePresence>
      </div>
    </AppShell>
  );
}
