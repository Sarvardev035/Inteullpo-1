import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Menu,
  Handshake,
  PieChart,
  BarChart3,
  Calendar,
  LogOut,
  X,
} from 'lucide-react';

const mainTabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: TrendingDown },
  { to: '/income', label: 'Income', icon: TrendingUp },
  { to: '/transfers', label: 'Transfers', icon: ArrowLeftRight },
  { to: '#', label: 'More', icon: Menu, isMenu: true },
];

const moreMenuItems = [
  { to: '/debts', label: 'Debts', icon: Handshake },
  { to: '/budget', label: 'Budget', icon: PieChart },
  { to: '/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
];

export default function BottomNav() {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowMoreMenu(false);
    navigate('/login');
  };

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white"
        style={{ height: '64px', paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      >
        {mainTabs.map(({ to, label, icon: Icon, isMenu }) =>
          isMenu ? (
            <button
              key={label}
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors duration-200 ${
                showMoreMenu
                  ? 'text-[var(--blue)]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ) : (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-4 py-2 relative transition-colors duration-200 ${
                  isActive ? 'text-[var(--blue)]' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} />
                  {isActive && (
                    <div className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[var(--blue)]" />
                  )}
                  <span className="text-xs font-medium">{label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </nav>

      {/* More Menu Sheet */}
      <AnimatePresence>
        {showMoreMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMoreMenu(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white"
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white rounded-t-2xl">
                <h2 className="text-lg font-semibold text-slate-900">More Options</h2>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="rounded-lg p-2 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {moreMenuItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setShowMoreMenu(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 ${
                        isActive
                          ? 'border-l-4 border-[var(--blue)] bg-blue-soft text-[var(--blue)]'
                          : 'border-l-4 border-transparent text-slate-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon size={20} />
                    <span className="font-medium">{label}</span>
                  </NavLink>
                ))}

                {/* Divider */}
                <div className="my-2 h-px bg-slate-200" />

                {/* Logout */}
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors duration-200 text-red-600 hover:bg-red-soft"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>

              {/* Safe area bottom */}
              <div style={{ height: 'env(safe-area-inset-bottom)' }} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
