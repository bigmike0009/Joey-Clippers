drop function if exists public.get_upcoming_shop_days_with_bookings();

create or replace function public.get_upcoming_shop_days_with_bookings()
returns table(
  id uuid,
  date date,
  slot_count integer,
  status text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  confirmed_count bigint,
  my_booking_id uuid,
  my_booking_status text,
  my_waitlist_booking_id uuid
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    sd.id,
    sd.date,
    sd.slot_count,
    sd.status,
    sd.notes,
    sd.created_by,
    sd.created_at,
    sd.updated_at,
    count(b.id) filter (where b.status = 'confirmed')                                              as confirmed_count,
    (max(case when b.member_id = auth.uid() and b.status = 'confirmed' then b.id::text end))::uuid as my_booking_id,
    max(case when b.member_id = auth.uid() then b.status end)                                      as my_booking_status,
    (max(case when b.member_id = auth.uid() and b.status = 'pending' then b.id::text end))::uuid   as my_waitlist_booking_id
  from shop_days sd
  left join bookings b on b.shop_day_id = sd.id
  where sd.date >= current_date
  group by sd.id
  order by sd.date;
$$;

grant all on function public.get_upcoming_shop_days_with_bookings() to anon;
grant all on function public.get_upcoming_shop_days_with_bookings() to authenticated;
grant all on function public.get_upcoming_shop_days_with_bookings() to service_role;
