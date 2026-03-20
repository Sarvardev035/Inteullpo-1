import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import AddAccountModal from '../components/Accounts/AddAccountModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { Button, EmptyState } from '../components/ui';
import { useFinance } from '../context/FinanceContext';
import { createAccount, updateAccount, removeAccount } from '../api/accountsApi';
import { getErrorMessage } from '../utils/http';
import { formatCurrency, getCategoryMeta } from '../utils/helpers';
import { pageVariants, listVariants, itemVariants, cardVariants, deleteExitVariants } from '../utils/animations';

export default function Accounts() {
  const { accounts, accountsLoading, refreshAccounts, totalBalanceUZS } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onCreateOrUpdate = async (payload) => {
    setSubmitting(true);
    try {
      if (editData) {
        await updateAccount(editData.id, payload);
        toast.success('Account updated');
      } else {
        await createAccount(payload);
        toast.success('Account created');
      }
      setModalOpen(false);
      setEditData(null);
      await refreshAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save account'));
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!deleteData) return;
    setSubmitting(true);
    try {
      await removeAccount(deleteData.id);
      toast.success('Account deleted');
      setDeleteData(null);
      await refreshAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete account'));
    } finally {
      setSubmitting(false);
    }
  };

  // Account type emoji mapping
  const getAccountTypeEmoji = (type) => {
    const map = {
      CHECKING: '💳',
      SAVINGS: '🏦',
      CREDIT: '💰',
      CARD: '💳',
    };
    return map[type] || '💼';
  };

  // Mask account number
  const maskAccountNumber = (id) => {
    const idStr = String(id);
    return `••••${idStr.slice(-4)}`;
  };

  const sortedAccounts = useMemo(() => {
    return [...accounts].sort((a, b) => (b.balance || 0) - (a.balance || 0));
  }, [accounts]);

  return (
    <AppShell title="My Accounts">
      <motion.div
        initial={pageVariants.initial}
        animate={pageVariants.enter}
        className="space-y-6 pb-24"
      >
        {/* Header */}
        <motion.div variants={cardVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Accounts</h1>
            <p className="mt-1 text-sm text-slate-500">Total balance: {formatCurrency(totalBalanceUZS)}</p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
          >
            <Plus size={18} className="mr-1" /> Add Account
          </Button>
        </motion.div>

        {accountsLoading ? (
          <LoadingSpinner label="Loading accounts..." />
        ) : accounts.length > 0 ? (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {sortedAccounts.map((account, idx) => (
                <motion.div
                  key={account.id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={deleteExitVariants.exit}
                  transition={{ delay: idx * 0.05 }}
                  className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Account Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {account.type || 'CARD'} • {account.currency || 'UZS'}
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-900">{account.name}</h3>
                    </div>
                    <span className="text-2xl">{getAccountTypeEmoji(account.type)}</span>
                  </div>

                  {/* Balance */}
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-1">Balance</p>
                    <p className="text-3xl font-bold text-slate-900">
                      {formatCurrency(account.balance, account.currency)}
                    </p>
                  </div>

                  {/* Account Number (Masked) */}
                  <div className="mb-4 p-3 bg-slate-100 rounded-lg">
                    <p className="text-xs text-slate-500">Account Number</p>
                    <p className="text-sm font-mono text-slate-700 mt-1">{maskAccountNumber(account.id)}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {}}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={16} /> View
                    </button>
                    <button
                      onClick={() => {
                        setEditData(account);
                        setModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteData(account)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState
            icon="💼"
            title="No accounts yet"
            description="Start by creating your first account to begin tracking your finances"
            actionLabel="Add Account"
            onAction={() => {
              setEditData(null);
              setModalOpen(true);
            }}
          />
        )}
      </motion.div>

      {/* Modals */}
      <AddAccountModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editData={editData}
        onSubmit={onCreateOrUpdate}
        submitting={submitting}
      />
      <ConfirmDialog
        open={!!deleteData}
        onOpenChange={(v) => !v && setDeleteData(null)}
        message={`Delete account "${deleteData?.name}"? This action cannot be undone.`}
        onConfirm={onDelete}
        loading={submitting}
      />
    </AppShell>
  );
}
