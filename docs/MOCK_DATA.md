# Joe's Clippers — Mock Data

## Record Volumes

| Table | Count | Notes |
|---|---|---|
| `profiles` | 8 | 1 admin (Joe), 7 members |
| `invites` | 10 | 7 used, 2 pending/unused, 1 expired |
| `shop_days` | 6 | 3 upcoming open, 1 upcoming full, 1 cancelled, 1 past |
| `bookings` | 12 | Mix of confirmed/cancelled across all days |
| `day_requests` | 5 | 2 pending, 1 approved, 1 declined, 1 same-date-different-member |

## Scenarios Covered

### Happy Path
- Upcoming open shop days with available slots (days +3, +7, +14)
- Member with confirmed upcoming booking (Mike on day +3)
- Past day with confirmed bookings (day -7)

### Edge Cases

1. **Full shop day** — Day +5 has `slot_count = 3` and exactly 3 confirmed bookings. Attempting to book a 4th slot should return `no_slots_available`.

2. **Cancelled day with existing bookings** — Day +10 is `status = 'cancelled'` but has 2 confirmed bookings. Admin should still see these bookings in the day detail view.

3. **Cancelled booking eligible for re-book** — Tony (`member_id = 005`) has a `status = 'cancelled'` booking on Day +7 (which still has open slots). The `book_slot` upsert path allows Tony to re-book this day.

4. **Expired invite** — One invite with `expires_at` in the past and `used_by = null`. `get_invite_preview` should return `is_valid = false`.

5. **Approved day request matching existing shop day** — The approved request by Chris (day +3) has a `requested_date` that matches an existing open shop day. UI can show the relationship.

6. **Multiple members requesting the same date** — Mike and Reggie both have pending requests for day +21. Both are valid because the unique constraint is per `(requested_by, requested_date)`.

## Reseed / Reset Instructions

```bash
# Full reset: drops schema, re-applies all migrations, runs seed.sql
npm run db:seed

# Equivalent direct command:
npx supabase db reset
```

> `npm run db:seed` is configured in `package.json` as `npx supabase db reset`.  
> This is **destructive** — all data is wiped. Development only.

## Adding More Seed Data

Edit `supabase/seed.sql`. IDs follow the pattern:
- Profiles: `00000000-0000-0000-0000-00000000000X`
- Invites: `10000000-0000-0000-0000-00000000000X`
- Shop days: `20000000-0000-0000-0000-00000000000X`
- Bookings: auto-generated (no fixed IDs)
- Day requests: auto-generated (no fixed IDs)
