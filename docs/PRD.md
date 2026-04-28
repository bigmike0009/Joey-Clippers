# Joe's Clippers PRD

## Problem

Joe cuts hair in his basement for a close circle of friends. Coordinating available days and slots happens entirely over text message: Joe announces a day, friends reply to claim spots, and someone always gets left out or double-counted. There is no single source of truth for who is booked, no way for friends to see what days are open without DMing Joe, and no structured way to request a day that works for them. The chaos scales with group size and gets worse the longer the group goes without a real system.

## Target Users

**Joe (admin / barber):** Single owner-operator. Needs full control over the schedule — opening days, setting slot counts, approving or declining day-requests, and cancelling days when something comes up. There is exactly one Joe account in the system.

**Members (friends):** ~20–30 people, all existing friends of Joe. Added by invite only. They need a simple way to see what days are open, book a slot, and request new days. They are not power users — UX must be dead simple.

## Goals

1. Give Joe a frictionless way to publish open shop days and manage bookings without back-and-forth texts.
2. Give members a single place to see availability, book instantly, and request new days.
3. Enforce slot limits at the database level so double-booking is impossible regardless of client behavior.
4. Keep the group closed — no strangers can discover or join the app.

## Non-Goals

- No payment or tipping integration in MVP.
- No public-facing landing page or SEO — this is a closed, friends-only tool.
- No recurring / auto-scheduled shop days — Joe opens each day manually, always.
- No multi-barber support — Joe is the only barber.
- No time-slot granularity within a day — a booking is for the whole day, slot count is the only limit.
- No push notifications in MVP — that is a post-MVP feature once the booking loop is stable.
- No in-app messaging or chat — booking and day-requests are the only communication primitives.
- No Android-first optimization — iOS is the target; Android support is a stretch goal.

## Core Features (MVP Phase 1)

1. **Invite-only auth** — Joe generates invite tokens; friends use them to sign up. No public registration.
2. **Shop day management** — Joe creates a shop day (date + slot count), publishes it, can cancel it.
3. **Booking** — Members see upcoming open days and book one slot. Slot limits enforced in DB.
4. **Booking cancellation** — Members cancel their own slot; Joe can remove any member from a slot.
5. **Day requests** — Members submit a date request; Joe approves or declines with an optional note.
6. **Member directory** — Joe can see all members; members see each other's names on a shop day.

## Post-MVP Features

- Push notifications (Expo Push) when Joe opens a new day, cancels a day, or responds to a request.
- Waitlist: if a slot opens up, notify the next person who requested that day or signed up for waitlist.
- Style / cut notes per booking (what cut the member wants).
- Cut history log per member ("your past cuts").
- Fun leaderboard / stats: most cuts, current streak, etc.
- Custom branding, logo, mascot — deferred to a manual design session after MVP ships to TestFlight.

## Technical Design

### Stack

- **Frontend:** React Native + Expo (SDK 51+), TypeScript strict mode
- **Backend:** Supabase — Postgres 15, Auth (email/password + magic link), Row Level Security
- **State management:** React Query (TanStack Query v5) for server state; `useState` for local UI state only
- **UI library:** React Native Paper v5 (Material Design 3) with a custom theme
- **Navigation:** Expo Router (file-based, v3)
- **Forms:** React Hook Form
- **Build / distribution:** EAS Build + EAS Submit

### Data Model

See `docs/DATA_ARCHITECTURE.md` for the full schema. Summary:

| Table | Purpose |
|-------|---------|
| `profiles` | App user record (extends `auth.users`); holds name, role (`admin`/`member`), push token |
| `invites` | Invite tokens created by Joe; used once to allow a friend to register |
| `shop_days` | A date Joe opens the shop; has `slots_total` and a status (`open`/`cancelled`/`completed`) |
| `bookings` | A member's slot reservation on a shop day; soft-cancelled, never deleted |
| `day_requests` | A member's request for Joe to open on a specific date; Joe approves or declines |

Slot booking is enforced via a `book_slot` PostgreSQL SECURITY DEFINER function with `SELECT … FOR UPDATE` on the shop day row — the only safe concurrent write path.

### Key Screens / Surfaces

**Member app:**
- Home — list of upcoming open shop days with slot availability; "Book" CTA on each
- My Bookings — list of the member's active bookings with cancel option
- Request a Day — date picker + submit; list of own requests with status badges
- Profile — name, avatar placeholder, sign out

**Admin app (Joe):**
- Home — same day list as members, with a "+" FAB to open a new shop day
- Shop Day Detail — see all bookings for a day; remove a member; cancel the day
- Open New Day — date picker + slot count + optional note + publish
- Requests — list of pending day requests with approve / decline actions; badge count on tab
- Members — list of all profiles; "Invite" button generates a token

Both roles share the same app binary. Navigation and available actions are gated by `role` from the `profiles` table.

## Phases

### Phase 1 — MVP

Goal: Joe can open days, members can book, Joe can manage the schedule — all without texting.

Deliverables:
- Invite auth flow (Joe generates token → friend registers via invite link)
- Shop day CRUD (create, view, cancel)
- Booking flow (book a slot, cancel a slot, Joe removes a member)
- Day-request flow (submit → approve/decline)
- Basic member directory
- TestFlight build for Joe's friend group

### Phase 2

Goal: Close the feedback loop with notifications and improve retention with history + fun features.

Deliverables:
- Expo Push Notifications for day opens, cancellations, and request responses
- Waitlist with auto-notify
- Cut notes per booking
- Cut history log per member
- Leaderboard / stats
- Custom branding (post manual design session)

## Acceptance Criteria

1. Joe can create an invite link and share it; a friend can open the link, register, and see upcoming open days — without Joe doing anything else.
2. Joe can open a shop day with a date and slot count; it appears on all members' home screens within one refresh.
3. A member can book a slot; the available slot count decrements immediately.
4. If two members attempt to book the last slot simultaneously, exactly one succeeds and the other receives a "no slots available" error — verified by an RPC test against the DB.
5. A member can cancel their own booking; the slot count increments back.
6. Joe can remove a member from a slot; the booking is marked cancelled, the slot is freed.
7. A member can submit a day request; Joe sees it with a badge count on the Requests tab.
8. Joe can approve or decline a request with an optional note; the member sees the updated status.
9. Joe can cancel an open shop day; the day shows as cancelled for all members.
10. No authenticated user can book more than one slot per shop day.
11. No unauthenticated user can read any booking, profile, or shop day data.
