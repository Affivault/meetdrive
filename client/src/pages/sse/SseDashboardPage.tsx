import { useQuery } from '@tanstack/react-query';
import { sseApi } from '../../api/sse.api';
import {
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Mail,
  Flame,
  BarChart3,
  RefreshCw,
  Server,
} from 'lucide-react';
import { cn } from '../../lib/utils';

function getHealthColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
}

function getHealthBg(_score: number): string {
  return 'bg-[var(--bg-elevated)] border-[var(--border-subtle)]';
}

function getUtilizationColor(pct: number): string {
  if (pct < 50) return 'bg-emerald-500';
  if (pct < 80) return 'bg-amber-500';
  return 'bg-red-500';
}

export function SseDashboardPage() {
  const { data: accounts, isLoading, refetch } = useQuery({
    queryKey: ['sse-dashboard'],
    queryFn: sseApi.dashboard,
  });

  const totalAccounts = accounts?.length || 0;
  const availableAccounts = accounts?.filter(a => a.is_available).length || 0;
  const avgHealth = totalAccounts > 0
    ? Math.round(accounts!.reduce((sum, a) => sum + a.health_score, 0) / totalAccounts)
    : 0;
  const warmupCount = accounts?.filter(a => a.warmup_mode).length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
            <Shield className="h-5 w-5 text-[var(--text-primary)]" />
          </div>
          <div>
            <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Smart-Sharding Engine</h1>
            <p className="text-sm text-[var(--text-secondary)]">Sender reputation health and rotation management</p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-primary flex items-center gap-2 rounded-lg px-4 py-2 text-sm bg-[var(--accent)] text-[var(--bg-app)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-1">
            <Server className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total Senders</span>
          </div>
          <p className="text-[18px] font-semibold text-[var(--text-primary)]">{totalAccounts}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Available</span>
          </div>
          <p className="text-[18px] font-semibold text-[var(--text-primary)]">
            {availableAccounts}
            <span className="text-sm font-normal text-[var(--text-secondary)] ml-1">/ {totalAccounts}</span>
          </p>
        </div>
        <div className={cn('rounded-xl border p-4', getHealthBg(avgHealth))}>
          <div className={cn('flex items-center gap-2 mb-1', getHealthColor(avgHealth))}>
            <Activity className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg Health</span>
          </div>
          <p className="text-[18px] font-semibold text-[var(--text-primary)]">{avgHealth}</p>
        </div>
        <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Flame className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Warming Up</span>
          </div>
          <p className="text-[18px] font-semibold text-[var(--text-primary)]">{warmupCount}</p>
        </div>
      </div>

      {/* Account Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--text-primary)] border-t-transparent" />
        </div>
      ) : !accounts || accounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--bg-elevated)] mb-4">
            <Mail className="h-8 w-8 text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">No SMTP accounts</h3>
          <p className="text-sm text-[var(--text-secondary)]">Add SMTP accounts to start using smart sender rotation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={cn(
                'rounded-xl bg-[var(--bg-surface)] border overflow-hidden transition-colors',
                account.is_available
                  ? 'border-[var(--border-subtle)] hover:border-[var(--border-default)]'
                  : 'border-red-500/20'
              )}
            >
              {/* Account Header */}
              <div className="flex items-center gap-3 p-4 border-b border-[var(--border-subtle)]">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)]',
                )}>
                  <Mail className={cn('h-5 w-5', account.is_available ? 'text-emerald-400' : 'text-red-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{account.label}</h3>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{account.email_address}</p>
                </div>
                {account.warmup_mode && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs text-amber-400">
                    <Flame className="h-3 w-3" />
                    Warmup
                  </span>
                )}
                <div className={cn(
                  'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                  account.is_available
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                )}>
                  {account.is_available ? (
                    <><CheckCircle2 className="h-3 w-3" /> Available</>
                  ) : (
                    <><AlertTriangle className="h-3 w-3" /> Exhausted</>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div className="p-4 space-y-3">
                {/* Health Score */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Health Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all',
                          account.health_score >= 80 ? 'bg-emerald-500' :
                          account.health_score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${account.health_score}%` }}
                      />
                    </div>
                    <span className={cn('text-sm font-bold', getHealthColor(account.health_score))}>
                      {account.health_score}
                    </span>
                  </div>
                </div>

                {/* Send Utilization */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Daily Utilization</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', getUtilizationColor(account.utilization_pct))}
                        style={{ width: `${Math.min(account.utilization_pct, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-[var(--text-secondary)]">
                      {account.sends_today}/{account.daily_send_limit}
                    </span>
                  </div>
                </div>

                {/* Bounce Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-secondary)]">Bounce Rate (7d)</span>
                  <div className="flex items-center gap-1">
                    {account.bounce_rate_7d > 5 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-red-400" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      account.bounce_rate_7d > 5 ? 'text-red-400' :
                      account.bounce_rate_7d > 2 ? 'text-amber-400' : 'text-emerald-400'
                    )}>
                      {account.bounce_rate_7d}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How SSE Works */}
      <div className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-[var(--text-secondary)]" />
          How Smart-Sharding Works
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm text-[var(--text-secondary)]">
          <div>
            <p className="font-medium text-[var(--text-secondary)] mb-1">1. Score Calculation</p>
            <p>Each sender is scored using a weighted formula: (health x 0.6) + (remaining capacity x 0.4).</p>
          </div>
          <div>
            <p className="font-medium text-[var(--text-secondary)] mb-1">2. Automatic Rotation</p>
            <p>The highest-scoring sender is selected for each email. Exhausted accounts are skipped automatically.</p>
          </div>
          <div>
            <p className="font-medium text-[var(--text-secondary)] mb-1">3. Health Recovery</p>
            <p>Health scores recover with opens (+1) and degrade on bounces (-5). Daily counts reset at midnight.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
