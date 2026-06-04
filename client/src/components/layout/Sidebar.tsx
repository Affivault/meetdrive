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
  CalendarClock,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { SkySendLogo, SkySendLogoMark } from '../SkySendLogo';
import { useUnreadCount } from '../../hooks/useUnreadCount';

const mainNav = [
  { name: 'Dashboard',  href: '/dashboard', icon: LayoutDashboard },
  { name: 'Campaigns',  href: '/campaigns', icon: Megaphone },
  { name: 'Unibox',     href: '/inbox',     icon: Inbox },
  { name: 'Lead Lists', href: '/contacts',  icon: Users },
  { name: 'Analytics',  href: '/analytics', icon: BarChart3 },
  { name: 'Templates',  href: '/templates', icon: FileText },
  { name: 'Schedules',  href: '/schedules', icon: CalendarClock },
];

const toolsNav = [
  { name: 'Webhooks', href: '/developer', icon: Webhook },
];

const settingsNav = [
  { name: 'SMTP',         href: '/smtp-accounts', icon: Send },
  { name: 'Domains',      href: '/domains',        icon: Globe },
  { name: 'Suppression',  href: '/suppression',    icon: ShieldOff },
  { name: 'Verification', href: '/verification',   icon: ShieldCheck },
  { name: 'Team',         href: '/team',            icon: UserPlus },
  { name: 'Settings',     href: '/settings',        icon: Settings },
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

  return (
    <NavLink
      to={item.href}
      title={collapsed ? item.name : undefined}
      className={cn(
        'group relative flex items-center gap-2.5 rounded-[6px] transition-colors duration-100',
        collapsed ? 'justify-center h-8 w-8 mx-auto' : 'h-[30px] px-2.5',
        isActive
          ? 'bg-[rgba(99,102,241,0.1)] text-[#6366F1]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
      )}
    >
      {/* Active pill */}
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[var(--indigo)]" />
      )}

      <Icon className="h-[15px] w-[15px] flex-shrink-0" strokeWidth={isActive ? 2 : 1.75} />

      {!collapsed && (
        <span className="flex-1 text-[13px] font-medium truncate">{item.name}</span>
      )}

      {/* Badge */}
      {badge != null && badge > 0 && (
        collapsed ? (
          <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--indigo)] text-white text-[9px] font-bold px-0.5 leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        ) : (
          <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--indigo)] text-white text-[9px] font-bold px-1 leading-none">
            {badge > 99 ? '99+' : badge}
          </span>
        )
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
    <div className="mb-4">
      {title && !collapsed && (
        <div className="px-2.5 mb-1">
          <span className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.08em]">
            {title}
          </span>
        </div>
      )}
      {title && collapsed && (
        <div className="mb-1.5 mx-auto w-5 h-px bg-[var(--border-subtle)]" />
      )}
      <div className="space-y-px">
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
        'fixed inset-y-0 left-0 z-40 flex flex-col bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] transition-[width] duration-200 ease-out',
        collapsed ? 'w-[52px]' : 'w-[220px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-[48px] border-b border-[var(--border-subtle)] flex-shrink-0',
        collapsed ? 'justify-center px-2' : 'px-3 gap-2'
      )}>
        {collapsed ? (
          <button onClick={toggle} className="flex items-center justify-center" title="Expand sidebar">
            <SkySendLogoMark className="h-6 w-6 flex-shrink-0" />
          </button>
        ) : (
          <>
            <span className="flex-1 overflow-hidden">
              <SkySendLogo />
            </span>
            <button
              onClick={toggle}
              className="flex-shrink-0 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        'flex-1 py-2.5 overflow-y-auto overflow-x-hidden',
        collapsed ? 'px-1.5' : 'px-2'
      )}>
        <NavSection items={mainNav} collapsed={collapsed} badges={{ '/inbox': unreadCount }} />
        <NavSection title="Tools" items={toolsNav} collapsed={collapsed} />
        <NavSection title="Config" items={settingsNav} collapsed={collapsed} />
      </nav>

      {/* User section */}
      <div className={cn(
        'border-t border-[var(--border-subtle)] flex-shrink-0',
        collapsed ? 'p-1.5' : 'p-2'
      )}>
        <div className={cn(
          'flex items-center rounded-[6px] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group',
          collapsed ? 'justify-center h-8 w-8 mx-auto' : 'gap-2 px-2 h-9'
        )}>
          {/* Avatar */}
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-white">
              {workspaceName[0].toUpperCase()}
            </span>
          </div>

          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-medium text-[var(--text-primary)] truncate leading-tight">
                  {workspaceName}
                </div>
                <div className="text-[10.5px] text-[var(--text-tertiary)] truncate leading-tight">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); logout(); }}
                className="flex-shrink-0 p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--bg-elevated)] opacity-0 group-hover:opacity-100 transition-all duration-150"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
