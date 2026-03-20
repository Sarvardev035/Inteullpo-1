import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563eb', '#ef4444', '#22c55e', '#f59e0b', '#a855f7', '#64748b'];

export default function ExpenseByCategory({ data }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <h3 className="mb-3 text-lg font-semibold">Expenses by category</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
