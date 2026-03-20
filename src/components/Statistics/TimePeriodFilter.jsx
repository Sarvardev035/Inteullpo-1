const periods = ['daily', 'weekly', 'monthly', 'yearly'];

export default function TimePeriodFilter({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl bg-white p-1 shadow-sm border">
      {periods.map((p) => (
        <button key={p} onClick={() => onChange(p)} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${value === p ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{p}</button>
      ))}
    </div>
  );
}
