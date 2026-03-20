export default function BudgetOverview({ target, actual }) {
  const pct = target > 0 ? (actual / target) * 100 : 0;
  const color = pct > 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="text-lg font-semibold">Monthly Income Target</h3>
      <p className="mt-2 text-sm text-slate-500">{actual.toLocaleString()} / {target.toLocaleString()}</p>
      <div className="mt-2 h-3 rounded-full bg-slate-100">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <p className="mt-2 text-sm text-slate-600">{pct.toFixed(1)}%</p>
    </div>
  );
}
