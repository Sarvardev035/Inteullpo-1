import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, Outlet } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { pageVariants } from '../../utils/animations';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Navbar from './Navbar';

export default function AppShell() {
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop & Tablet: Sidebar */}
      {(isTablet || isDesktop) && <Sidebar collapsed={isTablet} />}

      {/* Mobile: Top Header */}
      {isMobile && <Navbar />}

      {/* Main Content */}
      <div
        className={`
          transition-all duration-300
          ${isDesktop ? 'ml-60' : ''}
          ${isTablet ? 'ml-16' : ''}
          ${isMobile ? 'pb-20' : 'pb-6'}
        `}
      >
        <main className="min-h-screen w-full bg-[var(--bg)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="enter"
              exit="exit"
              variants={pageVariants}
              className="w-full"
            >
              <div className={`
                mx-auto w-full max-w-[1200px]
                ${isMobile ? 'px-4 py-4' : 'px-6 py-6'}
              `}>
                <Outlet />
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile: Bottom Navigation */}
      {isMobile && <BottomNav />}
    </div>
  );
}
