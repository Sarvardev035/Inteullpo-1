import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import DebtList from '../components/Debts/DebtList';
import AddDebtModal from '../components/Debts/AddDebtModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { getDebts, createDebt, updateDebt, removeDebt } from '../api/debtsApi';
import { getErrorMessage, toArray } from '../utils/http';
import { formatMoney } from '../utils/format';

export default function Debts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('BORROWED');
  const [deleteItem, setDeleteItem] = useState(null);

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

  useEffect(() => { load(); }, []);

  const submit = async (payload) => {
    setSubmitting(true);
    try {
      await createDebt(payload);
      toast.success('Debt added');
      setOpen(false);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add debt'));
    } finally {
      setSubmitting(false);
    }
  };

  const closeDebt = async (debt) => {
    setSubmitting(true);
    try {
      await updateDebt(debt.id, { ...debt, status: 'CLOSED' });
      toast.success('Debt marked as closed');
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update debt'));
    } finally {
      setSubmitting(false);
    }
  };

  const del = async () => {
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

  const filtered = items.filter((d) => d.type === tab);
  const owedToMe = useMemo(() => items.filter((d) => d.type === 'LENT' && d.status === 'OPEN').reduce((s, d) => s + Number(d.amount || 0), 0), [items]);
  const iOwe = useMemo(() => items.filter((d) => d.type === 'BORROWED' && d.status === 'OPEN').reduce((s, d) => s + Number(d.amount || 0), 0), [items]);

  return (
    <AppShell title="Debts">
      <div className="fade-page space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Debts</h2>
          <button onClick={() => setOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-white">+ Add Debt</button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm text-red-700">I owe</p><p className="text-2xl font-bold text-red-700">{formatMoney(iOwe, 'UZS')}</p></div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4"><p className="text-sm text-green-700">Owed to me</p><p className="text-2xl font-bold text-green-700">{formatMoney(owedToMe, 'UZS')}</p></div>
        </div>

        <div className="inline-flex rounded-xl bg-white p-1 shadow-sm border">
          <button onClick={() => setTab('BORROWED')} className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'BORROWED' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>I Owe</button>
          <button onClick={() => setTab('LENT')} className={`rounded-lg px-3 py-1.5 text-sm ${tab === 'LENT' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>Owed to Me</button>
        </div>

        {loading ? <LoadingSpinner label="Loading debts..." /> : <DebtList debts={filtered} onClose={closeDebt} onDelete={setDeleteItem} />}

        <AddDebtModal open={open} onOpenChange={setOpen} onSubmit={submit} submitting={submitting} />
        <ConfirmDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)} message="Delete this debt record?" onConfirm={del} loading={submitting} />
      </div>
    </AppShell>
  );
}
