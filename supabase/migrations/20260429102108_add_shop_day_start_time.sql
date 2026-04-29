alter table public.shop_days
  add column if not exists start_time time without time zone not null default '09:00';

alter table public.day_requests
  add column if not exists requested_time time without time zone not null default '09:00';

comment on column public.shop_days.start_time is 'Minute-of-day start time for this shop day.';
comment on column public.day_requests.requested_time is 'Requested minute-of-day start time for a member day request.';

drop function if exists public.approve_day_request(uuid, integer);
drop function if exists public.approve_day_request(uuid, integer, time without time zone);

create or replace function public.approve_day_request(
  p_request_id uuid,
  p_slot_count integer,
  p_start_time time without time zone default null
) returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_date           date;
  v_requested_time time without time zone;
  v_requester      uuid;
  v_shop_day_id    uuid;
begin
  if get_my_role() <> 'admin' then
    raise exception 'not_authorized' using errcode = 'P0001';
  end if;

  select requested_date, requested_time, requested_by
    into v_date, v_requested_time, v_requester
    from public.day_requests
   where id = p_request_id and status = 'pending';

  if not found then
    raise exception 'request_not_found' using errcode = 'P0002';
  end if;

  insert into public.shop_days (date, start_time, slot_count, created_by)
  values (v_date, coalesce(p_start_time, v_requested_time), p_slot_count, auth.uid())
  returning id into v_shop_day_id;

  insert into public.bookings (member_id, shop_day_id, status)
  values (v_requester, v_shop_day_id, 'confirmed');

  update public.day_requests
     set status       = 'approved',
         responded_by = auth.uid(),
         responded_at = now()
   where id = p_request_id;
end;
$$;

drop function if exists public.get_my_bookings();

create or replace function public.get_my_bookings()
returns table(
  booking_id uuid,
  booking_status text,
  booked_at timestamp with time zone,
  shop_day_id uuid,
  date date,
  start_time time without time zone,
  slot_count integer,
  shop_day_status text,
  notes text
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    b.id           as booking_id,
    b.status       as booking_status,
    b.created_at   as booked_at,
    sd.id          as shop_day_id,
    sd.date,
    sd.start_time,
    sd.slot_count,
    sd.status      as shop_day_status,
    sd.notes
  from bookings b
  join shop_days sd on sd.id = b.shop_day_id
  where b.member_id = auth.uid()
  order by sd.date desc, sd.start_time desc;
$$;

drop function if exists public.get_upcoming_shop_days_with_bookings();

create or replace function public.get_upcoming_shop_days_with_bookings()
returns table(
  id uuid,
  date date,
  start_time time without time zone,
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
    sd.start_time,
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
  order by sd.date, sd.start_time;
$$;

drop function if exists public.get_waitlist_bookings();

create or replace function public.get_waitlist_bookings()
returns table(
  booking_id uuid,
  member_id uuid,
  full_name text,
  shop_day_id uuid,
  date date,
  start_time time without time zone,
  slot_count integer,
  confirmed_count bigint,
  requested_at timestamp with time zone
)
language sql
security definer
set search_path to 'public'
as $$
  select
    b.id,
    b.member_id,
    p.full_name,
    sd.id,
    sd.date,
    sd.start_time,
    sd.slot_count,
    (select count(*) from bookings c where c.shop_day_id = sd.id and c.status = 'confirmed'),
    b.created_at
  from bookings b
  join profiles p on p.id = b.member_id
  join shop_days sd on sd.id = b.shop_day_id
  where b.status = 'pending'
    and sd.status = 'open'
  order by sd.date asc, sd.start_time asc, b.created_at asc;
$$;

grant all on function public.approve_day_request(uuid, integer, time without time zone) to anon;
grant all on function public.approve_day_request(uuid, integer, time without time zone) to authenticated;
grant all on function public.approve_day_request(uuid, integer, time without time zone) to service_role;

grant all on function public.get_my_bookings() to anon;
grant all on function public.get_my_bookings() to authenticated;
grant all on function public.get_my_bookings() to service_role;

grant all on function public.get_upcoming_shop_days_with_bookings() to anon;
grant all on function public.get_upcoming_shop_days_with_bookings() to authenticated;
grant all on function public.get_upcoming_shop_days_with_bookings() to service_role;

grant all on function public.get_waitlist_bookings() to anon;
grant all on function public.get_waitlist_bookings() to authenticated;
grant all on function public.get_waitlist_bookings() to service_role;
