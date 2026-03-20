import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import AppShell from '../components/Layout/AppShell';
import ExpenseList from '../components/Expenses/ExpenseList';
import AddExpenseModal from '../components/Expenses/AddExpenseModal';
import EditExpenseModal from '../components/Expenses/EditExpenseModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { expensesApi } from '../api/expensesApi';
import { useFinance } from '../context/FinanceContext';
import { getErrorMessage, toArray } from '../utils/http';

export default function Expenses() {
  const { accounts, refreshAccounts } = useFinance();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await expensesApi.getAll();
      setItems(toArray(data?.data || data));
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load expenses'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (payload) => {
    setSubmitting(true);
    try {
      await expensesApi.create(payload);
      toast.success('Expense added');
      setAddOpen(false);
      await Promise.all([load(), refreshAccounts()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to add expense'));
    } finally {
      setSubmitting(false);
    }
  };

  const edit = async (payload) => {
    if (!editItem) return;
    setSubmitting(true);
    try {
      await expensesApi.update(editItem.id, payload);
      toast.success('Expense updated');
      setEditItem(null);
      await Promise.all([load(), refreshAccounts()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update expense'));
    } finally {
      setSubmitting(false);
    }
  };

  const del = async () => {
    if (!deleteItem) return;
    setSubmitting(true);
    try {
      await expensesApi.delete(deleteItem.id);
      toast.success('Expense deleted');
      setDeleteItem(null);
      await Promise.all([load(), refreshAccounts()]);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to delete expense'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Expenses">
      <div className="fade-page space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Expenses</h2>
          <button onClick={() => setAddOpen(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-white">+ Add Expense</button>
        </div>

        {loading ? <LoadingSpinner label="Loading expenses..." /> : <ExpenseList items={items} onEdit={setEditItem} onDelete={setDeleteItem} />}

        <AddExpenseModal open={addOpen} onOpenChange={setAddOpen} onSubmit={add} submitting={submitting} accounts={accounts} />
        <EditExpenseModal open={!!editItem} onOpenChange={(v) => !v && setEditItem(null)} onSubmit={edit} submitting={submitting} accounts={accounts} expense={editItem} />
        <ConfirmDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)} message="Delete this expense?" onConfirm={del} loading={submitting} />
      </div>
    </AppShell>
  );
}
