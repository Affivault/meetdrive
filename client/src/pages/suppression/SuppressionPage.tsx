import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suppressionApi } from '../../api/suppression.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { formatDate } from '../../lib/utils';
import { ShieldOff, Plus, Trash2, Upload, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_PAGE_SIZE } from '../../lib/constants';

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  unsubscribed: { label: 'Unsubscribed', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  bounced: { label: 'Bounced', color: 'text-red-600 bg-red-50 border-red-200' },
  complained: { label: 'Complained', color: 'text-orange-600 bg-orange-50 border-orange-200' },
  manual: { label: 'Manual', color: 'text-slate-600 bg-slate-50 border-slate-200' },
};

export function SuppressionPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addReason, setAddReason] = useState<string>('manual');
  const [addNotes, setAddNotes] = useState('');
  const [bulkText, setBulkText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['suppression', page, search, reasonFilter],
    queryFn: () => suppressionApi.list({ page, limit: DEFAULT_PAGE_SIZE, search: search || undefined, reason: reasonFilter || undefined }),
  });

  const addMut = useMutation({
    mutationFn: () => suppressionApi.add(addEmail, addReason as any, addNotes || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppression'] });
      toast.success('Email added to suppression list');
      setShowAddModal(false);
      setAddEmail('');
      setAddNotes('');
    },
    onError: () => toast.error('Failed to add email'),
  });

  const bulkMut = useMutation({
    mutationFn: () => {
      const emails = bulkText.split(/[\n,;]+/).map((e) => e.trim()).filter((e) => e.includes('@'));
      return suppressionApi.addBulk(emails, addReason as any);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['suppression'] });
      toast.success(`${res.added} emails added to suppression list`);
      setShowBulkModal(false);
      setBulkText('');
    },
    onError: () => toast.error('Failed to add emails'),
  });

  const removeMut = useMutation({
    mutationFn: suppressionApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppression'] });
      toast.success('Removed from suppression list');
    },
    onError: () => toast.error('Failed to remove'),
  });

  const entries = data?.data || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Suppression List</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Emails on this list will never receive campaign emails{data?.total !== undefined ? ` · ${data.total} total` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowBulkModal(true)}>
            <Upload className="h-4 w-4" /> Import
          </Button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
          >
            <Plus className="h-4 w-4" /> Add Email
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); }} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            </button>
          )}
        </div>
        <select
          value={reasonFilter}
          onChange={(e) => { setReasonFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
        >
          <option value="">All reasons</option>
          <option value="unsubscribed">Unsubscribed</option>
          <option value="bounced">Bounced</option>
          <option value="complained">Complained</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={ShieldOff}
          title="No suppressed emails"
          description="Emails you add here will never receive campaign messages."
          actionLabel="Add Email"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <>
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Reason</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Notes</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Added</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {entries.map((entry) => {
                  const meta = REASON_LABELS[entry.reason] || REASON_LABELS.manual;
                  return (
                    <tr key={entry.id} className="hover:bg-[var(--bg-elevated)] transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">{entry.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${meta.color}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{entry.notes || '—'}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{formatDate(entry.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { if (confirm(`Remove ${entry.email} from suppression list?`)) removeMut.mutate(entry.email); }}
                          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-[var(--text-secondary)]">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-2xl w-full max-w-md p-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Add to Suppression List</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email address</label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reason</label>
                <select
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                >
                  <option value="manual">Manual</option>
                  <option value="unsubscribed">Unsubscribed</option>
                  <option value="bounced">Bounced</option>
                  <option value="complained">Complained</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  placeholder="Optional note..."
                  className="w-full h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <button
                disabled={!addEmail || addMut.isPending}
                onClick={() => addMut.mutate()}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {addMut.isPending ? 'Adding...' : 'Add to list'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-2xl w-full max-w-md p-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Bulk Import</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Email addresses (one per line, or comma-separated)
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={8}
                  placeholder={"user1@example.com\nuser2@example.com\nuser3@example.com"}
                  className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none resize-none font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Reason</label>
                <select
                  value={addReason}
                  onChange={(e) => setAddReason(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                >
                  <option value="manual">Manual</option>
                  <option value="unsubscribed">Unsubscribed</option>
                  <option value="bounced">Bounced</option>
                  <option value="complained">Complained</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowBulkModal(false)}>Cancel</Button>
              <button
                disabled={!bulkText.trim() || bulkMut.isPending}
                onClick={() => bulkMut.mutate()}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {bulkMut.isPending ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
