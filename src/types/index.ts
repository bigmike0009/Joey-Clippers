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

import type { Database } from './database.types';

type RpcReturns<F extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][F]['Returns'] extends (infer R)[] ? R : never;

export type ShopDaySummary = RpcReturns<'get_upcoming_shop_days_with_bookings'>;
export type MyBookingRow = RpcReturns<'get_my_bookings'>;
