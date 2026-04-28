import { supabase } from '@/lib/supabase';

export async function getUpcomingShopDaysWithBookings() {
  return supabase.rpc('get_upcoming_shop_days_with_bookings');
}

export async function getMyBookings() {
  return supabase.rpc('get_my_bookings');
}

export async function bookSlot(shopDayId: string) {
  return supabase.rpc('book_slot', { p_shop_day_id: shopDayId });
}

export async function cancelBooking(bookingId: string) {
  return supabase.rpc('cancel_booking', { p_booking_id: bookingId });
}

export async function getBookingsForDay(shopDayId: string) {
  return supabase
    .from('bookings')
    .select('*, profiles(full_name)')
    .eq('shop_day_id', shopDayId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: true });
}
