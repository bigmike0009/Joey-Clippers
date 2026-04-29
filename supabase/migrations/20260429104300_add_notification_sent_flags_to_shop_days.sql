alter table public.shop_days
  add column if not exists reminder_sent boolean not null default false,
  add column if not exists open_notif_sent boolean not null default false;
