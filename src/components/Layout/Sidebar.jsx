import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Handshake, PieChart, BarChart3, Calendar } from 'lucide-react';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: ArrowDownCircle },
  { to: '/income', label: 'Income', icon: ArrowUpCircle },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { to: '/debts', label: 'Debts', icon: Handshake },
  { to: '/budget', label: 'Budget', icon: PieChart },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col bg-[var(--navy)] text-white">
      <div className="px-6 py-5 text-2xl font-bold">Finly</div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive ? 'bg-white/10 border-l-4 border-blue-500 opacity-100' : 'opacity-60 hover:opacity-100'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-2 text-xs text-white/60">Logged in user</div>
        <button onClick={logout} className="w-full rounded-lg bg-red-500 px-3 py-2 text-sm font-medium">Logout</button>
      </div>
    </aside>
  );
}
