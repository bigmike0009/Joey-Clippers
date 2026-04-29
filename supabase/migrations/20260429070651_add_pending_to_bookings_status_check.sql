alter table public.bookings drop constraint if exists bookings_status_check;

alter table public.bookings
  add constraint bookings_status_check
  check (status = any (array['confirmed'::text, 'cancelled'::text, 'pending'::text]));
