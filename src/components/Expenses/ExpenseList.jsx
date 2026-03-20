import { toReadableDate, formatMoney } from '../../utils/format';

export default function ExpenseList({ items, onEdit, onDelete }) {
  if (!items.length) return <div className="rounded-xl border bg-white p-6 text-center text-slate-500">No expenses found. Start tracking your spending!</div>;

  return (
    <div className="space-y-2">
      {items.map((exp) => (
        <div key={exp.id} className="flex items-center justify-between rounded-xl border bg-white p-3">
          <div>
            <p className="font-medium">{exp.description || exp.category}</p>
            <p className="text-sm text-slate-500">{toReadableDate(exp.date)} · {exp.category}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-red-600">-{formatMoney(exp.amount, exp.currency || 'UZS')}</p>
            <div className="mt-1 space-x-1">
              <button onClick={() => onEdit(exp)} className="rounded border px-2 py-1 text-xs">Edit</button>
              <button onClick={() => onDelete(exp)} className="rounded bg-red-500 px-2 py-1 text-xs text-white">Delete</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
