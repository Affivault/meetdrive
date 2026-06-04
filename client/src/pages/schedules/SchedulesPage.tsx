import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CalendarClock, Plus, Star, Trash2, Pencil, X, Check } from 'lucide-react';
import { sendingSchedulesApi, type SendingSchedule, type SendingScheduleInput } from '../../api/sending-schedules.api';

const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const TIMEZONES = [
  'UTC', 'Europe/London', 'America/New_York', 'America/Los_Angeles',
  'America/Chicago', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/Paris',
];

export function SchedulesPage() {
  const qc = useQueryClient();
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['sending-schedules'],
    queryFn: sendingSchedulesApi.list,
  });

  const [editing, setEditing] = useState<SendingSchedule | null>(null);
  const [creating, setCreating] = useState(false);

  const createMut = useMutation({
    mutationFn: (input: SendingScheduleInput) => sendingSchedulesApi.create(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sending-schedules'] }); setCreating(false); toast.success('Schedule created'); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to create'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<SendingScheduleInput> }) => sendingSchedulesApi.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sending-schedules'] }); setEditing(null); toast.success('Updated'); },
    onError: (e: any) => toast.error(e.response?.data?.error || 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => sendingSchedulesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sending-schedules'] }); toast.success('Deleted'); },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[18px] font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-[#6366F1]" />
            Sending Schedules
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Reusable send-time windows. Set one as default to apply automatically to new campaigns.
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus className="h-4 w-4" /> New schedule
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-10 text-[var(--text-secondary)]">Loading schedules...</div>
      ) : schedules.length === 0 && !creating ? (
        <div className="text-center py-10 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
          <CalendarClock className="h-12 w-12 mx-auto text-[var(--text-tertiary)] mb-3" />
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">No schedules yet</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">Create a reusable send-time window to apply to campaigns in one click.</p>
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus className="h-4 w-4" /> Create your first schedule
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {creating && (
            <ScheduleEditor
              onCancel={() => setCreating(false)}
              onSave={(input) => createMut.mutate(input)}
              loading={createMut.isPending}
            />
          )}
          {schedules.map((s) => (
            editing?.id === s.id ? (
              <ScheduleEditor
                key={s.id}
                initial={s}
                onCancel={() => setEditing(null)}
                onSave={(input) => updateMut.mutate({ id: s.id, input })}
                loading={updateMut.isPending}
              />
            ) : (
              <ScheduleCard
                key={s.id}
                schedule={s}
                onEdit={() => setEditing(s)}
                onDelete={() => { if (confirm(`Delete "${s.name}"?`)) deleteMut.mutate(s.id); }}
                onMakeDefault={() => updateMut.mutate({ id: s.id, input: { is_default: true } })}
              />
            )
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleCard({ schedule, onEdit, onDelete, onMakeDefault }: {
  schedule: SendingSchedule;
  onEdit: () => void;
  onDelete: () => void;
  onMakeDefault: () => void;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[#6366F1]/30 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-[var(--text-primary)]">{schedule.name}</h3>
            {schedule.is_default && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
                <Star className="h-3 w-3 fill-current" /> Default
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Time window</div>
              <div className="font-medium text-[var(--text-primary)]">{schedule.send_window_start} – {schedule.send_window_end}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Timezone</div>
              <div className="font-medium text-[var(--text-primary)]">{schedule.timezone}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Days</div>
              <div className="flex gap-1">
                {DAYS.map((d) => (
                  <span key={d.key} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${schedule.send_days.includes(d.key) ? 'bg-[#6366F1]/10 text-[#6366F1]' : 'bg-[var(--bg-hover)] text-[var(--text-tertiary)]'}`}>
                    {d.label[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {!schedule.is_default && (
            <button onClick={onMakeDefault} title="Make default" className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[#6366F1] hover:bg-[#6366F1]/10">
              <Star className="h-4 w-4" />
            </button>
          )}
          <button onClick={onEdit} title="Edit" className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={onDelete} title="Delete" className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleEditor({ initial, onCancel, onSave, loading }: {
  initial?: SendingSchedule;
  onCancel: () => void;
  onSave: (input: SendingScheduleInput) => void;
  loading: boolean;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [timezone, setTimezone] = useState(initial?.timezone || 'UTC');
  const [start, setStart] = useState(initial?.send_window_start || '09:00');
  const [end, setEnd] = useState(initial?.send_window_end || '17:00');
  const [days, setDays] = useState<string[]>(initial?.send_days || ['mon', 'tue', 'wed', 'thu', 'fri']);
  const [isDefault, setIsDefault] = useState(initial?.is_default || false);

  const handleSave = () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    if (days.length === 0) { toast.error('Pick at least one day'); return; }
    onSave({
      name: name.trim(),
      timezone,
      send_window_start: start,
      send_window_end: end,
      send_days: days,
      is_default: isDefault,
    });
  };

  const toggleDay = (key: string) => {
    setDays((curr) => curr.includes(key) ? curr.filter((d) => d !== key) : [...curr, key]);
  };

  return (
    <div className="bg-[var(--bg-surface)] border-2 border-[#6366F1]/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--text-primary)]">{initial ? 'Edit schedule' : 'New schedule'}</h3>
        <button onClick={onCancel} className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Business Hours UK"
            className="input-field"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Timezone</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field">
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Start time</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">End time</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Days of week</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => toggleDay(d.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  days.includes(d.key)
                    ? 'bg-[#6366F1] text-white'
                    : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} className="rounded" />
          <span className="text-[var(--text-secondary)]">Set as default — applied to new campaigns automatically</span>
        </label>

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            <Check className="h-4 w-4" /> {loading ? 'Saving...' : (initial ? 'Save changes' : 'Create schedule')}
          </button>
        </div>
      </div>
    </div>
  );
}
