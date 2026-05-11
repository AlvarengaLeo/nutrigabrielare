import { supabase } from '../lib/supabase.js';

const TABLE = 'email_logs';

/**
 * Fetch email logs with optional filters. Admin only (RLS-enforced).
 *
 * @param {object} opts
 * @param {string} [opts.recipient]   ILIKE filter on recipient_email
 * @param {string} [opts.template]    exact match
 * @param {string} [opts.status]      exact match
 * @param {number} [opts.limit=100]
 * @param {number} [opts.offset=0]
 */
export async function getEmailLogs({
  recipient = '',
  template = '',
  status = '',
  limit = 100,
  offset = 0,
} = {}) {
  let query = supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .order('sent_at', { ascending: false });

  if (recipient.trim()) {
    const term = `%${recipient.trim().replace(/[%_]/g, '')}%`;
    query = query.ilike('recipient_email', term);
  }
  if (template) query = query.eq('template', template);
  if (status) query = query.eq('status', status);

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error('[emailLogs] fetch error:', error.message);
    throw error;
  }
  return { rows: data || [], total: count ?? 0 };
}

/**
 * Aggregate counts per status over a time window (for a quick summary card).
 * @param {number} days  default 7 days
 */
export async function getEmailLogSummary({ days = 7 } = {}) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from(TABLE)
    .select('status, sent_at')
    .gte('sent_at', since.toISOString());

  if (error) throw error;
  const summary = { sent: 0, failed: 0, skipped: 0, queued: 0, bounced: 0 };
  for (const row of data || []) {
    if (row.status in summary) summary[row.status] += 1;
  }
  return summary;
}
