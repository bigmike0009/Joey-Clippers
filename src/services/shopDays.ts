import { supabase } from '@/lib/supabase';

export async function getUpcomingShopDays() {
  const today = new Date().toISOString().split('T')[0];
  return supabase
    .from('shop_days')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true });
}

export async function getAllShopDays() {
  return supabase
    .from('shop_days')
    .select('*')
    .order('date', { ascending: false });
}

export async function createShopDay(
  createdBy: string,
  date: string,
  slotCount: number,
  notes?: string,
) {
  return supabase
    .from('shop_days')
    .insert({ date, slot_count: slotCount, notes: notes ?? null, created_by: createdBy })
    .select()
    .single();
}

export async function updateShopDaySlots(id: string, slotCount: number) {
  return supabase
    .from('shop_days')
    .update({ slot_count: slotCount, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

export async function cancelShopDay(id: string) {
  return supabase
    .from('shop_days')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}
