import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Search,
  Sun,
  Moon,
  Bell,
  Settings,
  User,
  ChevronDown,
  Command,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 backdrop-blur-xl px-8">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1">
        <div className="relative flex items-center h-9 w-80 rounded-lg border border-[var(--border-default)] bg-[var(--bg-app)] hover:border-[var(--border-default)] transition-colors shadow-sm">
          <Search className="h-4 w-4 text-[var(--text-tertiary)] ml-3" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-full bg-transparent px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          />
          <div className="flex items-center gap-0.5 mr-2.5 px-1.5 py-0.5 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px] text-[var(--text-tertiary)] font-medium">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-1">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors">
          <Bell className="h-4 w-4" strokeWidth={1.5} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#6366F1] ring-2 ring-[var(--bg-surface)] animate-pulse" />
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>

        <div className="h-5 w-px bg-[var(--border-subtle)] mx-1.5" />

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 h-8 pl-1.5 pr-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-[10px] font-semibold text-white shadow-sm">
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <ChevronDown className={cn(
              "h-3 w-3 text-[var(--text-tertiary)] transition-transform duration-150",
              menuOpen && "rotate-180"
            )} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1.5 shadow-2xl animate-slide-up">
                <div className="px-3 py-2.5 border-b border-[var(--border-subtle)] mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>

                <button
                  onClick={() => { setMenuOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>

                <div className="border-t border-[var(--border-subtle)] mt-1 pt-1">
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--error)] hover:bg-[var(--error-bg)] transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
