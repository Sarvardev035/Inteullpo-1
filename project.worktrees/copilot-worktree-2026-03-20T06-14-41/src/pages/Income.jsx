import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import IncomeList from '../components/Income/IncomeList';
import AddIncomeModal from '../components/Income/AddIncomeModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { incomeApi } from '../api/incomeApi';
import { useFinance } from '../context/FinanceContext';
import { getErrorMessage, toArray } from '../utils/http';

export default function Income() {
  const { accounts, refreshAccounts } = useFinance();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await incomeApi.getAll();
      setItems(toArray(data?.data || data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load income'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (payload) => {
    setSubmitting(true);
    try {
      if (editData) {
        await incomeApi.update(editData.id, payload);
        toast.success('Income updated');
      } else {
        await incomeApi.create(payload);
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
      await incomeApi.delete(deleteItem.id);
      toast.success('Income deleted');
      setDeleteItem(null);
      await Promise.all([load(), refreshAccounts()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete income'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Income">
      <div className="fade-page space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Income</h2>
          <button onClick={() => { setEditData(null); setModalOpen(true); }} className="rounded-lg bg-blue-600 px-4 py-2 text-white">+ Add Income</button>
        </div>

        {loading ? <LoadingSpinner label="Loading income..." /> : <IncomeList items={items} onEdit={(item) => { setEditData(item); setModalOpen(true); }} onDelete={setDeleteItem} />}

        <AddIncomeModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={submit} submitting={submitting} accounts={accounts} editData={editData} />
        <ConfirmDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)} message="Delete this income entry?" onConfirm={del} loading={submitting} />
      </div>
    </AppShell>
  );
}
