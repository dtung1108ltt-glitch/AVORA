import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Map, Mic, User } from 'lucide-react';

const tabs = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/jobs', label: 'Jobs', Icon: Briefcase },
  { to: '/roadmaps', label: 'Roadmaps', Icon: Map },
  { to: '/interviews', label: 'Practice', Icon: Mic },
  { to: '/profile', label: 'Profile', Icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden border-t border-stone-200 bg-white/95 px-2 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-1">
        {tabs.map(({ to, label, Icon }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[48px] w-full flex-col items-center justify-center gap-1 rounded-3xl px-2 py-2 text-[11px] font-medium transition ${
                isActive
                  ? 'text-sky-600 bg-sky-50 shadow-sm shadow-sky-200/50 dark:bg-sky-500/10 dark:text-sky-300'
                  : 'text-stone-500 hover:text-sky-600 dark:text-zinc-400 dark:hover:text-sky-300'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'fill-current' : ''}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
