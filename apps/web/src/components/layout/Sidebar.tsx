import { Link, useLocation } from 'react-router-dom';
import { X, Home, User, Briefcase, Map, Mic, Heart, Play, Settings, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard', color: '#6366F1' },
  { path: '/profile', icon: User, label: 'Profile', color: '#06B6D4' },
  { path: '/assessment', icon: Briefcase, label: 'Assessment', color: '#F59E0B' },
  { path: '/jobs', icon: Briefcase, label: 'Jobs', color: '#10B981' },
  { path: '/roadmaps', icon: Map, label: 'Roadmaps', color: '#8B5CF6' },
  { path: '/interviews', icon: Mic, label: 'Interviews', color: '#EC4899' },
  { path: '/confidence', icon: Heart, label: 'Confidence', color: '#EF4444' },
  { path: '/simulation', icon: Play, label: 'Simulation', color: '#3B82F6' },
];

const bottomItems = [
  { path: '/settings', icon: Settings, label: 'Settings', color: '#64748B' },
  { path: '/help', icon: HelpCircle, label: 'Help', color: '#78716C' },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -256 }}
        animate={{ x: isOpen ? 0 : -256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed top-16 left-0 bottom-0 w-64 z-50 lg:translate-x-0 lg:static lg:z-auto
          flex flex-col h-full
        `}
        style={{
          background: 'rgba(11, 16, 32, 0.95)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
        }}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        {/* Close Button - Mobile */}
        <motion.button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Close sidebar"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="h-5 w-5" />
        </motion.button>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative
                    ${isActive 
                      ? 'text-white font-semibold' 
                      : 'text-white/60 hover:text-white/80'}
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active Background Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`,
                        boxShadow: `0 0 20px ${item.color}40`,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10">
                    <Icon
                      className={`h-5 w-5 transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                      style={{ color: isActive ? item.color : 'currentColor' }}
                    />
                  </div>

                  {/* Label */}
                  <span className="relative z-10">{item.label}</span>

                  {/* Hover Ring */}
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div
          className="px-3 py-4 space-y-1"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {bottomItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: (navItems.length + index) * 0.05 }}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative
                    ${isActive 
                      ? 'text-white font-semibold' 
                      : 'text-white/60 hover:text-white/80'}
                  `}
                >
                  {/* Active Background Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}10 100%)`,
                        boxShadow: `0 0 20px ${item.color}40`,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10">
                    <Icon
                      className={`h-5 w-5 transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
                      style={{ color: isActive ? item.color : 'currentColor' }}
                    />
                  </div>

                  {/* Label */}
                  <span className="relative z-10">{item.label}</span>

                  {/* Hover Ring */}
                  {!isActive && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Branding Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="px-4 py-4 text-center border-t"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <p className="text-xs text-white/40">AVORA v1.0</p>
          <p className="text-xs text-white/50 mt-1">AI Career Companion</p>
        </motion.div>
      </motion.aside>
    </>
  );
}