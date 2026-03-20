import { useState } from 'react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import AccountCard from '../components/Accounts/AccountCard';
import AddAccountModal from '../components/Accounts/AddAccountModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { useFinance } from '../context/FinanceContext';
import { accountsApi } from '../api/accountsApi';
import { formatMoney } from '../utils/format';
import { getErrorMessage } from '../utils/http';

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
        await accountsApi.update(editData.id, payload);
        toast.success('Account updated');
      } else {
        await accountsApi.create(payload);
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
      await accountsApi.delete(deleteData.id);
      toast.success('Account deleted');
      setDeleteData(null);
      await refreshAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Accounts">
      <div className="fade-page space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Accounts</h2>
            <p className="text-sm text-slate-500">Total balance: {formatMoney(totalBalanceUZS, 'UZS')}</p>
          </div>
          <button onClick={() => { setEditData(null); setModalOpen(true); }} className="rounded-lg bg-blue-600 px-4 py-2 text-white">+ Add Account</button>
        </div>

        {accountsLoading ? <LoadingSpinner label="Loading accounts..." /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {accounts.length ? accounts.map((a) => (
              <AccountCard
                key={a.id}
                account={a}
                onEdit={(acc) => { setEditData(acc); setModalOpen(true); }}
                onDelete={(acc) => setDeleteData(acc)}
              />
            )) : <div className="rounded-xl border bg-white p-6 text-slate-500">You have no accounts yet.</div>}
          </div>
        )}

        <AddAccountModal open={modalOpen} onOpenChange={setModalOpen} editData={editData} onSubmit={onCreateOrUpdate} submitting={submitting} />
        <ConfirmDialog open={!!deleteData} onOpenChange={(v) => !v && setDeleteData(null)} message={`Delete account "${deleteData?.name}"?`} onConfirm={onDelete} loading={submitting} />
      </div>
    </AppShell>
  );
}
