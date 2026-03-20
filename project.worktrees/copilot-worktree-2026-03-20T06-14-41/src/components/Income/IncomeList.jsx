import { formatMoney, toReadableDate } from '../../utils/format';

export default function IncomeList({ items, onEdit, onDelete }) {
  if (!items.length) return <div className="rounded-xl border bg-white p-6 text-center text-slate-500">No income recorded yet.</div>;

  return (
    <div className="space-y-2">
      {items.map((inc) => (
        <div key={inc.id} className="flex items-center justify-between rounded-xl border bg-white p-3">
          <div>
            <p className="font-medium">{inc.source || inc.description || inc.category}</p>
            <p className="text-sm text-slate-500">{toReadableDate(inc.date)} · {inc.category}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-green-600">+{formatMoney(inc.amount, inc.currency || 'UZS')}</p>
            <div className="mt-1 space-x-1">
              <button onClick={() => onEdit(inc)} className="rounded border px-2 py-1 text-xs">Edit</button>
              <button onClick={() => onDelete(inc)} className="rounded bg-red-500 px-2 py-1 text-xs text-white">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
