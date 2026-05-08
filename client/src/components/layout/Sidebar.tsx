import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Inbox,
  BarChart3,
  Settings,
  FileText,
  Webhook,
  Send,
  Globe,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldOff,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { SkySendLogo, SkySendLogoMark } from '../SkySendLogo';
import { useUnreadCount } from '../../hooks/useUnreadCount';

const mainNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Templates', href: '/templates', icon: FileText },
];

const toolsNav = [
  { name: 'Webhooks', href: '/developer', icon: Webhook },
];

const settingsNav = [
  { name: 'SMTP Accounts', href: '/smtp-accounts', icon: Send },
  { name: 'Domains', href: '/domains', icon: Globe },
  { name: 'Suppression', href: '/suppression', icon: ShieldOff },
  { name: 'Verification', href: '/verification', icon: ShieldCheck },
  { name: 'Team', href: '/team', icon: UserPlus },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function NavItem({
  item,
  isActive,
  collapsed,
  badge,
}: {
  item: { name: string; href: string; icon: React.ElementType };
  isActive: boolean;
  collapsed: boolean;
  badge?: number;
}) {
  const Icon = item.icon;
  const badgeLabel = badge && badge > 0 ? (badge > 99 ? '99+' : String(badge)) : null;

  return (
    <NavLink
      to={item.href}
      title={collapsed ? item.name : undefined}
      className={cn(
        'flex items-center gap-3 py-2 text-[13px] font-medium rounded-lg transition-colors duration-150',
        collapsed ? 'justify-center px-2' : 'px-3',
        isActive
          ? 'bg-gradient-to-r from-[rgba(99,102,241,0.12)] to-[rgba(139,92,246,0.06)] text-[#6366F1] border-l-[2px] border-l-[#6366F1] relative'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      )}
    >
      <div className="relative flex-shrink-0">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
        {badge != null && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6366F1] text-white text-[9px] font-bold px-0.5 leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      {!collapsed && <span className="flex-1">{item.name}</span>}
      {!collapsed && badge != null && badge > 0 && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6366F1] text-white text-[10px] font-bold px-1 leading-none">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
}

function NavSection({
  title,
  items,
  collapsed,
  badges,
}: {
  title?: string;
  items: Array<{ name: string; href: string; icon: React.ElementType }>;
  collapsed: boolean;
  badges?: Record<string, number>;
}) {
  const location = useLocation();

  return (
    <div className="mb-6">
      {title && !collapsed && (
        <div className="px-3 mb-2">
          <span className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-widest">
            {title}
          </span>
        </div>
      )}
      {title && collapsed && (
        <div className="mb-2 mx-auto w-4 h-px bg-[var(--border-subtle)]" />
      )}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
            collapsed={collapsed}
            badge={badges?.[item.href]}
          />
        ))}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { user, signOut: logout } = useAuth();
  const { collapsed, toggle } = useSidebar();
  const workspaceName = user?.email?.split('@')[0] || 'Workspace';
  const unreadCount = useUnreadCount();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-[width] duration-200',
        collapsed ? 'w-[64px]' : 'w-[260px]'
      )}
    >
      {/* Logo + collapse toggle */}
      <div className={cn(
        'flex items-center h-14 border-b border-[var(--border-subtle)]',
        collapsed ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        <div className="flex items-center gap-2.5 overflow-hidden">
          {collapsed ? (
            <SkySendLogoMark className="h-7 w-7 flex-shrink-0" />
          ) : (
            <span className="text-[17px]"><SkySendLogo /></span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="flex justify-center py-2">
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 py-3 overflow-y-auto', collapsed ? 'px-2' : 'px-3')}>
        <NavSection items={mainNav} collapsed={collapsed} badges={{ '/inbox': unreadCount }} />
        <NavSection title="Tools" items={toolsNav} collapsed={collapsed} />
        <NavSection title="Configure" items={settingsNav} collapsed={collapsed} />
      </nav>

      {/* User section */}
      <div className="border-t border-[var(--border-subtle)] p-2">
        <div className={cn(
          'flex items-center gap-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group',
          collapsed ? 'justify-center px-1' : 'px-3'
        )}>
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-semibold text-white">
              {workspaceName[0].toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {workspaceName}
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] truncate">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  logout();
                }}
                className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] opacity-0 group-hover:opacity-100 transition-all"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
