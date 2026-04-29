import { supabase } from '@/lib/supabase';

function cutoffDateStr() {
  const d = new Date();
  d.setDate(d.getDate() - 60);
  return d.toISOString().split('T')[0];
}

export async function getMyDayRequests() {
  return supabase
    .from('day_requests')
    .select('*')
    .gte('requested_date', cutoffDateStr())
    .order('requested_date', { ascending: true });
}

export async function getAllDayRequests() {
  return supabase
    .from('day_requests')
    .select('*, profiles!day_requests_requested_by_fkey(full_name)')
    .gte('requested_date', cutoffDateStr())
    .order('requested_date', { ascending: true });
}

export async function submitDayRequest(requestedBy: string, requestedDate: string, notes?: string) {
  return supabase
    .from('day_requests')
    .insert({ requested_by: requestedBy, requested_date: requestedDate, notes: notes ?? null })
    .select()
    .single();
}

export async function respondToDayRequest(
  id: string,
  respondedBy: string,
  status: 'approved' | 'declined',
) {
  return supabase
    .from('day_requests')
    .update({
      status,
      responded_by: respondedBy,
      responded_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
}
