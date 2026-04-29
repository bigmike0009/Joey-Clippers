create extension if not exists pg_net;
create extension if not exists pg_cron;

-- ─── Trigger: day_requests INSERT ───────────────────────────────────────────

create or replace function public.trigger_notify_day_requests()
returns trigger language plpgsql security definer as $$
begin
  perform net.http_post(
    url     := 'https://wdyseexaijxwmqukjbde.supabase.co/functions/v1/notify',
    body    := jsonb_build_object(
                 'type',       tg_op,
                 'table',      tg_table_name,
                 'schema',     tg_table_schema,
                 'record',     row_to_json(new)::jsonb,
                 'old_record', null
               ),
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  return null;
end;
$$;

drop trigger if exists on_day_request_insert on public.day_requests;
create trigger on_day_request_insert
  after insert on public.day_requests
  for each row execute function public.trigger_notify_day_requests();

-- ─── Trigger: bookings INSERT + UPDATE ──────────────────────────────────────

create or replace function public.trigger_notify_bookings()
returns trigger language plpgsql security definer as $$
begin
  perform net.http_post(
    url     := 'https://wdyseexaijxwmqukjbde.supabase.co/functions/v1/notify',
    body    := jsonb_build_object(
                 'type',       tg_op,
                 'table',      tg_table_name,
                 'schema',     tg_table_schema,
                 'record',     row_to_json(new)::jsonb,
                 'old_record', case when tg_op = 'INSERT' then null
                                    else row_to_json(old)::jsonb end
               ),
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  return null;
end;
$$;

drop trigger if exists on_booking_change on public.bookings;
create trigger on_booking_change
  after insert or update on public.bookings
  for each row execute function public.trigger_notify_bookings();

-- ─── Trigger: shop_days INSERT + UPDATE ─────────────────────────────────────

create or replace function public.trigger_notify_shop_days()
returns trigger language plpgsql security definer as $$
begin
  perform net.http_post(
    url     := 'https://wdyseexaijxwmqukjbde.supabase.co/functions/v1/notify',
    body    := jsonb_build_object(
                 'type',       tg_op,
                 'table',      tg_table_name,
                 'schema',     tg_table_schema,
                 'record',     row_to_json(new)::jsonb,
                 'old_record', case when tg_op = 'INSERT' then null
                                    else row_to_json(old)::jsonb end
               ),
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  return null;
end;
$$;

drop trigger if exists on_shop_day_change on public.shop_days;
create trigger on_shop_day_change
  after insert or update on public.shop_days
  for each row execute function public.trigger_notify_shop_days();

-- ─── Trigger: profiles DELETE ────────────────────────────────────────────────

create or replace function public.trigger_notify_profiles()
returns trigger language plpgsql security definer as $$
begin
  perform net.http_post(
    url     := 'https://wdyseexaijxwmqukjbde.supabase.co/functions/v1/notify',
    body    := jsonb_build_object(
                 'type',       tg_op,
                 'table',      tg_table_name,
                 'schema',     tg_table_schema,
                 'record',     null,
                 'old_record', row_to_json(old)::jsonb
               ),
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  return null;
end;
$$;

drop trigger if exists on_profile_delete on public.profiles;
create trigger on_profile_delete
  after delete on public.profiles
  for each row execute function public.trigger_notify_profiles();

-- ─── Cron: notify-reminders every 5 minutes ─────────────────────────────────

select cron.schedule(
  'notify-reminders',
  '*/5 * * * *',
  $$
  select net.http_post(
    url     := 'https://wdyseexaijxwmqukjbde.supabase.co/functions/v1/notify-reminders',
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  $$
);
