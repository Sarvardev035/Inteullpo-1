import { useEffect, useState } from 'react';
import Modal from '../shared/Modal';
import { CURRENCIES } from '../../utils/constants';
import { toISODate } from '../../utils/format';

const blank = { personName: '', amount: '', currency: 'UZS', dueDate: toISODate(new Date()), type: 'BORROWED', description: '' };

export default function AddDebtModal({ open, onOpenChange, onSubmit, submitting }) {
  const [form, setForm] = useState(blank);
  useEffect(() => { if (open) setForm(blank); }, [open]);

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add debt">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, amount: Number(form.amount), dueDate: toISODate(form.dueDate), status: 'OPEN' }); }} className="space-y-3">
        <input required value={form.personName} onChange={(e) => setForm((p) => ({ ...p, personName: e.target.value }))} placeholder="Person name" className="w-full rounded-lg border px-3 py-2" />
        <input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Amount" className="w-full rounded-lg border px-3 py-2" />
        <select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} className="w-full rounded-lg border px-3 py-2">{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
        <input required type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="w-full rounded-lg border px-3 py-2" />
        <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="w-full rounded-lg border px-3 py-2"><option value="BORROWED">I Owe</option><option value="LENT">Owed to me</option></select>
        <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" className="w-full rounded-lg border px-3 py-2" />
        <button disabled={submitting} className="w-full rounded-lg bg-blue-600 py-2 text-white">{submitting ? 'Saving...' : 'Save'}</button>
      </form>
    </Modal>
  );
}
