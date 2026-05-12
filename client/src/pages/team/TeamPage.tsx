import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '../../api/team.api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { formatDate, cn } from '../../lib/utils';
import {
  Users,
  UserPlus,
  Trash2,
  Mail,
  Crown,
  Shield,
  User,
  Check,
  Copy,
  RefreshCw,
  Pencil,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  owner: { label: 'Owner', icon: Crown, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  admin: { label: 'Admin', icon: Shield, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  member: { label: 'Member', icon: User, color: 'text-slate-700 bg-slate-50 border-slate-200' },
};

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.member;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function getInitials(email: string) {
  return email.charAt(0)?.toUpperCase() || '?';
}

export function TeamPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [editOrgName, setEditOrgName] = useState('');
  const [editingOrgName, setEditingOrgName] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { data: org, isLoading: orgLoading } = useQuery({
    queryKey: ['team-org'],
    queryFn: teamApi.getOrg,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: teamApi.listMembers,
    enabled: !!org,
  });

  const { data: invites = [], isLoading: invitesLoading } = useQuery({
    queryKey: ['team-invites'],
    queryFn: teamApi.listInvites,
    enabled: !!org,
  });

  const updateOrgMut = useMutation({
    mutationFn: (name: string) => teamApi.updateOrg(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-org'] });
      toast.success('Organisation name updated');
      setEditingOrgName(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update'),
  });

  const inviteMut = useMutation({
    mutationFn: () => teamApi.invite(inviteEmail, inviteRole),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      toast.success(`Invite sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to invite'),
  });

  const removeMemberMut = useMutation({
    mutationFn: teamApi.removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Member removed');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to remove member'),
  });

  const updateRoleMut = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) => teamApi.updateMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Role updated');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update role'),
  });

  const revokeInviteMut = useMutation({
    mutationFn: teamApi.revokeInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites'] });
      toast.success('Invite revoked');
    },
    onError: () => toast.error('Failed to revoke invite'),
  });

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedToken(token);
      toast.success('Invite link copied');
      setTimeout(() => setCopiedToken(null), 2000);
    }).catch(() => {
      toast.error('Failed to copy link — please copy it manually');
    });
  };

  const isOwner = org?.owner_id === user?.id;

  if (orgLoading) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Team</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage your organisation members and invite collaborators</p>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Org Name */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Organisation</p>
            {editingOrgName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editOrgName}
                  onChange={(e) => setEditOrgName(e.target.value)}
                  className="h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                  autoFocus
                />
                <button
                  onClick={() => updateOrgMut.mutate(editOrgName)}
                  disabled={!editOrgName || updateOrgMut.isPending}
                  className="p-2 rounded-lg bg-[#6366F1] text-white hover:bg-[#4F46E5] disabled:opacity-50 transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button onClick={() => setEditingOrgName(false)} className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                  <X className="h-4 w-4 text-[var(--text-tertiary)]" />
                </button>
              </div>
            ) : (
              <p className="text-lg font-semibold text-[var(--text-primary)]">{org?.name || 'My Workspace'}</p>
            )}
          </div>
          {isOwner && !editingOrgName && (
            <button
              onClick={() => { setEditOrgName(org?.name || ''); setEditingOrgName(true); }}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-[var(--text-secondary)] mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Members */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--text-tertiary)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Members</h2>
          <span className="ml-auto text-xs text-[var(--text-tertiary)]">{members.length}</span>
        </div>
        {membersLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-elevated)] transition-colors">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{getInitials(member.email)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{member.email}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Joined {formatDate(member.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && member.role !== 'owner' ? (
                    <select
                      value={member.role}
                      onChange={(e) => updateRoleMut.mutate({ memberId: member.id, role: e.target.value })}
                      className="h-7 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 text-xs focus:border-[#6366F1] outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <RoleBadge role={member.role} />
                  )}
                  {isOwner && member.user_id !== user?.id && member.role !== 'owner' && (
                    <button
                      onClick={() => { if (confirm(`Remove ${member.email}?`)) removeMemberMut.mutate(member.id); }}
                      className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {(invites.length > 0 || isOwner) && (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-[var(--border-subtle)] flex items-center gap-2">
            <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Pending Invites</h2>
            <span className="ml-auto text-xs text-[var(--text-tertiary)]">{invites.length}</span>
          </div>
          {invitesLoading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : invites.length === 0 ? (
            <div className="px-5 py-6 text-center text-sm text-[var(--text-secondary)]">No pending invites</div>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-elevated)] transition-colors">
                  <div className="h-9 w-9 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center flex-shrink-0">
                    <Mail className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{invite.email}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Expires {formatDate(invite.expires_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={invite.role} />
                    <button
                      onClick={() => copyInviteLink(invite.token)}
                      title="Copy invite link"
                      className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                    >
                      {copiedToken === invite.token ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => revokeInviteMut.mutate(invite.id)}
                        title="Revoke invite"
                        className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-default)] shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Invite Team Member</h2>
              <button onClick={() => setShowInviteModal(false)} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="w-full h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 text-sm focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none"
                >
                  <option value="member">Member — can view and run campaigns</option>
                  <option value="admin">Admin — full access except billing</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-3">
              We'll generate an invite link you can share. The invite expires in 7 days.
            </p>
            <div className="flex gap-3 mt-5">
              <Button variant="secondary" className="flex-1" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <button
                disabled={!inviteEmail || inviteMut.isPending}
                onClick={() => inviteMut.mutate()}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
              >
                {inviteMut.isPending ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
