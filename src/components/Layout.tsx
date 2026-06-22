import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  PenLine,
  CheckSquare,
  BarChart3,
  Wrench,
  Settings,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react'
import { useTracker } from '../context/TrackerContext'
import { useTheme } from '../context/ThemeContext'
import { LiveClock } from './LiveClock'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/track', icon: PenLine, label: 'Goals' },
  { to: '/checklist', icon: CheckSquare, label: 'Checklist' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/tools', icon: Wrench, label: 'Tools' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Layout() {
  const { data } = useTracker()
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      <div className="bg-orbs" aria-hidden />
      <LiveClock />

      <button
        type="button"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="theme-toggle fixed top-2 right-4 z-[100] p-2.5 rounded-xl transition-all sm:hidden"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-teal-600" />
        )}
      </button>

      <aside className="hidden lg:flex lg:w-60 xl:w-64 lg:fixed lg:top-11 lg:h-[calc(100vh-2.75rem)] glass border-r border-white/5 z-50 flex-col">
        <div className="p-5 sm:p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-lg gradient-text leading-tight">LifeTracker</h1>
              <p className="text-xs theme-muted truncate">{data.settings.name}</p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-0.5 hidden lg:block flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/10 text-teal-300 border border-teal-500/25 shadow-sm'
                    : 'theme-muted hover:theme-text hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block px-5 py-4 border-t border-white/5">
          <p className="text-[10px] theme-muted text-center">Your data stays on device</p>
        </div>
      </aside>

      <main className="flex-1 lg:ml-60 xl:ml-64 pt-11 pb-20 lg:pb-6 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 z-50 safe-area-pb">
        <div className="flex justify-around items-center py-1.5 px-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-[10px] font-medium transition-all min-w-[56px] ${
                  isActive
                    ? 'text-teal-400 bg-teal-500/10'
                    : 'theme-muted'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
