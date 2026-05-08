import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type TrendDataPoint } from '../../api/analytics.api';
import { campaignsApi } from '../../api/campaigns.api';
import { inboxApi } from '../../api/inbox.api';
import { templateApi } from '../../api/template.api';
import { useUnreadCount } from '../../hooks/useUnreadCount';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import {
  Plus,
  ArrowUpRight,
  Megaphone,
  Users,
  Mail,
  MousePointer,
  ArrowRight,
  Send,
  Inbox,
  FileText,
  BarChart3,
  Sparkles,
  Tag,
  Play,
  Pause,
  CircleDot,
  CheckCircle2,
  Eye,
  MessageSquare,
  Globe,
  ChevronRight,
  ShieldCheck,
  ShieldOff,
  UserPlus,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

/* ─── Helpers ─────────────────────────────────────── */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtNum(n: number | undefined | null): string {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return v.toLocaleString();
}

function fmtPct(n: number | undefined | null): string {
  return `${(Number(n) || 0).toFixed(1)}%`;
}

function timeAgo(date: string): string {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/\s+/g, ' ').trim();
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: Play },
  paused: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: Pause },
  draft: { bg: 'bg-slate-500/10', text: 'text-slate-500', icon: CircleDot },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: CheckCircle2 },
};

/* ─── Mini Trend Chart ────────────────────────────── */
function MiniTrendChart({ data }: { data: TrendDataPoint[] }) {
  if (!Array.isArray(data) || data.length === 0) return null;

  // Show last 14 days
  const recent = data.slice(-14);

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={recent} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
        <XAxis dataKey="date" hide />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            fontSize: '11px',
            padding: '6px 10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
          labelStyle={{ color: 'var(--text-tertiary)', fontSize: '10px' }}
          formatter={(value: number, name: string) => [fmtNum(value), name.charAt(0).toUpperCase() + name.slice(1)]}
        />
        <Area type="monotone" dataKey="sent" stroke="#6366F1" strokeWidth={1.5} fill="url(#sentGrad)" />
        <Area type="monotone" dataKey="opened" stroke="#818CF8" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ─── Dashboard Page ──────────────────────────────── */
export function DashboardPage() {
  const navigate = useNavigate();
  const unreadCount = useUnreadCount();

  /* ── Data Queries ── */
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => analyticsApi.overview(),
  });

  const { data: trendData } = useQuery({
    queryKey: ['analytics', 'trend', 14],
    queryFn: () => analyticsApi.trend(14),
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.list({ limit: 10 }),
  });

  const { data: inboxData } = useQuery({
    queryKey: ['inbox', 'dashboard'],
    queryFn: () => inboxApi.list({ limit: 6, folder: 'inbox' }),
  });

  const { data: emailTemplates } = useQuery({
    queryKey: ['templates', 'emails', 'dashboard'],
    queryFn: () => templateApi.listEmails(),
  });

  const isLoading = analyticsLoading || campaignsLoading;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const stats = analytics || {
    total_campaigns: 0, active_campaigns: 0, total_contacts: 0,
    total_sent: 0, total_opened: 0, total_clicked: 0, total_replied: 0,
    avg_open_rate: 0, avg_click_rate: 0, avg_reply_rate: 0,
    suppressed_count: 0, avg_dcs_score: 0, verified_contacts: 0, bounced_contacts: 0,
  };

  const allCampaigns = campaigns?.data || [];
  const activeCampaigns = allCampaigns.filter((c: any) => c.status === 'active');
  const recentCampaigns = allCampaigns.slice(0, 5);
  const recentMessages = Array.isArray(inboxData?.data) ? inboxData.data : [];
  const templates = Array.isArray(emailTemplates) ? emailTemplates : [];
  const trend = Array.isArray(trendData) ? trendData : [];
  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-[var(--text-tertiary)] mb-0.5">{getGreeting()}</p>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/analytics" className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors">
            <BarChart3 className="h-3.5 w-3.5" />
            Analytics
          </Link>
          <button onClick={() => navigate('/campaigns/new')} className="btn-primary">
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link to="/campaigns" className="group p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
              <Mail className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" strokeWidth={1.5} />
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="block text-2xl font-bold text-[var(--text-primary)] tracking-tight">{fmtNum(stats.total_sent)}</span>
          <span className="block text-xs text-[var(--text-tertiary)] mt-1">Emails Sent</span>
        </Link>

        <Link to="/analytics" className="group p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
              <Eye className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" strokeWidth={1.5} />
            </div>
            <span className={cn('text-xs font-semibold', stats.avg_open_rate > 0 ? 'text-emerald-600' : 'text-[var(--text-tertiary)]')}>
              {stats.avg_open_rate > 0 && <ArrowUpRight className="inline h-3 w-3 mr-0.5" />}
              {fmtPct(stats.avg_open_rate)}
            </span>
          </div>
          <span className="block text-2xl font-bold text-[var(--text-primary)] tracking-tight">{fmtNum(stats.total_opened)}</span>
          <span className="block text-xs text-[var(--text-tertiary)] mt-1">Opens</span>
        </Link>

        <Link to="/analytics" className="group p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
              <MousePointer className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" strokeWidth={1.5} />
            </div>
            <span className={cn('text-xs font-semibold', stats.avg_click_rate > 0 ? 'text-emerald-600' : 'text-[var(--text-tertiary)]')}>
              {stats.avg_click_rate > 0 && <ArrowUpRight className="inline h-3 w-3 mr-0.5" />}
              {fmtPct(stats.avg_click_rate)}
            </span>
          </div>
          <span className="block text-2xl font-bold text-[var(--text-primary)] tracking-tight">{fmtNum(stats.total_clicked)}</span>
          <span className="block text-xs text-[var(--text-tertiary)] mt-1">Clicks</span>
        </Link>

        <Link to="/inbox" className="group p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-lg bg-[var(--bg-elevated)]">
              <MessageSquare className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors" strokeWidth={1.5} />
            </div>
            <span className={cn('text-xs font-semibold', stats.avg_reply_rate > 0 ? 'text-emerald-600' : 'text-[var(--text-tertiary)]')}>
              {stats.avg_reply_rate > 0 && <ArrowUpRight className="inline h-3 w-3 mr-0.5" />}
              {fmtPct(stats.avg_reply_rate)}
            </span>
          </div>
          <span className="block text-2xl font-bold text-[var(--text-primary)] tracking-tight">{fmtNum(stats.total_replied)}</span>
          <span className="block text-xs text-[var(--text-tertiary)] mt-1">Replies</span>
        </Link>
      </div>

      {/* ── Sending Trend + Active Campaigns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Trend chart */}
        <div className="lg:col-span-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Sending Activity</h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Last 14 days</p>
            </div>
            <Link to="/analytics" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors">
              View details <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ErrorBoundary fallback={<div className="h-[120px] flex items-center justify-center text-xs text-[var(--text-tertiary)]">Chart unavailable</div>}>
            {trend.length > 0 ? (
              <MiniTrendChart data={trend} />
            ) : (
              <div className="h-[120px] flex items-center justify-center">
                <p className="text-xs text-[var(--text-tertiary)]">No sending data yet. Launch a campaign to see trends.</p>
              </div>
            )}
          </ErrorBoundary>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-[2px] rounded-full bg-[#6366F1]" />
              <span className="text-[10px] text-[var(--text-tertiary)]">Sent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-[2px] rounded-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #818CF8 0 4px, transparent 4px 6px)' }} />
              <span className="text-[10px] text-[var(--text-tertiary)]">Opened</span>
            </div>
          </div>
        </div>

        {/* Active campaigns */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Active Campaigns</h2>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{activeCampaigns.length} running</p>
            </div>
            <Link to="/campaigns" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors">
              All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {activeCampaigns.length > 0 ? (
              activeCampaigns.slice(0, 4).map((campaign: any) => (
                <button
                  key={campaign.id}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors text-left border-t border-[var(--border-subtle)] group"
                >
                  <div className="p-1.5 rounded-md bg-emerald-500/10">
                    <Play className="h-3 w-3 text-emerald-600" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{campaign.name}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      {fmtNum(campaign.total_sent || 0)} sent &middot; {fmtPct(campaign.open_rate)} opens
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 border-t border-[var(--border-subtle)]">
                <Megaphone className="h-5 w-5 text-[var(--text-tertiary)] mb-2" strokeWidth={1.5} />
                <p className="text-xs text-[var(--text-tertiary)] text-center mb-3">No active campaigns</p>
                <button onClick={() => navigate('/campaigns/new')} className="text-xs font-medium text-[var(--text-primary)] hover:underline">
                  Create one &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Campaigns Overview + Inbox ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* All campaigns */}
        <div className="lg:col-span-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Campaigns</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/campaigns/new')} className="flex items-center gap-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-md hover:bg-[var(--bg-hover)] transition-colors">
                <Plus className="h-3 w-3" />New
              </button>
              <Link to="/campaigns" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors">
                View all <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
          {recentCampaigns.length > 0 ? (
            <div>
              {recentCampaigns.map((campaign: any) => {
                const sc = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                const StatusIcon = sc.icon;
                return (
                  <button
                    key={campaign.id}
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg-hover)] transition-colors text-left border-b border-[var(--border-subtle)] last:border-b-0 group"
                  >
                    <div className={cn('p-1.5 rounded-md', sc.bg)}>
                      <StatusIcon className={cn('h-3.5 w-3.5', sc.text)} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{campaign.name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-[11px] text-[var(--text-tertiary)]">{fmtNum(campaign.total_sent || 0)} sent</span>
                        <span className="text-[11px] text-[var(--text-tertiary)]">{fmtPct(campaign.open_rate)} opens</span>
                        <span className="text-[11px] text-[var(--text-tertiary)]">{fmtPct(campaign.reply_rate)} replies</span>
                      </div>
                    </div>
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', sc.bg, sc.text)}>
                      {campaign.status}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Megaphone className="h-6 w-6 text-[var(--text-tertiary)] mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-[var(--text-primary)] mb-1">No campaigns yet</p>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">Create your first email campaign</p>
              <button onClick={() => navigate('/campaigns/new')} className="btn-primary text-xs px-4 py-2">
                <Plus className="h-3.5 w-3.5" />
                Create Campaign
              </button>
            </div>
          )}
        </div>

        {/* Inbox + AI */}
        <div className="flex flex-col gap-4">
          {/* Inbox preview */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Inbox</h2>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold bg-[#6366F1] text-white rounded-full px-1.5 py-px">{unreadCount}</span>
                )}
              </div>
              <Link to="/inbox" className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors">
                Open <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            {recentMessages.length > 0 ? (
              recentMessages.slice(0, 4).map((msg: any) => (
                <Link
                  key={msg.id}
                  to="/inbox"
                  className="flex items-start gap-2.5 py-2.5 px-4 hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-subtle)] last:border-b-0"
                >
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-[var(--text-primary)]">
                        {(msg.contact_name || msg.from_email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                    {!msg.is_read && (
                      <div className="absolute -top-0.5 -left-0.5 w-2 h-2 rounded-full bg-[#6366F1] border-[1.5px] border-[var(--bg-surface)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] truncate ${msg.is_read ? 'text-[var(--text-secondary)]' : 'font-semibold text-[var(--text-primary)]'}`}>
                        {msg.contact_name || msg.from_email?.split('@')[0] || 'Unknown'}
                      </span>
                      <span className="text-[9px] text-[var(--text-tertiary)] flex-shrink-0">{timeAgo(msg.received_at)}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5">
                      {msg.subject || '(no subject)'}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-8 text-center">
                <Inbox className="h-4 w-4 text-[var(--text-tertiary)] mx-auto mb-1.5" strokeWidth={1.5} />
                <p className="text-[11px] text-[var(--text-tertiary)]">No messages</p>
              </div>
            )}
          </div>

          {/* AI Features */}
          <Link to="/inbox" className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[rgba(99,102,241,0.3)] transition-all">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-[rgba(99,102,241,0.1)]">
                <Sparkles className="h-4 w-4 text-[#6366F1]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">AI Assist</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Smart tagging & reply assist</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-[var(--text-tertiary)] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-elevated)]">
                <Tag className="h-3.5 w-3.5 text-[#818CF8]" />
                <p className="text-xs text-[var(--text-secondary)]">Auto-tags emails by intent</p>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-elevated)]">
                <Sparkles className="h-3.5 w-3.5 text-[#818CF8]" />
                <p className="text-xs text-[var(--text-secondary)]">AI reply assist in composer</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Quick Navigation Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { to: '/campaigns/new', icon: Megaphone, label: 'New Campaign', desc: 'Create sequence' },
          { to: '/contacts', icon: Users, label: 'Contacts', desc: fmtNum(stats.total_contacts) + ' total' },
          { to: '/templates', icon: FileText, label: 'Templates', desc: `${templates.length} saved` },
          { to: '/verification', icon: ShieldCheck, label: 'Verification', desc: 'DCS scoring' },
          { to: '/suppression', icon: ShieldOff, label: 'Suppression', desc: 'Block list' },
          { to: '/team', icon: UserPlus, label: 'Team', desc: 'Members & invites' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className="group p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl hover:border-[var(--border-default)] transition-all"
          >
            <item.icon className="h-4 w-4 text-[var(--text-tertiary)] mb-2 group-hover:text-[var(--text-primary)] transition-colors" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
