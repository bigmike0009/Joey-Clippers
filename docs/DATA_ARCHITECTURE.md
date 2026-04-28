# Joe's Clippers Data Architecture

## Modeling Assumptions

- **Single-tenant**: exactly one admin account (Joe). The `role = 'admin'` check in `profiles` enforces this at the application layer; seed data sets Joe's profile to admin and all others to member.
- **Invite-only membership**: no public registration. A valid, unused invite token is required before a new user can create a profile.
- **Small scale**: ~20–30 members. Performance is never the primary concern; correctness and auditability are.
- **No time component on shop days**: a shop day occupies a full calendar date. There is one shop day per date maximum (UNIQUE constraint on `shop_days.date`). Time-slot scheduling is out of scope for MVP.
- **Soft deletes everywhere**: no hard deletes on `shop_days`, `bookings`, or `day_requests`. Status columns capture lifecycle state. `cancelled_by` and `cancelled_at` on `bookings` provide an audit trail.
- **Concurrency enforcement is DB-level**: slot limits are enforced inside a `SECURITY DEFINER` PostgreSQL function using `SELECT … FOR UPDATE`. The client can never INSERT directly into `bookings`; RLS blocks it.
- **Post-MVP columns added now**: `profiles.push_token` (nullable) is added at schema creation so push notification support requires no future breaking migration.

---

## Canonical Entities

| Entity | Purpose |
|--------|---------|
| `profiles` | App-level user record extending `auth.users`. Holds display name, role, and push token. |
| `invites` | Invite tokens created by Joe. Controls who can register. Tracks usage for audit. |
| `shop_days` | A day Joe declares the shop is open. Has a slot count and a lifecycle status. |
| `bookings` | A member's reservation of one slot on a shop day. Soft-cancelled, never deleted. |
| `day_requests` | A member's request for Joe to open on a specific date. Joe approves or declines. |

---

## Relational Schema

### Tables and Columns

```sql
-- Trigger function: keep updated_at current on any UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text        NOT NULL,
  role        text        NOT NULL DEFAULT 'member'
                          CHECK (role IN ('admin', 'member')),
  avatar_url  text,
  push_token  text,                          -- Expo push token; null until post-MVP
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Member'),
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- invites
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE invites (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  token          uuid        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  invited_by     uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  invited_email  text,                        -- optional; Joe may or may not know email upfront
  used_by        uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  used_at        timestamptz,
  expires_at     timestamptz,                 -- null = never expires
  created_at     timestamptz NOT NULL DEFAULT now()
);
-- No updated_at: invites are effectively write-once after creation.

-- ─────────────────────────────────────────────────────────────────
-- shop_days
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE shop_days (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  date        date        NOT NULL UNIQUE,    -- one shop day per calendar date
  slots_total integer     NOT NULL CHECK (slots_total > 0),
  status      text        NOT NULL DEFAULT 'open'
                          CHECK (status IN ('open', 'cancelled', 'completed')),
  notes       text,                           -- Joe's optional message to members
  created_by  uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER shop_days_updated_at
  BEFORE UPDATE ON shop_days
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- bookings
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE bookings (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_day_id   uuid        NOT NULL REFERENCES shop_days(id) ON DELETE RESTRICT,
  user_id       uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status        text        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'cancelled')),
  cancelled_by  uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  cancelled_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Partial unique: one *active* booking per user per shop day.
-- A cancelled booking does not block a re-booking (two rows allowed
-- if one is cancelled).
CREATE UNIQUE INDEX bookings_one_active_per_user_per_day
  ON bookings(shop_day_id, user_id)
  WHERE status = 'active';

-- ─────────────────────────────────────────────────────────────────
-- day_requests
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE day_requests (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_date  date        NOT NULL,
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'approved', 'declined')),
  response_note   text,
  responded_by    uuid        REFERENCES profiles(id) ON DELETE SET NULL,
  responded_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER day_requests_updated_at
  BEFORE UPDATE ON day_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

### Keys and Constraints

| Table | PK | FKs | UNIQUE | CHECK |
|-------|----|-----|--------|-------|
| `profiles` | `id` (= `auth.users.id`) | `auth.users(id)` CASCADE | — | `role IN ('admin','member')` |
| `invites` | `id` | `profiles(invited_by)` RESTRICT, `profiles(used_by)` SET NULL | `token` | — |
| `shop_days` | `id` | `profiles(created_by)` RESTRICT | `date` | `slots_total > 0`, status enum |
| `bookings` | `id` | `shop_days(id)` RESTRICT, `profiles(user_id)` RESTRICT, `profiles(cancelled_by)` SET NULL | partial: `(shop_day_id, user_id) WHERE status='active'` | status enum |
| `day_requests` | `id` | `profiles(user_id)` CASCADE, `profiles(responded_by)` SET NULL | — | status enum |

ON DELETE choices:
- `RESTRICT` on `bookings` and `shop_days` foreign keys: preserve history, prevent accidental cascade deletes.
- `CASCADE` on `profiles → auth.users`: if a user is deleted from auth, their profile goes too.
- `CASCADE` on `day_requests → profiles`: day requests belong to the user; if user is removed, requests go too.
- `SET NULL` on audit columns (`cancelled_by`, `responded_by`, `used_by`): audit record survives even if the acting user is later removed.

### Relationships and Cardinality

```
auth.users ──1──── profiles ──1──┐
                                 │
                   profiles ─────┤ invited_by, used_by
                                 │
invites ──────────────────────── ┘

profiles ─1────N─ shop_days (created_by)
profiles ─1────N─ bookings (user_id)
profiles ─1────N─ day_requests (user_id)

shop_days ─1────N─ bookings (shop_day_id)
```

---

## Access Patterns and Indexing Strategy

| Query | Index |
|-------|-------|
| Upcoming open shop days (member home screen) `WHERE status='open' AND date >= today ORDER BY date` | `CREATE INDEX idx_shop_days_open_date ON shop_days(date) WHERE status = 'open'` |
| Active booking count for slot check inside `book_slot` function `WHERE shop_day_id = $id AND status = 'active'` | `CREATE INDEX idx_bookings_shopday_status ON bookings(shop_day_id, status)` |
| Member's own bookings `WHERE user_id = $uid AND status = 'active'` | `CREATE INDEX idx_bookings_user_status ON bookings(user_id, status)` |
| Pending day requests count (Joe's badge) `WHERE status = 'pending'` | `CREATE INDEX idx_day_requests_pending ON day_requests(status) WHERE status = 'pending'` |
| Member's own requests `WHERE user_id = $uid ORDER BY created_at DESC` | `CREATE INDEX idx_day_requests_user ON day_requests(user_id, created_at DESC)` |
| Invite token lookup `WHERE token = $token` | Covered by `UNIQUE` constraint on `invites(token)` |
| Profile lookup by id | Covered by PK |

---

## Multi-Tenant and Authorization Model

**Single-tenant.** There is exactly one admin in the system. The `is_admin()` helper is the gating primitive for all privileged operations.

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;
```

`SECURITY DEFINER` + `STABLE` means Postgres can cache the result within a query and it bypasses RLS on `profiles` (preventing infinite recursion in profile RLS policies).

**Role assignment:** Joe's profile is seeded with `role = 'admin'`. The `handle_new_user` trigger always sets new profiles to `role = 'member'`. There is no in-app flow to promote a member to admin in MVP — Joe's role is set once in seed data.

---

## Data Lifecycle

### Creation and Ownership

| Entity | Who creates | How |
|--------|-------------|-----|
| `profiles` | System | `handle_new_user` trigger fires on `auth.users` INSERT |
| `invites` | Joe (admin) | Direct INSERT via app; RLS enforces `is_admin()` |
| `shop_days` | Joe (admin) | Direct INSERT via app; RLS enforces `is_admin()` |
| `bookings` | Member (or admin) | Only via `book_slot` RPC; direct INSERT blocked by RLS |
| `day_requests` | Member | Direct INSERT; RLS enforces `user_id = auth.uid()` |

### Updates and Concurrency

**Slot booking concurrency** is the only race condition in the system. Resolution:

```sql
CREATE OR REPLACE FUNCTION book_slot(p_shop_day_id uuid, p_user_id uuid)
RETURNS bookings LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_day   shop_days;
  v_count integer;
  v_row   bookings;
BEGIN
  -- Exclusive row lock serializes all concurrent booking attempts for this day
  SELECT * INTO v_day FROM shop_days WHERE id = p_shop_day_id FOR UPDATE;

  IF NOT FOUND            THEN RAISE EXCEPTION 'shop_day_not_found'; END IF;
  IF v_day.status != 'open' THEN RAISE EXCEPTION 'shop_day_not_open'; END IF;

  SELECT COUNT(*) INTO v_count
  FROM bookings
  WHERE shop_day_id = p_shop_day_id AND status = 'active';

  IF v_count >= v_day.slots_total THEN RAISE EXCEPTION 'no_slots_available'; END IF;

  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE shop_day_id = p_shop_day_id AND user_id = p_user_id AND status = 'active'
  ) THEN RAISE EXCEPTION 'already_booked'; END IF;

  INSERT INTO bookings (shop_day_id, user_id)
  VALUES (p_shop_day_id, p_user_id)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
```

Exception strings are machine-readable; the app pattern-matches on them to show user-friendly messages.

**Cancellation** (member cancels own booking, or Joe removes a member):

```sql
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id uuid, p_cancelled_by uuid)
RETURNS bookings LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_row bookings;
BEGIN
  SELECT * INTO v_row FROM bookings WHERE id = p_booking_id FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'booking_not_found'; END IF;
  IF v_row.status != 'active' THEN RAISE EXCEPTION 'booking_not_active'; END IF;

  -- Caller must be the booking owner or an admin
  IF v_row.user_id != p_cancelled_by AND NOT is_admin() THEN
    RAISE EXCEPTION 'unauthorized';
  END IF;

  UPDATE bookings
  SET status       = 'cancelled',
      cancelled_by = p_cancelled_by,
      cancelled_at = now()
  WHERE id = p_booking_id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;
```

**Invite validation** (called before/during signup by unauthenticated users):

```sql
CREATE OR REPLACE FUNCTION validate_invite_token(p_token uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM invites
    WHERE token = p_token
      AND used_at IS NULL
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

CREATE OR REPLACE FUNCTION use_invite_token(p_token uuid, p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE invites
  SET used_by = p_user_id, used_at = now()
  WHERE token  = p_token
    AND used_at IS NULL;

  IF NOT FOUND THEN RAISE EXCEPTION 'invite_already_used_or_invalid'; END IF;
END;
$$;
```

### Soft Delete / Archival / Retention

No hard deletes on business entities. Lifecycle is managed via status transitions:

| Entity | Terminal states | Notes |
|--------|----------------|-------|
| `shop_days` | `cancelled`, `completed` | No DELETE. `completed` set manually by Joe or auto-set post-MVP. |
| `bookings` | `cancelled` | `cancelled_by` + `cancelled_at` always populated on cancel. |
| `day_requests` | `approved`, `declined` | `responded_by` + `responded_at` always populated on response. |
| `invites` | `used_at IS NOT NULL` | Functional soft-delete: used invites still exist for audit. |
| `profiles` | Cascades from `auth.users` DELETE | Only deleted if Joe removes from Supabase Auth dashboard. |

---

## RLS Policy Plan

All tables have `ALTER TABLE … ENABLE ROW LEVEL SECURITY`.

### profiles
```sql
-- All authenticated users can read all profiles (needed for name display in booking lists)
CREATE POLICY profiles_select ON profiles
  FOR SELECT TO authenticated USING (true);

-- New user inserts own row (trigger does this, but policy must allow it)
CREATE POLICY profiles_insert ON profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- User updates own profile; admin updates any
CREATE POLICY profiles_update ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());
```

### invites
```sql
-- Only admin reads invites
CREATE POLICY invites_select ON invites
  FOR SELECT TO authenticated USING (is_admin());

-- Only admin creates invites
CREATE POLICY invites_insert ON invites
  FOR INSERT TO authenticated WITH CHECK (is_admin());

-- Mutations (marking used) go through SECURITY DEFINER functions only; direct UPDATE blocked
CREATE POLICY invites_update ON invites
  FOR UPDATE TO authenticated USING (is_admin());

CREATE POLICY invites_delete ON invites
  FOR DELETE TO authenticated USING (is_admin());
```

### shop_days
```sql
CREATE POLICY shop_days_select ON shop_days
  FOR SELECT TO authenticated USING (true);

CREATE POLICY shop_days_insert ON shop_days
  FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY shop_days_update ON shop_days
  FOR UPDATE TO authenticated USING (is_admin());
-- No DELETE policy; hard deletes are never performed.
```

### bookings
```sql
-- Member sees own bookings; admin sees all
CREATE POLICY bookings_select ON bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Direct INSERT is blocked (no INSERT policy). book_slot is SECURITY DEFINER.

-- Member can cancel own active booking; admin can update any booking
CREATE POLICY bookings_update_own ON bookings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'active')
  WITH CHECK (status = 'cancelled');

CREATE POLICY bookings_update_admin ON bookings
  FOR UPDATE TO authenticated
  USING (is_admin());
-- No DELETE policy.
```

### day_requests
```sql
-- Member sees own requests; admin sees all
CREATE POLICY day_requests_select ON day_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

-- Member submits own requests
CREATE POLICY day_requests_insert ON day_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only admin can approve/decline
CREATE POLICY day_requests_update ON day_requests
  FOR UPDATE TO authenticated
  USING (is_admin());

-- Member can delete own pending request; admin can delete any
CREATE POLICY day_requests_delete ON day_requests
  FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR is_admin()
  );
```

---

## Migration Plan

| File | Contents |
|------|---------|
| `supabase/migrations/0001_create_profiles.sql` | `set_updated_at` function, `profiles` table, `profiles_updated_at` trigger, `handle_new_user` function, `on_auth_user_created` trigger |
| `supabase/migrations/0002_create_invites.sql` | `invites` table |
| `supabase/migrations/0003_create_shop_days.sql` | `shop_days` table, `shop_days_updated_at` trigger |
| `supabase/migrations/0004_create_bookings.sql` | `bookings` table, `bookings_updated_at` trigger, partial unique index |
| `supabase/migrations/0005_create_day_requests.sql` | `day_requests` table, `day_requests_updated_at` trigger |
| `supabase/migrations/0006_enable_rls.sql` | `ALTER TABLE … ENABLE ROW LEVEL SECURITY` + all policies for all 5 tables + `is_admin()` helper |
| `supabase/migrations/0007_create_functions.sql` | `book_slot`, `cancel_booking`, `validate_invite_token`, `use_invite_token` |
| `supabase/migrations/0008_create_indexes.sql` | All 5 performance indexes |

---

## Mock Data Plan

### Seed Strategy

`supabase/seed.sql` is deterministic and re-runnable (uses `ON CONFLICT DO NOTHING` or explicit UUIDs). A `npm run db:seed` script calls `supabase db reset --linked` followed by applying the seed. Seeding a local dev instance uses `supabase db reset`.

### Required Dataset Shape

**Profiles (6 rows):**
| Name | Role | Notes |
|------|------|-------|
| Joe Barber | admin | The owner; seed sets `role = 'admin'` explicitly |
| Alex Member | member | Has 2 active bookings |
| Brandon Member | member | Has 1 active booking, 1 cancelled booking |
| Chris Member | member | Has 0 bookings (empty state test) |
| David Member | member | Has 1 active booking on the fully-booked day |
| Eddie Member | member | Has a pending day request |

**Shop Days (5 rows):**
| Date | slots_total | status | Active bookings | Notes |
|------|------------|--------|-----------------|-------|
| +7 days from seed | 3 | open | 2 (Alex, Brandon) | 1 slot remaining |
| +14 days from seed | 2 | open | 0 | Fully empty — tests empty state |
| +21 days from seed | 1 | open | 1 (David) | **Fully booked** — edge case #1 |
| -7 days from seed | 2 | completed | 2 active (Alex, Brandon) | Past completed day |
| -14 days from seed | 2 | cancelled | 2 cancelled (Alex, David) | **Cancelled day** — edge case #2 |

**Bookings (7 rows):**
- 2 active on shop day +7 (Alex, Brandon)
- 1 active on shop day +21 (David) — fills the only slot
- 2 active on past completed shop day (Alex, Brandon)
- 2 cancelled on cancelled shop day (Alex, David) — `cancelled_by = Joe's id`
- 1 additional cancelled booking from Brandon on shop day +7 (cancelled, then rebooking scenario tracked)

**Day Requests (3 rows):**
| User | requested_date | status | Notes |
|------|---------------|--------|-------|
| Eddie | +28 days | pending | Joe has not responded |
| Brandon | +21 days | approved | Same date as the fully-booked open shop day — edge case #4 |
| Chris | +35 days | declined | Joe declined with a note |

**Invites (2 rows):**
- Unused invite created by Joe (for testing invite flow)
- Used invite (used_by = Alex, used_at populated)

### Edge-Case Records

1. **Fully booked day** (`shop_days` with `slots_total = 1`, one active booking from David). Any further `book_slot` RPC for this day must raise `no_slots_available`. The `bookings_one_active_per_user_per_day` partial index and the slot count check inside `book_slot` both enforce this.

2. **Cancelled shop day with cascaded booking cancellations** (`shop_days.status = 'cancelled'`, two `bookings.status = 'cancelled'`). Verifies: (a) day does not appear in "upcoming open days" query, (b) cancelled bookings have `cancelled_by = Joe's id` and non-null `cancelled_at`, (c) slot count queries on this day return 0 active bookings without corrupting counts on other days.

3. **Member with zero bookings** (Chris). Tests empty state rendering in member booking history and ensures leaderboard aggregation handles `COUNT = 0` without null errors.

4. **Day request for a date that already has an open shop day** (Brandon requested +21 days; an open shop day exists for that date). The DB has no constraint blocking this. Joe's request list should surface the overlap so he notices it's redundant — but the data layer allows it.

5. **Cancelled booking on a still-open shop day** (Brandon's cancelled booking on shop day +7, which still has 1 slot available). Verifies the slot count is 2 active (not 3), and the available-slot count displays correctly after a cancellation.
