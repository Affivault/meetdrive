import { apiClient } from './client';

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  org_id: string;
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
}

export interface TeamInvite {
  id: string;
  org_id: string;
  email: string;
  role: 'admin' | 'member';
  token: string;
  expires_at: string;
  created_at: string;
}

export const teamApi = {
  getOrg: async () => {
    const { data } = await apiClient.get<Organization>('/team/org');
    return data;
  },

  updateOrg: async (name: string) => {
    const { data } = await apiClient.put<Organization>('/team/org', { name });
    return data;
  },

  listMembers: async () => {
    const { data } = await apiClient.get<TeamMember[]>('/team/members');
    return data;
  },

  removeMember: async (memberId: string) => {
    await apiClient.delete(`/team/members/${memberId}`);
  },

  updateMemberRole: async (memberId: string, role: string) => {
    const { data } = await apiClient.put<TeamMember>(`/team/members/${memberId}/role`, { role });
    return data;
  },

  listInvites: async () => {
    const { data } = await apiClient.get<TeamInvite[]>('/team/invites');
    return data;
  },

  invite: async (email: string, role: string) => {
    const { data } = await apiClient.post<TeamInvite>('/team/invites', { email, role });
    return data;
  },

  revokeInvite: async (inviteId: string) => {
    await apiClient.delete(`/team/invites/${inviteId}`);
  },

  acceptInvite: async (token: string) => {
    const { data } = await apiClient.post<{ org_id: string }>('/team/invites/accept', { token });
    return data;
  },
};
