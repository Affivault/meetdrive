import { apiClient } from './client';
import type { CampaignAnalytics, OverviewAnalytics, ContactActivityItem } from '@lemlist/shared';

export interface TrendDataPoint {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
}

export const analyticsApi = {
  overview: async (days?: number) => {
    const { data } = await apiClient.get<OverviewAnalytics>('/analytics/overview', {
      params: days ? { days } : undefined,
    });
    return data;
  },

  trend: async (days: number = 30) => {
    const { data } = await apiClient.get<TrendDataPoint[]>('/analytics/trend', {
      params: { days },
    });
    return data;
  },

  campaign: async (campaignId: string) => {
    const { data } = await apiClient.get<CampaignAnalytics>(`/analytics/campaigns/${campaignId}`);
    return data;
  },

  campaignContacts: async (campaignId: string) => {
    const { data } = await apiClient.get<{ contacts: Array<{
      contact_id: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
      status: string;
      sent: number;
      opened: number;
      clicked: number;
      replied: boolean;
    }> }>(`/analytics/campaigns/${campaignId}/contacts`);
    return data;
  },

  contactTimeline: async (contactId: string) => {
    const { data } = await apiClient.get<ContactActivityItem[]>(`/analytics/contacts/${contactId}/timeline`);
    return data;
  },

  deliverability: async () => {
    const { data } = await apiClient.get<{
      dcs_distribution: { label: string; value: number; color: string }[];
      bounced_contacts: number;
      suppression_by_reason: { label: string; value: number; color: string }[];
    }>('/analytics/deliverability');
    return data;
  },

  exportOverviewReport: (days?: number) => {
    const params = new URLSearchParams();
    if (days) params.set('days', String(days));
    return `${apiClient.defaults.baseURL}/analytics/export/overview${params.toString() ? '?' + params.toString() : ''}`;
  },

  exportCampaignReport: (campaignId: string) => {
    return `${apiClient.defaults.baseURL}/analytics/export/campaigns/${campaignId}`;
  },
};
