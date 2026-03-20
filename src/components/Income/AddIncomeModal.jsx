import { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import { INCOME_CATEGORIES } from '../../utils/constants';
import { toISODate } from '../../utils/format';

const blank = (accounts) => ({ amount: '', date: toISODate(new Date()), description: '', source: '', category: 'SALARY', accountId: accounts?.[0]?.id || '' });

export default function AddIncomeModal({ open, onOpenChange, onSubmit, submitting, accounts, editData }) {
  const [form, setForm] = useState(blank(accounts));

  useEffect(() => {
    if (editData) {
      setForm({
        amount: editData.amount,
        date: toISODate(editData.date),
        description: editData.description || '',
        source: editData.source || '',
        category: editData.category || 'SALARY',
        accountId: editData.accountId || accounts?.[0]?.id || '',
      });
    } else {
      setForm(blank(accounts));
    }
  }, [open, accounts, editData]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={editData ? 'Edit income' : 'Add income'}>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, amount: Number(form.amount), date: toISODate(form.date) }); }} className="space-y-3">
        <input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Amount" className="w-full rounded-lg border px-3 py-2" />
        <input required type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
        <input value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} placeholder="Source" className="w-full rounded-lg border px-3 py-2" />
        <input required value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full rounded-lg border px-3 py-2" />
        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-lg border px-3 py-2">{INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
        <select required value={form.accountId} onChange={(e) => setForm((p) => ({ ...p, accountId: e.target.value }))} className="w-full rounded-lg border px-3 py-2">{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
        <button disabled={submitting} className="w-full rounded-lg bg-blue-600 py-2 text-white">{submitting ? 'Saving...' : 'Save'}</button>
      </form>
    </Modal>
  );
}
