import { supabase } from '@/lib/supabase';

export async function getUpcomingShopDays() {
  const today = new Date().toISOString().split('T')[0];
  return supabase
    .from('shop_days')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });
}

export async function getAllShopDays() {
  return supabase
    .from('shop_days')
    .select('*')
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });
}

export async function createShopDay(
  createdBy: string,
  date: string,
  startTime: string,
  slotCount: number,
  notes?: string,
) {
  return supabase
    .from('shop_days')
    .insert({ date, start_time: startTime, slot_count: slotCount, notes: notes ?? null, created_by: createdBy })
    .select()
    .single();
}

export async function updateShopDay(id: string, startTime: string, slotCount: number) {
  return supabase
    .from('shop_days')
    .update({ start_time: startTime, slot_count: slotCount, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

export async function getPastShopDays() {
  const today = new Date().toISOString().split('T')[0];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  return supabase
    .from('shop_days')
    .select('*')
    .lt('date', today)
    .gte('date', cutoffStr)
    .order('date', { ascending: false })
    .order('start_time', { ascending: false });
}

export async function cancelShopDay(id: string) {
  return supabase
    .from('shop_days')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}
