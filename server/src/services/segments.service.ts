import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateSegmentInput, UpdateSegmentInput, FilterConfig, SegmentCondition } from '@lemlist/shared';

export const segmentsService = {
  async list(userId: string) {
    const { data, error } = await supabaseAdmin
      .from('saved_segments')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data || [];
  },

  async get(userId: string, id: string) {
    const { data, error } = await supabaseAdmin
      .from('saved_segments')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Segment not found', 404);

    return data;
  },

  async create(userId: string, input: CreateSegmentInput) {
    // Count contacts matching the filter
    const count = await this.countMatchingContacts(userId, input.filter_config);

    const { data, error } = await supabaseAdmin
      .from('saved_segments')
      .insert({
        ...input,
        user_id: userId,
        cached_count: count,
        cached_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new AppError('Segment with this name already exists', 409);
      throw new AppError(error.message, 500);
    }

    return data;
  },

  async update(userId: string, id: string, input: UpdateSegmentInput) {
    let updateData: any = { ...input };

    // If filter_config changed, recalculate count
    if (input.filter_config) {
      const count = await this.countMatchingContacts(userId, input.filter_config);
      updateData.cached_count = count;
      updateData.cached_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('saved_segments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    if (!data) throw new AppError('Segment not found', 404);

    return data;
  },

  async delete(userId: string, id: string) {
    const { error } = await supabaseAdmin
      .from('saved_segments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError(error.message, 500);
  },

  async refreshCount(userId: string, id: string) {
    const segment = await this.get(userId, id);
    const count = await this.countMatchingContacts(userId, segment.filter_config);

    const { data, error } = await supabaseAdmin
      .from('saved_segments')
      .update({ cached_count: count, cached_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 500);
    return data;
  },

  async countMatchingContacts(userId: string, filterConfig: FilterConfig): Promise<number> {
    const { conditions, logic } = filterConfig;

    if (!conditions || conditions.length === 0) {
      // No conditions = all contacts
      const { count } = await supabaseAdmin
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      return count || 0;
    }

    // Build query dynamically
    let query = supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // For 'or' logic, we need to build an or() clause
    // For 'and' logic (default), we chain conditions
    if (logic === 'or' && conditions.length > 1) {
      const orConditions = conditions.map((c) => this.buildConditionString(c)).filter(Boolean);
      if (orConditions.length > 0) {
        query = query.or(orConditions.join(','));
      }
    } else {
      // AND logic - chain conditions
      for (const condition of conditions) {
        query = this.applyCondition(query, condition);
      }
    }

    const { count, error } = await query;
    if (error) throw new AppError(error.message, 500);

    return count || 0;
  },

  async getMatchingContactIds(userId: string, filterConfig: FilterConfig): Promise<string[]> {
    const { conditions, logic } = filterConfig;

    let query = supabaseAdmin
      .from('contacts')
      .select('id')
      .eq('user_id', userId);

    if (!conditions || conditions.length === 0) {
      const { data } = await query;
      return (data || []).map((c: any) => c.id);
    }

    if (logic === 'or' && conditions.length > 1) {
      const orConditions = conditions.map((c) => this.buildConditionString(c)).filter(Boolean);
      if (orConditions.length > 0) {
        query = query.or(orConditions.join(','));
      }
    } else {
      for (const condition of conditions) {
        query = this.applyCondition(query, condition);
      }
    }

    const { data, error } = await query;
    if (error) throw new AppError(error.message, 500);

    return (data || []).map((c: any) => c.id);
  },

  buildConditionString(condition: SegmentCondition): string | null {
    const { field, operator, value } = condition;

    // Handle tag field separately (requires join)
    if (field === 'tag') return null;

    // Quote string values so commas and parens inside them don't break PostgREST OR parsing
    const q = (v: string | null | undefined): string => {
      const s = String(v ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };

    switch (operator) {
      case 'equals':
        return `${field}.eq.${q(value)}`;
      case 'not_equals':
        return `${field}.neq.${q(value)}`;
      case 'contains':
        return `${field}.ilike."%${String(value ?? '').replace(/"/g, '""')}%"`;
      case 'not_contains':
        return `${field}.not.ilike."%${String(value ?? '').replace(/"/g, '""')}%"`;
      case 'starts_with':
        return `${field}.ilike.${q(`${value ?? ''}%`)}`;
      case 'ends_with':
        return `${field}.ilike.${q(`%${value ?? ''}`)}`;
      case 'is_empty':
        return `${field}.is.null`;
      case 'is_not_empty':
        return `${field}.not.is.null`;
      case 'greater_than':
        return `${field}.gt.${value}`;
      case 'less_than':
        return `${field}.lt.${value}`;
      case 'is_true':
        return `${field}.eq.true`;
      case 'is_false':
        return `${field}.eq.false`;
      default:
        return null;
    }
  },

  applyCondition(query: any, condition: SegmentCondition): any {
    const { field, operator, value } = condition;

    // Skip tag field for now (would need separate handling)
    if (field === 'tag') return query;

    switch (operator) {
      case 'equals':
        return query.eq(field, value);
      case 'not_equals':
        return query.neq(field, value);
      case 'contains':
        return query.ilike(field, `%${value}%`);
      case 'not_contains':
        return query.not(field, 'ilike', `%${value}%`);
      case 'starts_with':
        return query.ilike(field, `${value}%`);
      case 'ends_with':
        return query.ilike(field, `%${value}`);
      case 'is_empty':
        return query.is(field, null);
      case 'is_not_empty':
        return query.not(field, 'is', null);
      case 'greater_than':
        return query.gt(field, value);
      case 'less_than':
        return query.lt(field, value);
      case 'is_true':
        return query.eq(field, true);
      case 'is_false':
        return query.eq(field, false);
      default:
        return query;
    }
  },

  // Built-in segment helpers
  getUnsubscribedFilter(): FilterConfig {
    return {
      conditions: [{ field: 'is_unsubscribed', operator: 'is_true', value: null }],
      logic: 'and',
    };
  },

  getBouncedFilter(): FilterConfig {
    return {
      conditions: [{ field: 'is_bounced', operator: 'is_true', value: null }],
      logic: 'and',
    };
  },

  getSuppressedFilter(): FilterConfig {
    return {
      conditions: [
        { field: 'is_unsubscribed', operator: 'is_true', value: null },
        { field: 'is_bounced', operator: 'is_true', value: null },
      ],
      logic: 'or',
    };
  },

  getVerifiedFilter(minScore: number = 70): FilterConfig {
    return {
      conditions: [{ field: 'dcs_score', operator: 'greater_than', value: minScore }],
      logic: 'and',
    };
  },
};
