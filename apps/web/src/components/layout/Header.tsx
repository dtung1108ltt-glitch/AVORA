import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Roadmaps', href: '/roadmaps' },
    { label: 'Interviews', href: '/interviews' },
  ];

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300"
      style={{
        background: 'rgba(11, 16, 32, 0.8)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                {/* Premium Logo Background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 50%, #06B6D4 100%)',
                  }}
                />
                <span className="relative text-white font-bold text-sm">AI</span>
              </div>
              <div className="hidden sm:block">
                <span className="block text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  AVORA
                </span>
                <span className="block text-xs text-white/50">Career Companion</span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation */}
          <nav
            className="hidden lg:flex items-center gap-1"
            role="navigation"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <motion.button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {/* Premium Avatar */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium text-sm border-2"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-white text-sm font-medium">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown
                    className="w-4 h-4 text-white/60 transition-transform"
                    style={{
                      transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </motion.button>

                {/* Premium Dropdown Menu */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-3 w-56 rounded-xl shadow-2xl border z-20 overflow-hidden"
                        style={{
                          background: 'rgba(17, 24, 39, 0.95)',
                          backdropFilter: 'blur(20px)',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          boxShadow: '0 0 40px rgba(99, 102, 241, 0.1)',
                        }}
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                          <p className="font-semibold text-white">{user?.name}</p>
                          <p className="text-xs text-white/50 mt-1">{user?.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            to="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <User className="h-4 w-4 text-indigo-400" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 text-cyan-400" />
                            <span>Settings</span>
                          </Link>
                        </div>

                        {/* Divider & Logout */}
                        <div className="border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                          <button
                            onClick={() => {
                              logout();
                              setUserMenuOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login">
                <motion.button
                  className="btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
