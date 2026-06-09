import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { campaignsApi } from '../../api/campaigns.api';
import { campaignFoldersApi, type CampaignFolder } from '../../api/campaign-folders.api';
import { analyticsApi } from '../../api/analytics.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { StatCard } from '../../components/shared/StatCard';
import { PageHeader } from '../../components/shared/PageHeader';
import { formatDate, cn } from '../../lib/utils';
import {
  Megaphone, Plus, Send, Mail, MousePointerClick, MessageSquare, Copy,
  Folder, FolderPlus, FolderOpen, X, Pencil, Trash2,
  BarChart3, Layers, Play, Pause, Eye, Search, AlertTriangle,
  Trophy, Grid3x3, List, Sparkles, ArrowUpRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { CampaignWithStats } from '@lemlist/shared';

const STATUS_TABS = [
  { label: 'All',       value: '' },
  { label: 'Draft',     value: 'draft' },
  { label: 'Running',   value: 'running' },
  { label: 'Paused',    value: 'paused' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const FOLDER_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#8B5CF6', '#EF4444', '#84CC16'];

type ViewMode = 'cards' | 'table';

function safeRate(num: number, denom: number): number {
  if (denom <= 0) return 0;
  return (num / denom) * 100;
}

function rateColor(value: number, kind: 'open' | 'click' | 'reply' | 'bounce'): string {
  if (kind === 'bounce') {
    if (value >= 5) return 'text-rose-500';
    if (value >= 2) return 'text-amber-500';
    return 'text-[var(--text-tertiary)]';
  }
  const thresholds = { open: [40, 20], click: [10, 5], reply: [5, 2] }[kind];
  if (value >= thresholds[0]) return 'text-emerald-500';
  if (value >= thresholds[1]) return 'text-amber-500';
  return 'text-[var(--text-tertiary)]';
}

export function CampaignsListPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolderId, setActiveFolderId] = useState<string | null | 'all'>('all');
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<CampaignFolder | null>(null);
  const [folderAnalyticsId, setFolderAnalyticsId] = useState<string | null>(null);
  const [contextMenuFor, setContextMenuFor] = useState<{ id: string; x: number; y: number } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data: campaignsResp, isLoading } = useQuery({
    queryKey: ['campaigns', 'all', statusFilter],
    queryFn: () => campaignsApi.list({ page: 1, limit: 500, status: statusFilter || undefined }),
    refetchInterval: (query) => {
      const campaigns = (query.state.data as any)?.data ?? [];
      const hasRunning = campaigns.some((c: any) => c.status === 'running');
      return hasRunning ? 30_000 : false;
    },
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['campaign-folders'],
    queryFn: campaignFoldersApi.list,
  });

  // 14-day trend for hero KPI sparklines
  const { data: trendData } = useQuery({
    queryKey: ['analytics', 'trend', 14],
    queryFn: () => analyticsApi.trend(14),
  });

  // Portfolio overview for change chips
  const { data: overview } = useQuery({
    queryKey: ['analytics', 'overview', 30],
    queryFn: () => analyticsApi.overview(30),
  });

  const launchMut  = useMutation({ mutationFn: campaignsApi.launch, onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Launched'); }, onError: (e: any) => toast.error(e.response?.data?.error || 'Failed') });
  const pauseMut   = useMutation({ mutationFn: campaignsApi.pause,  onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Paused'); }, onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to pause') });
  const resumeMut  = useMutation({ mutationFn: campaignsApi.resume, onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Resumed'); }, onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to resume') });
  const deleteMut  = useMutation({ mutationFn: campaignsApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Deleted'); }, onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to delete') });
  const cloneMut   = useMutation({ mutationFn: campaignsApi.clone,  onSuccess: (c) => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Cloned'); navigate(`/campaigns/${c.id}`); } });

  const moveMut = useMutation({
    mutationFn: ({ campaignId, folderId }: { campaignId: string; folderId: string | null }) => campaignFoldersApi.moveCampaign(campaignId, folderId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); qc.invalidateQueries({ queryKey: ['campaign-folders'] }); toast.success('Moved'); setContextMenuFor(null); },
    onError: () => toast.error('Failed to move'),
  });

  const allCampaigns: CampaignWithStats[] = (campaignsResp?.data || []) as any;

  const visibleCampaigns = useMemo(() => {
    let result = allCampaigns;
    if (activeFolderId !== 'all') {
      result = activeFolderId === null
        ? result.filter((c: any) => !c.folder_id)
        : result.filter((c: any) => c.folder_id === activeFolderId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c: any) => c.name?.toLowerCase().includes(q));
    }
    return result;
  }, [allCampaigns, activeFolderId, searchQuery]);

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  const aggregateStats = useMemo(() => {
    const totals = { sent: 0, opened: 0, clicked: 0, replied: 0, bounced: 0, contacts: 0 };
    for (const c of visibleCampaigns as any[]) {
      totals.sent     += c.sent_count    || 0;
      totals.opened   += c.opened_count  || 0;
      totals.clicked  += c.clicked_count || 0;
      totals.replied  += c.replied_count || 0;
      totals.bounced  += c.bounced_count || 0;
      totals.contacts += c.contacts_count || c.total_contacts || 0;
    }
    return totals;
  }, [visibleCampaigns]);

  // Top performer — highest reply rate amongst campaigns with ≥20 sends
  const topPerformer = useMemo(() => {
    const eligible = (visibleCampaigns as any[]).filter((c) => (c.sent_count || 0) >= 20);
    if (eligible.length === 0) return null;
    return [...eligible].sort((a, b) => safeRate(b.replied_count, b.sent_count) - safeRate(a.replied_count, a.sent_count))[0];
  }, [visibleCampaigns]);

  const runningCount = useMemo(
    () => (visibleCampaigns as any[]).filter((c) => c.status === 'running').length,
    [visibleCampaigns]
  );

  const uncategorisedCount = allCampaigns.filter((c: any) => !c.folder_id).length;

  // Sparklines from trend data (last 14 days)
  const sentSpark = useMemo(
    () => (trendData || []).slice(-14).map((d) => d.sent || 0),
    [trendData]
  );
  const openedSpark = useMemo(
    () => (trendData || []).slice(-14).map((d) => d.opened || 0),
    [trendData]
  );
  const clickedSpark = useMemo(
    () => (trendData || []).slice(-14).map((d) => d.clicked || 0),
    [trendData]
  );
  const repliedSpark = useMemo(
    () => (trendData || []).slice(-14).map((d) => d.replied || 0),
    [trendData]
  );

  const openPctAgg  = safeRate(aggregateStats.opened,  aggregateStats.sent);
  const clickPctAgg = safeRate(aggregateStats.clicked, aggregateStats.sent);
  const replyPctAgg = safeRate(aggregateStats.replied, aggregateStats.sent);

  const filteredByStatus = statusFilter
    ? (visibleCampaigns as any[]).filter((c) => c.status === statusFilter)
    : (visibleCampaigns as any[]);

  return (
    <div onClick={() => setContextMenuFor(null)}>
      {/* Page header */}
      <PageHeader
        decorate
        leading={
          activeFolder ? (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)]"
              style={{ background: `${activeFolder.color}14` }}
            >
              <FolderOpen className="h-4 w-4" style={{ color: activeFolder.color }} />
            </span>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--indigo-subtle)] border border-[rgba(91,91,245,0.18)]">
              <Megaphone className="h-4 w-4 text-[var(--indigo)]" />
            </span>
          )
        }
        title={
          activeFolderId === 'all' ? 'Campaigns'
            : activeFolderId === null ? 'Uncategorised'
            : activeFolder?.name || 'Campaigns'
        }
        description={
          activeFolderId === 'all'
            ? 'Outbound sequences, live performance, deliverability — all in one place.'
            : activeFolderId === null
              ? 'Campaigns not yet assigned to a folder.'
              : `${visibleCampaigns.length} campaign${visibleCampaigns.length === 1 ? '' : 's'} in this folder.`
        }
        meta={
          <>
            {runningCount > 0 && (
              <>
                <span className="inline-flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
                    <span className="relative rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="tabular text-emerald-600 font-semibold">{runningCount} live</span>
                </span>
                <span className="sep-dot" />
              </>
            )}
            <span className="tabular">{aggregateStats.sent.toLocaleString()} sent</span>
            <span className="sep-dot" />
            <span className="tabular">{aggregateStats.replied.toLocaleString()} replies</span>
            <span className="sep-dot" />
            <span className="tabular">{replyPctAgg.toFixed(1)}% reply rate</span>
          </>
        }
        actions={
          <>
            {activeFolderId && activeFolderId !== 'all' && activeFolderId !== null && (
              <Button variant="secondary" size="sm" onClick={() => setFolderAnalyticsId(activeFolderId)}>
                <BarChart3 className="h-3.5 w-3.5" /> Folder analytics
              </Button>
            )}
            <Button size="sm" onClick={() => navigate('/campaigns/new')}>
              <Plus className="h-3.5 w-3.5" /> New campaign
            </Button>
          </>
        }
      />

      {/* Hero KPI row — StatCards with sparklines + change chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={Send}
          accent="indigo"
          label="Emails sent"
          value={aggregateStats.sent.toLocaleString()}
          hint={overview ? `${overview.total_sent.toLocaleString()} workspace total` : undefined}
          delta={overview?.sent_change ?? undefined}
          sparkline={sentSpark.length >= 2 ? sentSpark : undefined}
        />
        <StatCard
          icon={Mail}
          accent="emerald"
          label="Open rate"
          value={`${openPctAgg.toFixed(1)}%`}
          hint={`${aggregateStats.opened.toLocaleString()} opens`}
          delta={overview?.opened_change ?? undefined}
          sparkline={openedSpark.length >= 2 ? openedSpark : undefined}
        />
        <StatCard
          icon={MousePointerClick}
          accent="amber"
          label="Click rate"
          value={`${clickPctAgg.toFixed(1)}%`}
          hint={`${aggregateStats.clicked.toLocaleString()} clicks`}
          delta={overview?.clicked_change ?? undefined}
          sparkline={clickedSpark.length >= 2 ? clickedSpark : undefined}
        />
        <StatCard
          icon={MessageSquare}
          accent="rose"
          label="Reply rate"
          value={`${replyPctAgg.toFixed(1)}%`}
          hint={`${aggregateStats.replied.toLocaleString()} replies`}
          delta={overview?.replied_change ?? undefined}
          sparkline={repliedSpark.length >= 2 ? repliedSpark : undefined}
        />
      </div>

      {/* Top performer callout */}
      {topPerformer && (
        <button
          onClick={() => navigate(`/campaigns/${topPerformer.id}`)}
          className="group w-full mb-4 px-4 py-3 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-emerald-500/8 to-transparent flex items-center gap-4 text-left transition-all hover:border-emerald-500/30 hover:from-emerald-500/8 hover:to-emerald-500/4"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 flex-shrink-0">
            <Trophy className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Top performer</span>
              <StatusBadge status={topPerformer.status} type="campaign" />
            </div>
            <p className="text-[13.5px] font-semibold text-[var(--text-primary)] truncate">{topPerformer.name}</p>
          </div>
          <div className="flex items-center gap-5 flex-shrink-0">
            <Metric label="Sent" value={topPerformer.sent_count?.toLocaleString() || '0'} />
            <Metric
              label="Replies"
              value={`${safeRate(topPerformer.replied_count, topPerformer.sent_count).toFixed(1)}%`}
              accent="emerald"
            />
            <Metric
              label="Opens"
              value={`${safeRate(topPerformer.opened_count, topPerformer.sent_count).toFixed(1)}%`}
            />
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </button>
      )}

      {/* Two-column body: folder rail + content */}
      <div className="grid grid-cols-[200px,1fr] gap-3">
        {/* Folder rail */}
        <aside className="panel-inset p-1.5 self-start sticky top-[60px] max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="px-2 pt-1 pb-1.5 flex items-center justify-between">
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">Folders</span>
            <button
              onClick={() => { setEditingFolder(null); setFolderModalOpen(true); }}
              title="New folder"
              className="icon-btn h-6 w-6"
            >
              <FolderPlus className="h-3 w-3" />
            </button>
          </div>

          <FolderRow
            label="All"
            icon={Layers}
            count={allCampaigns.length}
            active={activeFolderId === 'all'}
            onClick={() => setActiveFolderId('all')}
            color="#5B5BF5"
          />
          <FolderRow
            label="Uncategorised"
            icon={Folder}
            count={uncategorisedCount}
            active={activeFolderId === null}
            onClick={() => setActiveFolderId(null)}
            color="#94A3B8"
          />
          {folders.length > 0 && (
            <div className="my-1 mx-2 h-px bg-[var(--border-subtle)]" />
          )}
          {folders.map((f) => (
            <FolderRow
              key={f.id}
              label={f.name}
              icon={activeFolderId === f.id ? FolderOpen : Folder}
              count={f.campaign_count}
              active={activeFolderId === f.id}
              onClick={() => setActiveFolderId(f.id)}
              onEdit={() => { setEditingFolder(f); setFolderModalOpen(true); }}
              onAnalytics={() => setFolderAnalyticsId(f.id)}
              color={f.color}
            />
          ))}
        </aside>

        {/* Main column */}
        <main className="min-w-0">
          {/* Status tabs + view toggle + search */}
          <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1 overflow-x-auto">
              {STATUS_TABS.map((t) => {
                const count = t.value === ''
                  ? visibleCampaigns.length
                  : (visibleCampaigns as any[]).filter((c) => c.status === t.value).length;
                const active = statusFilter === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setStatusFilter(t.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 h-7 rounded-md text-[12px] font-medium transition-all whitespace-nowrap',
                      active
                        ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-subtle),0_1px_2px_rgba(15,15,25,0.04)]'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    {t.label}
                    <span className={cn(
                      'inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded text-[10px] font-bold tabular',
                      active ? 'bg-[var(--indigo-subtle)] text-[var(--indigo)]' : 'bg-[var(--bg-elevated)] text-[var(--text-tertiary)]'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="inline-flex items-center rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5">
                <button
                  onClick={() => setViewMode('cards')}
                  title="Card view"
                  className={cn(
                    'p-1 rounded transition-all',
                    viewMode === 'cards'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <Grid3x3 className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  title="Table view"
                  className={cn(
                    'p-1 rounded transition-all',
                    viewMode === 'table'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <List className="h-3 w-3" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns…"
                  className="h-7 pl-8 pr-7 text-[12.5px] rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none focus:border-[rgba(91,91,245,0.4)] focus:bg-[var(--bg-surface)] transition-colors w-44"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* List / Cards / Table */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
          ) : filteredByStatus.length === 0 ? (
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-10">
              <EmptyState
                icon={Megaphone}
                title={
                  searchQuery
                    ? 'No campaigns match your search'
                    : activeFolderId === 'all'
                    ? 'No campaigns yet'
                    : 'This folder is empty'
                }
                description={
                  searchQuery
                    ? `Try a different keyword or clear the search.`
                    : activeFolderId === 'all'
                    ? 'Build your first outbound sequence and start reaching prospects.'
                    : 'Move campaigns into this folder or create a new one here.'
                }
                actionLabel="New campaign"
                onAction={() => navigate('/campaigns/new')}
              />
            </div>
          ) : viewMode === 'cards' ? (
            <div className="space-y-2">
              {filteredByStatus.map((campaign: any) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onOpen={() => navigate(`/campaigns/${campaign.id}`)}
                  onLaunch={() => launchMut.mutate(campaign.id)}
                  onPause={()  => pauseMut.mutate(campaign.id)}
                  onResume={() => resumeMut.mutate(campaign.id)}
                  onClone={()  => cloneMut.mutate(campaign.id)}
                  onEdit={()   => navigate(`/campaigns/${campaign.id}/edit`)}
                  onDelete={() => { if (confirm('Delete this campaign?')) deleteMut.mutate(campaign.id); }}
                  onContextMenu={(e: React.MouseEvent) => { e.preventDefault(); setContextMenuFor({ id: campaign.id, x: e.clientX, y: e.clientY }); }}
                />
              ))}
            </div>
          ) : (
            <CampaignTable
              campaigns={filteredByStatus}
              onOpen={(id) => navigate(`/campaigns/${id}`)}
              onLaunch={(id) => launchMut.mutate(id)}
              onPause={(id) => pauseMut.mutate(id)}
              onResume={(id) => resumeMut.mutate(id)}
            />
          )}
        </main>
      </div>

      {/* Context menu */}
      {contextMenuFor && (
        <div
          className="fixed z-50 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-xl py-1 min-w-[200px] animate-fade-in"
          style={{ top: contextMenuFor.y, left: contextMenuFor.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
            Move to folder
          </div>
          <button
            onClick={() => moveMut.mutate({ campaignId: contextMenuFor.id, folderId: null })}
            className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] flex items-center gap-2"
          >
            <Folder className="h-3.5 w-3.5" /> Uncategorised
          </button>
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => moveMut.mutate({ campaignId: contextMenuFor.id, folderId: f.id })}
              className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] flex items-center gap-2"
            >
              <Folder className="h-3.5 w-3.5" style={{ color: f.color }} /> {f.name}
            </button>
          ))}
          <div className="border-t border-[var(--border-subtle)] my-1" />
          <button
            onClick={() => { cloneMut.mutate(contextMenuFor.id); setContextMenuFor(null); }}
            className="w-full text-left px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] flex items-center gap-2"
          >
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </button>
          <button
            onClick={() => { if (confirm('Delete this campaign?')) { deleteMut.mutate(contextMenuFor.id); setContextMenuFor(null); } }}
            className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}

      {/* Folder modal */}
      {folderModalOpen && (
        <FolderModal
          initial={editingFolder}
          onClose={() => { setFolderModalOpen(false); setEditingFolder(null); }}
        />
      )}

      {/* Folder analytics modal */}
      {folderAnalyticsId && (
        <FolderAnalyticsModal folderId={folderAnalyticsId} onClose={() => setFolderAnalyticsId(null)} />
      )}
    </div>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function Metric({ label, value, accent }: { label: string; value: string; accent?: 'emerald' }) {
  return (
    <div className="flex flex-col items-end">
      <span className={cn(
        'text-[13px] font-bold tabular leading-none',
        accent === 'emerald' ? 'text-emerald-600' : 'text-[var(--text-primary)]'
      )}>{value}</span>
      <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-medium mt-0.5">{label}</span>
    </div>
  );
}

function FolderRow({ label, icon: Icon, count, active, onClick, onEdit, onAnalytics, color }: {
  label: string;
  icon: any;
  count: number;
  active: boolean;
  onClick: () => void;
  onEdit?: () => void;
  onAnalytics?: () => void;
  color: string;
}) {
  return (
    <div className="group relative">
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-2 px-2 h-7 rounded-[6px] text-[12.5px] text-left transition-colors',
          active
            ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[0_0_0_1px_var(--border-subtle),0_1px_2px_rgba(15,15,25,0.04)] font-medium'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]/60 hover:text-[var(--text-primary)]'
        )}
      >
        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <Icon className="h-3 w-3 flex-shrink-0 text-[var(--text-tertiary)]" strokeWidth={1.75} />
        <span className="flex-1 truncate">{label}</span>
        <span className="text-[10.5px] text-[var(--text-tertiary)] tabular">{count}</span>
      </button>
      {(onEdit || onAnalytics) && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-px bg-[var(--bg-surface)] rounded shadow-[0_0_0_1px_var(--border-subtle)] px-0.5">
          {onAnalytics && (
            <button onClick={(e) => { e.stopPropagation(); onAnalytics(); }} title="Folder analytics" className="p-0.5 rounded hover:bg-[var(--bg-hover)]">
              <BarChart3 className="h-3 w-3 text-[var(--text-tertiary)] hover:text-[var(--indigo)]" />
            </button>
          )}
          {onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit folder" className="p-0.5 rounded hover:bg-[var(--bg-hover)]">
              <Pencil className="h-3 w-3 text-[var(--text-tertiary)] hover:text-[var(--indigo)]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_DOT: Record<string, string> = {
  draft: 'bg-slate-400',
  running: 'bg-emerald-500 animate-pulse',
  paused: 'bg-amber-500',
  completed: 'bg-indigo-500',
  cancelled: 'bg-rose-500',
  scheduled: 'bg-blue-500',
};

function CampaignCard({ campaign, onOpen, onLaunch, onPause, onResume, onClone, onEdit, onDelete, onContextMenu }: any) {
  const total = campaign.sent_count || 0;
  const openPct  = safeRate(campaign.opened_count, total);
  const clickPct = safeRate(campaign.clicked_count, total);
  const replyPct = safeRate(campaign.replied_count, total);
  const bouncePct = safeRate(campaign.bounced_count, total);

  const totalContacts = campaign.contacts_count || campaign.total_contacts || 0;
  const pipelinePct = totalContacts ? Math.min((total / totalContacts) * 100, 100) : 0;

  return (
    <div
      onClick={onOpen}
      onContextMenu={onContextMenu}
      className="group relative overflow-hidden cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-default)] hover:shadow-[0_2px_8px_rgba(15,15,25,0.06)] transition-all"
    >
      {/* Status accent strip */}
      <span className={cn('absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full', STATUS_DOT[campaign.status] || 'bg-slate-400')} />

      <div className="p-4 pl-5">
        <div className="grid grid-cols-[1fr,auto] gap-4 items-start mb-3">
          {/* Identity */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[14px] font-semibold text-[var(--text-primary)] truncate tracking-[-0.005em]">{campaign.name}</h3>
              <StatusBadge status={campaign.status} type="campaign" />
            </div>
            <p className="text-[11.5px] text-[var(--text-tertiary)] truncate">
              {campaign.steps_count || 0} step{campaign.steps_count !== 1 ? 's' : ''}
              <span className="mx-1.5 text-[var(--text-muted)]">·</span>
              {totalContacts.toLocaleString()} contact{totalContacts !== 1 ? 's' : ''}
              <span className="mx-1.5 text-[var(--text-muted)]">·</span>
              Created {formatDate(campaign.created_at)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {campaign.status === 'draft' && (
              <Button size="sm" onClick={onLaunch}>
                <Play className="h-3 w-3" /> Launch
              </Button>
            )}
            {campaign.status === 'running' && (
              <Button size="sm" variant="secondary" onClick={onPause}>
                <Pause className="h-3 w-3" /> Pause
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button size="sm" onClick={onResume}>
                <Play className="h-3 w-3" /> Resume
              </Button>
            )}
            <button onClick={onEdit} title="Edit" className="icon-btn">
              <Pencil className="h-3 w-3" />
            </button>
            <button onClick={onClone} title="Duplicate" className="icon-btn">
              <Copy className="h-3 w-3" />
            </button>
            {(campaign.status === 'draft' || campaign.status === 'completed' || campaign.status === 'cancelled') && (
              <button onClick={onDelete} title="Delete" className="icon-btn hover:!text-[var(--error)] hover:!bg-[var(--error-bg)]">
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Body: metrics or pipeline */}
        {total > 0 ? (
          <>
            <div className="grid grid-cols-4 gap-x-4 gap-y-2 pt-3 border-t border-[var(--border-subtle)]">
              <RateCell label="Sent"   value={campaign.sent_count.toLocaleString()} pct={100} color="#5B5BF5" hideBar />
              <RateCell label="Opens"  value={campaign.opened_count.toLocaleString()} pct={openPct}  color="#10B981" tone={rateColor(openPct, 'open')} />
              <RateCell label="Clicks" value={campaign.clicked_count.toLocaleString()} pct={clickPct} color="#F59E0B" tone={rateColor(clickPct, 'click')} />
              <RateCell label="Replies" value={campaign.replied_count.toLocaleString()} pct={replyPct} color="#EC4899" tone={rateColor(replyPct, 'reply')} />
            </div>
            {(bouncePct >= 2 || campaign.bounced_count > 0) && (
              <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/8 border border-rose-500/15 w-fit">
                <AlertTriangle className="h-3 w-3 text-rose-500 flex-shrink-0" />
                <span className="text-[11px] font-medium text-rose-600">
                  {campaign.bounced_count} bounce{campaign.bounced_count !== 1 ? 's' : ''} ({bouncePct.toFixed(1)}%) — check deliverability
                </span>
              </div>
            )}
          </>
        ) : totalContacts > 0 ? (
          <div className="pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-[11px] text-[var(--text-tertiary)] mb-1.5">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Pipeline progress
              </span>
              <span className="tabular">{total.toLocaleString()} / {totalContacts.toLocaleString()}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-[var(--bg-elevated)]">
              <div
                className="h-full bg-gradient-to-r from-[#5B5BF5] to-[#8B5CF6] transition-all duration-500"
                style={{ width: `${pipelinePct}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center gap-2 text-[11.5px] text-[var(--text-tertiary)]">
            <Sparkles className="h-3 w-3" />
            <span>Add contacts and launch to start tracking performance</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RateCell({ label, value, pct, color, tone, hideBar }: {
  label: string; value: string; pct: number; color: string; tone?: string; hideBar?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]">{label}</span>
        {!hideBar && (
          <span className={cn('text-[10.5px] tabular font-semibold', tone || 'text-[var(--text-tertiary)]')}>
            {pct.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="text-[14px] font-semibold text-[var(--text-primary)] tabular leading-tight">{value}</div>
      {!hideBar && (
        <div className="mt-1.5 h-[3px] rounded-full overflow-hidden bg-[var(--bg-elevated)]">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, background: color }}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Compact table view ──────────────────────────────────────── */

function CampaignTable({ campaigns, onOpen, onLaunch, onPause, onResume }: {
  campaigns: any[];
  onOpen: (id: string) => void;
  onLaunch: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  const maxSent = Math.max(1, ...campaigns.map((c) => c.sent_count || 0));

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <th className="text-left py-2.5 px-4 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Campaign</th>
              <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Status</th>
              <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Sent</th>
              <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Open</th>
              <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Click</th>
              <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Reply</th>
              <th className="text-right py-2.5 px-3 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Bounce</th>
              <th className="text-left py-2.5 px-3 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold w-28">Volume</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const total = c.sent_count || 0;
              const openPct = safeRate(c.opened_count, total);
              const clickPct = safeRate(c.clicked_count, total);
              const replyPct = safeRate(c.replied_count, total);
              const bouncePct = safeRate(c.bounced_count, total);
              return (
                <tr
                  key={c.id}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group last:border-0"
                  onClick={() => onOpen(c.id)}
                >
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', STATUS_DOT[c.status] || 'bg-slate-400')} />
                      <span className="font-medium text-[12.5px] text-[var(--text-primary)] truncate max-w-[260px]">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={c.status} type="campaign" />
                  </td>
                  <td className="py-2.5 px-3 text-right tabular text-[12px] font-medium text-[var(--text-secondary)]">{total.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn('text-[12px] font-semibold tabular', rateColor(openPct, 'open'))}>
                      {total > 0 ? `${openPct.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn('text-[12px] font-medium tabular', rateColor(clickPct, 'click'))}>
                      {total > 0 ? `${clickPct.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn('text-[12px] font-semibold tabular', rateColor(replyPct, 'reply'))}>
                      {total > 0 ? `${replyPct.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className={cn('text-[12px] tabular', rateColor(bouncePct, 'bounce'))}>
                      {total > 0 ? `${bouncePct.toFixed(1)}%` : '—'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="h-1.5 rounded-full overflow-hidden bg-[var(--bg-elevated)]">
                      <div
                        className="h-full rounded-full bg-[var(--indigo)] transition-all"
                        style={{ width: `${(total / maxSent) * 100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-2.5 px-3 w-12" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.status === 'draft' && (
                        <button onClick={() => onLaunch(c.id)} className="icon-btn" title="Launch">
                          <Play className="h-3 w-3" />
                        </button>
                      )}
                      {c.status === 'running' && (
                        <button onClick={() => onPause(c.id)} className="icon-btn" title="Pause">
                          <Pause className="h-3 w-3" />
                        </button>
                      )}
                      {c.status === 'paused' && (
                        <button onClick={() => onResume(c.id)} className="icon-btn" title="Resume">
                          <Play className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Folder modal ────────────────────────────────────────────── */

function FolderModal({ initial, onClose }: { initial: CampaignFolder | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState(initial?.name || '');
  const [color, setColor] = useState(initial?.color || FOLDER_COLORS[0]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (initial) return campaignFoldersApi.update(initial.id, { name: name.trim(), color });
      return campaignFoldersApi.create({ name: name.trim(), color });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaign-folders'] }); toast.success(initial ? 'Folder updated' : 'Folder created'); onClose(); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to save'),
  });

  const deleteMut = useMutation({
    mutationFn: () => campaignFoldersApi.delete(initial!.id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaign-folders'] }); qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Folder deleted'); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{initial ? 'Edit folder' : 'New folder'}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-hover)]"><X className="h-4 w-4 text-[var(--text-tertiary)]" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp campaigns" className="input-field" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Colour</label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ background: c }}
                  className={cn('w-7 h-7 rounded-full transition-all', color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-surface)]' : 'opacity-70 hover:opacity-100')}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          {initial ? (
            <button
              onClick={() => { if (confirm(`Delete folder "${initial.name}"? Campaigns inside will not be deleted.`)) deleteMut.mutate(); }}
              className="text-xs text-red-500 hover:underline"
            >
              Delete folder
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary">Cancel</button>
            <button onClick={() => saveMut.mutate()} disabled={!name.trim() || saveMut.isPending} className="btn-primary">
              {saveMut.isPending ? 'Saving...' : (initial ? 'Save' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Folder analytics modal ──────────────────────────────────── */

function FolderAnalyticsModal({ folderId, onClose }: { folderId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['campaign-folder-analytics', folderId],
    queryFn: () => campaignFoldersApi.analytics(folderId),
  });

  const totals = data?.totals;
  const openRate  = totals ? safeRate(totals.opened, totals.sent) : 0;
  const clickRate = totals ? safeRate(totals.clicked, totals.sent) : 0;
  const replyRate = totals ? safeRate(totals.replied, totals.sent) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[var(--indigo)]" />
            {data?.folder.name || 'Folder analytics'}
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-hover)]"><X className="h-4 w-4 text-[var(--text-tertiary)]" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <Spinner size="md" />
          ) : !data || data.campaigns.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <Megaphone className="h-10 w-10 mx-auto text-[var(--text-tertiary)] mb-2" />
              <p className="text-sm">No campaigns in this folder yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3 mb-5">
                <StatCard icon={Send} accent="indigo" label="Sent" value={(totals?.sent || 0).toLocaleString()} />
                <StatCard icon={Mail} accent="emerald" label="Open rate" value={`${openRate.toFixed(1)}%`} hint={`${(totals?.opened || 0).toLocaleString()} opens`} />
                <StatCard icon={MousePointerClick} accent="amber" label="Click rate" value={`${clickRate.toFixed(1)}%`} hint={`${(totals?.clicked || 0).toLocaleString()} clicks`} />
                <StatCard icon={MessageSquare} accent="rose" label="Reply rate" value={`${replyRate.toFixed(1)}%`} hint={`${(totals?.replied || 0).toLocaleString()} replies`} />
              </div>

              <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-2 font-semibold">By campaign</div>
              <table className="w-full text-sm">
                <thead className="text-[10px] uppercase text-[var(--text-tertiary)] border-b border-[var(--border-subtle)]">
                  <tr>
                    <th className="text-left py-2 font-semibold">Campaign</th>
                    <th className="text-right py-2 font-semibold">Sent</th>
                    <th className="text-right py-2 font-semibold">Open %</th>
                    <th className="text-right py-2 font-semibold">Click %</th>
                    <th className="text-right py-2 font-semibold">Reply %</th>
                  </tr>
                </thead>
                <tbody>
                  {data.campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]">
                      <td className="py-2.5 text-[var(--text-primary)] font-medium">{c.name}</td>
                      <td className="py-2.5 text-right text-[var(--text-secondary)] tabular-nums">{c.sent.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-[var(--text-secondary)] tabular-nums">{c.open_rate}%</td>
                      <td className="py-2.5 text-right text-[var(--text-secondary)] tabular-nums">{c.click_rate}%</td>
                      <td className="py-2.5 text-right text-[var(--text-secondary)] tabular-nums">{c.reply_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
