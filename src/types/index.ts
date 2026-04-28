import type { Tables } from './database.types';

export type Profile = Tables<'profiles'>;
export type Invite = Tables<'invites'>;
export type ShopDay = Tables<'shop_days'>;
export type Booking = Tables<'bookings'>;
export type DayRequest = Tables<'day_requests'>;

export type UserRole = 'admin' | 'member';
export type ShopDayStatus = 'open' | 'cancelled';
export type BookingStatus = 'confirmed' | 'cancelled';
export type DayRequestStatus = 'pending' | 'approved' | 'declined';

export type ShopDayWithBookingCount = ShopDay & {
  confirmed_count: number;
  my_booking_id: string | null;
};
