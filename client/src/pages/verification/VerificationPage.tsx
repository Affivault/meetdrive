import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { verificationApi } from '../../api/verification.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, ShieldX, AlertTriangle, CheckCircle2, XCircle, Loader2, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import type { DcsVerificationResult } from '@lemlist/shared';

function DcsBadge({ score }: { score: number }) {
  const level = score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low';
  const cfg = {
    high: { label: 'High', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    medium: { label: 'Medium', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    low: { label: 'Low', color: 'text-red-700 bg-red-50 border-red-200' },
  }[level];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border', cfg.color)}>
      {score}/100 · {cfg.label}
    </span>
  );
}

function VerificationResultCard({ result }: { result: DcsVerificationResult }) {
  const passed = result.score >= 60;
  return (
    <div className={cn(
      'rounded-2xl border-2 p-5 space-y-3',
      passed ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {passed
            ? <ShieldCheck className="h-6 w-6 text-emerald-600" />
            : <ShieldX className="h-6 w-6 text-red-500" />
          }
          <div>
            <p className="font-semibold text-[var(--text-primary)]">{result.email}</p>
            <p className="text-sm text-[var(--text-secondary)]">{passed ? 'Email looks deliverable' : 'Deliverability issue detected'}</p>
          </div>
        </div>
        <DcsBadge score={result.score} />
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { label: 'Syntax', ok: result.syntax_ok },
          { label: 'Domain / DNS', ok: result.domain_ok },
          { label: 'SMTP Handshake', ok: result.smtp_ok },
        ].map((check) => (
          <div key={check.label} className="flex items-center gap-2 p-3 rounded-xl bg-white/70 border border-white/80">
            {check.ok
              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              : <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            }
            <span className="text-xs font-medium text-[var(--text-secondary)]">{check.label}</span>
          </div>
        ))}
      </div>

      {result.fail_reason && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-100 border border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-700">{result.fail_reason}</p>
        </div>
      )}
    </div>
  );
}

export function VerificationPage() {
  const [emailInput, setEmailInput] = useState('');
  const [lastResult, setLastResult] = useState<DcsVerificationResult | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['verification-stats'],
    queryFn: verificationApi.getStats,
  });

  const verifyMut = useMutation({
    mutationFn: (email: string) => verificationApi.verifyEmail(email),
    onSuccess: (result) => {
      setLastResult(result);
      setEmailInput('');
    },
    onError: () => toast.error('Verification failed'),
  });

  const batchMut = useMutation({
    mutationFn: () => verificationApi.batchVerify(),
    onSuccess: (res) => toast.success(`Verified ${res.verified} contact(s)`),
    onError: () => toast.error('Batch verification failed'),
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Email Verification</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Verify email deliverability with our 3-layer pipeline: syntax → DNS → SMTP handshake
        </p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total contacts', value: stats.total, color: 'text-[var(--text-primary)]' },
            { label: 'Verified', value: stats.verified, color: 'text-emerald-600' },
            { label: 'Unverified', value: stats.unverified, color: 'text-amber-600' },
            { label: 'Avg DCS score', value: `${Math.round(stats.avg_score || 0)}/100`, color: 'text-[#6366F1]' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <p className="text-xs text-[var(--text-tertiary)] mb-1">{stat.label}</p>
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Score distribution */}
      {stats?.score_distribution && stats.score_distribution.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-4 uppercase tracking-wider">DCS Score Distribution</h2>
          <div className="space-y-2">
            {stats.score_distribution.map((bucket) => {
              const pct = stats.total > 0 ? Math.round((bucket.count / stats.total) * 100) : 0;
              const isGood = bucket.range.startsWith('80') || bucket.range.startsWith('9') || bucket.range === '100';
              const isMid = bucket.range.startsWith('5') || bucket.range.startsWith('6') || bucket.range.startsWith('7');
              return (
                <div key={bucket.range} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[var(--text-tertiary)] w-14 flex-shrink-0">{bucket.range}</span>
                  <div className="flex-1 h-4 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', isGood ? 'bg-emerald-500' : isMid ? 'bg-amber-400' : 'bg-red-400')}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] w-16 text-right flex-shrink-0">{bucket.count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Single verify */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 space-y-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">Verify a single address</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
            <input
              type="email"
              placeholder="email@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && emailInput) verifyMut.mutate(emailInput); }}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
            />
          </div>
          <button
            disabled={!emailInput || verifyMut.isPending}
            onClick={() => verifyMut.mutate(emailInput)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {verifyMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Verify
          </button>
        </div>

        {lastResult && <VerificationResultCard result={lastResult} />}
      </div>

      {/* Batch verify */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Batch verify all contacts</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Run the full 3-layer verification pipeline on all unverified contacts.
              Results are saved to each contact and shown in the Contacts list.
            </p>
          </div>
          <button
            disabled={batchMut.isPending}
            onClick={() => batchMut.mutate()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 transition-all flex-shrink-0"
          >
            {batchMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Run batch verify
          </button>
        </div>
      </div>
    </div>
  );
}
