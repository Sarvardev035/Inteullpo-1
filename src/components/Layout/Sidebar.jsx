import { useState } from 'react';
import { NavLink as RouterLink, useNavigate } from 'react-router-dom';
import {
  Zap,
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Handshake,
  PieChart,
  BarChart3,
  Calendar,
  LogOut,
} from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const navGroups = [
  {
    title: 'MAIN',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/expenses', label: 'Expenses', icon: TrendingDown },
      { to: '/income', label: 'Income', icon: TrendingUp },
      { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
    ],
  },
  {
    title: 'MANAGE',
    links: [
      { to: '/debts', label: 'Debts', icon: Handshake },
      { to: '/budget', label: 'Budget', icon: PieChart },
      { to: '/statistics', label: 'Statistics', icon: BarChart3 },
      { to: '/calendar', label: 'Calendar', icon: Calendar },
    ],
  },
];

function NavItem({ to, icon: Icon, label, collapsed }) {
  return (
    <RouterLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200
        ${
          isActive
            ? 'border-l-4 border-[var(--blue)] bg-white/12 text-white'
            : 'border-l-4 border-transparent text-slate-400 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon size={18} className="flex-shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </RouterLink>
  );
}

export default function Sidebar({ collapsed = false }) {
  const navigate = useNavigate();
  const [userEmail] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return 'user@finly.com';
    try {
      return JSON.parse(userStr).email || 'user@finly.com';
    } catch {
      return 'user@finly.com';
    }
  });

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 'w-16' : 'w-60';

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-[var(--navy)] text-white transition-all duration-300 ${sidebarWidth} flex flex-col border-r border-white/10`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2 border-b border-white/10 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0">
          <Zap size={24} className="text-[var(--blue)]" />
        </div>
        {!collapsed && <span className="text-xl font-bold font-space-grotesk">Finly</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.links.map(({ to, label, icon: Icon }) =>
                collapsed ? (
                  <Tooltip key={to} content={label} side="right">
                    <NavItem to={to} label={label} icon={Icon} collapsed={collapsed} />
                  </Tooltip>
                ) : (
                  <NavItem key={to} to={to} label={label} icon={Icon} collapsed={collapsed} />
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom: User & Logout */}
      <div className={`border-t border-white/10 px-3 py-4 ${collapsed ? 'space-y-2' : ''}`}>
        {!collapsed && (
          <div className="mb-3 rounded-lg bg-white/5 px-3 py-3">
            <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--blue)] text-xs font-bold">
              U
            </div>
            <div className="mt-2 text-xs font-medium text-white">User</div>
            <div className="truncate text-xs text-slate-400">{userEmail}</div>
          </div>
        )}
        <Tooltip content={collapsed ? 'Logout' : ''} side={collapsed ? 'right' : 'top'}>
          <button
            onClick={logout}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 text-red-400 hover:bg-red-500/20 w-full ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
