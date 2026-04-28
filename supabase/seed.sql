-- Joe's Clippers seed data
-- Idempotent: safe to re-run. Use `npx supabase db reset` or `npm run db:seed`.
-- WARNING: This truncates all tables. Development only.

truncate public.day_requests, public.bookings, public.shop_days, public.invites, public.profiles restart identity cascade;

-- -----------------------------------------------------------------------
-- Profiles (8 total: 1 admin + 7 members)
-- Note: These are inserted directly for seed purposes.
-- In production, profiles are auto-created by the on_auth_user_created trigger.
-- -----------------------------------------------------------------------
insert into public.profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-000000000001', 'Joe (The Man)',      'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Mike',               'member'),
  ('00000000-0000-0000-0000-000000000003', 'Chris',              'member'),
  ('00000000-0000-0000-0000-000000000004', 'Dave',               'member'),
  ('00000000-0000-0000-0000-000000000005', 'Tony',               'member'),
  ('00000000-0000-0000-0000-000000000006', 'Reggie',             'member'),
  ('00000000-0000-0000-0000-000000000007', 'Pat',                'member'),
  ('00000000-0000-0000-0000-000000000008', 'Brandon',            'member');

-- -----------------------------------------------------------------------
-- Invites (10 total: 7 used, 2 pending, 1 expired)
-- -----------------------------------------------------------------------
insert into public.invites (id, token, email, created_by, used_by, used_at, expires_at) values
  -- Used invites (one per member)
  ('10000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'mike@example.com',    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', now() - interval '30 days', null),
  ('10000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000001', 'chris@example.com',   '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', now() - interval '25 days', null),
  ('10000000-0000-0000-0000-000000000003', 'a3000000-0000-0000-0000-000000000001', 'dave@example.com',    '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', now() - interval '20 days', null),
  ('10000000-0000-0000-0000-000000000004', 'a4000000-0000-0000-0000-000000000001', null,                  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', now() - interval '15 days', null),
  ('10000000-0000-0000-0000-000000000005', 'a5000000-0000-0000-0000-000000000001', null,                  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000006', now() - interval '10 days', null),
  ('10000000-0000-0000-0000-000000000006', 'a6000000-0000-0000-0000-000000000001', null,                  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', now() - interval '5 days',  null),
  ('10000000-0000-0000-0000-000000000007', 'a7000000-0000-0000-0000-000000000001', null,                  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000008', now() - interval '2 days',  null),
  -- Pending unused invites
  ('10000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000001', 'newguy@example.com',  '00000000-0000-0000-0000-000000000001', null, null, null),
  ('10000000-0000-0000-0000-000000000009', 'b2000000-0000-0000-0000-000000000001', null,                  '00000000-0000-0000-0000-000000000001', null, null, null),
  -- Expired invite (edge case: used_by is null but expired)
  ('10000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000001', 'expired@example.com', '00000000-0000-0000-0000-000000000001', null, null, now() - interval '1 day');

-- -----------------------------------------------------------------------
-- Shop Days (6 total)
-- -----------------------------------------------------------------------
insert into public.shop_days (id, date, slot_count, status, notes, created_by) values
  -- Upcoming open days
  ('20000000-0000-0000-0000-000000000001', current_date + 3,  5, 'open',      null,                   '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', current_date + 7,  3, 'open',      'bring cash',           '00000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000003', current_date + 14, 4, 'open',      null,                   '00000000-0000-0000-0000-000000000001'),
  -- Full day (edge case: slot_count = 3, will have 3 confirmed bookings)
  ('20000000-0000-0000-0000-000000000004', current_date + 5,  3, 'open',      'gonna be packed',      '00000000-0000-0000-0000-000000000001'),
  -- Cancelled day with existing bookings (edge case)
  ('20000000-0000-0000-0000-000000000005', current_date + 10, 4, 'cancelled', 'Joe is sick, sorry',   '00000000-0000-0000-0000-000000000001'),
  -- Past day
  ('20000000-0000-0000-0000-000000000006', current_date - 7,  4, 'open',      null,                   '00000000-0000-0000-0000-000000000001');

-- -----------------------------------------------------------------------
-- Bookings (12 total)
-- -----------------------------------------------------------------------
insert into public.bookings (shop_day_id, member_id, status) values
  -- Upcoming day +3: Mike and Chris booked (3 slots remaining)
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'confirmed'),
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'confirmed'),

  -- Upcoming day +7: Dave booked, Tony has a CANCELLED booking (edge case: re-book path)
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'confirmed'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'cancelled'),

  -- Full day +5: 3 confirmed (fills all 3 slots — edge case)
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'confirmed'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'confirmed'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', 'confirmed'),

  -- Cancelled day +10: bookings remain (edge case: admin can see bookers even after cancellation)
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'confirmed'),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'confirmed'),

  -- Past day -7: mix of statuses
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'confirmed'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000005', 'confirmed'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', 'cancelled');

-- -----------------------------------------------------------------------
-- Day Requests (5 total)
-- -----------------------------------------------------------------------
insert into public.day_requests (requested_by, requested_date, status, notes, responded_by, responded_at) values
  -- Pending
  ('00000000-0000-0000-0000-000000000002', current_date + 21, 'pending',  'Saturdays work best for me', null, null),
  ('00000000-0000-0000-0000-000000000005', current_date + 28, 'pending',  null,                          null, null),
  -- Approved (date matches an existing open shop day for the relationship edge case)
  ('00000000-0000-0000-0000-000000000003', current_date + 3,  'approved', 'Can we do next weekend?',     '00000000-0000-0000-0000-000000000001', now() - interval '2 days'),
  -- Declined
  ('00000000-0000-0000-0000-000000000004', current_date + 1,  'declined', 'Tomorrow?',                   '00000000-0000-0000-0000-000000000001', now() - interval '1 day'),
  -- Different member, same date as another pending request (not a duplicate per DB constraint since different member)
  ('00000000-0000-0000-0000-000000000006', current_date + 21, 'pending',  'I also want that Saturday!',  null, null);
