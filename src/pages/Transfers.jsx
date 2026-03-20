import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import { Button, EmptyState, Input } from '../components/ui';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { getTransfers, createTransfer } from '../api/transfersApi';
import { useFinance } from '../context/FinanceContext';
import { getErrorMessage, toArray } from '../utils/http';
import { formatCurrency, smartDate } from '../utils/helpers';
import {
  pageVariants,
  listVariants,
  itemVariants,
  cardVariants,
} from '../utils/animations';

export default function Transfers() {
  const { accounts } = useFinance();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTransfers();
      setTransfers(toArray(data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load transfers'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      // In a real app, you would fetch accounts from an API
      // For now, we'll use placeholder data
      setAccounts([
        { id: '1', name: 'Checking Account' },
        { id: '2', name: 'Savings Account' },
        { id: '3', name: 'Business Account' },
      ]);
    } catch (error) {
      console.error('Failed to load accounts');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fromAccountId ||
      !formData.toAccountId ||
      !formData.amount
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.fromAccountId === formData.toAccountId) {
      toast.error('Accounts must be different');
      return;
    }

    const amount = Number(formData.amount);
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await createTransfer({
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        amount,
        description: formData.description,
      });
      toast.success('Transfer completed successfully');
      setFormData({
        fromAccountId: '',
        toAccountId: '',
        amount: '',
        description: '',
      });
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create transfer'));
    } finally {
      setSubmitting(false);
    }
  };

  const recentTransfers = useMemo(() => {
    return transfers.slice(0, 10);
  }, [transfers]);

  return (
    <AppShell title="Transfers">
      <div className="space-y-6 pb-24">
        <motion.div
          initial={pageVariants.initial}
          animate={pageVariants.enter}
        >
          <h1 className="text-3xl font-bold text-slate-900">Transfers</h1>
        </motion.div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={listVariants}
          className="grid gap-6 lg:grid-cols-3"
        >
          {/* Transfer Form */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
          >
            <h3 className="mb-6 text-lg font-semibold text-slate-900">
              New Transfer
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  From Account <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.fromAccountId}
                  onChange={(e) =>
                    setFormData({ ...formData, fromAccountId: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  To Account <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.toAccountId}
                  onChange={(e) =>
                    setFormData({ ...formData, toAccountId: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-900 focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue/20"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />

              <Input
                label="Description (optional)"
                type="text"
                placeholder="e.g., Monthly savings"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={submitting}
                disabled={submitting}
              >
                Transfer
              </Button>
            </form>
          </motion.div>

          {/* Recent Transfers */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-6 text-lg font-semibold text-slate-900">
              Recent Transfers
            </h3>

            {recentTransfers.length > 0 ? (
              <div className="space-y-3">
                {recentTransfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {transfer.fromAccount || 'From'} →{' '}
                      {transfer.toAccount || 'To'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {smartDate(transfer.date)}
                    </p>
                    <p className="mt-2 font-semibold text-slate-900">
                      {formatCurrency(transfer.amount)}
                    </p>
                    {transfer.description && (
                      <p className="text-xs text-slate-600 mt-1">
                        {transfer.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="💸"
                title="No transfers yet"
                description="Create your first transfer to get started"
              />
            )}
          </motion.div>
        </motion.div>
      )}
      </div>
    </AppShell>
  );
}
