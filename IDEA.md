# App Idea

<!--
Fill out each section below before running build-app.ps1.
The more specific you are, the better the generated PRD and features will be.
Delete any section that doesn't apply to your idea.
-->

## What is the app?

<!-- One or two sentences. What does it do and for whom? -->
A private booking app for Joe's basement barber shop. Joe declares which days he's open and how many slots are available; his friends (members) can sign up for those slots or request new days.


## Problem it solves

<!-- What pain or gap does this address? Why does it need to exist? -->
Joe cuts hair on the side out of his basement with no fixed schedule. Right now, coordinating available days and slots happens over text, which is chaotic. The app gives Joe control over his schedule and gives friends a simple way to book or request cuts without back-and-forth messaging.


## Target users

<!-- Who will use this? How many? Any access restrictions (private, invite-only, etc.)? -->
Two roles: **Joe** (the barber / single owner-admin) and **members** (his friends). Membership is private and invite-only — no public sign-up. Likely under 20–30 members total.


## Must-have features (MVP)

<!-- List the things that make the app worth building. Be specific.
     These drive the FEATURES.md decomposition. -->

- Joe can open a "shop day": pick a date, set a number of available slots, and publish it to members.
- Members can view upcoming open days and book one of the available slots.
- Members can submit a day-request ("Hey Joe, can you open on X date?"); Joe can approve or decline each request.
- Joe can close/cancel a shop day and members are notified.
- Simple auth: Joe has an admin account; members are added by invite only (no public registration).
- Basic booking management: members can cancel their own slot; Joe can remove a member from a slot.

## Nice-to-have / post-MVP

<!-- Things you'd like eventually but don't need for the first version. -->

- Push notifications when Joe opens a new day or responds to a request.
- Waitlist: if a slot opens up, auto-notify the next person in line.
- Style / cut notes per booking (what cut the member wants).
- A running history of past cuts per member ("Joe's cut log").
- Fun leaderboard or stats (who has gotten the most cuts, longest streak, etc.).

## Explicit non-goals

<!-- Things Copilot should NOT build or design, to prevent scope creep. -->

- No payments or tipping integration (at least in MVP).
- No public-facing landing page or SEO — this is a closed, friends-only tool.
- No recurring / auto-scheduled shop days (Joe opens each day manually).
- No multi-barber support — Joe is the only barber.

## Constraints

<!-- Technical or product hard rules.
     e.g. "must work offline", "iOS only", "no external auth providers",
     "single-tenant — one owner account only" -->

- Single-tenant: one owner (Joe) account only.
- Members are added by invite only — no self-registration.
- iOS-first (Joe and friends are on iPhone); Android is a stretch goal.
- Location is always the same (our basement) — no address/map features needed.

## Integrations / APIs

<!-- External services the app will depend on.
     e.g. Supabase, Stripe, Google Maps, Twilio, a specific sports data API -->

- Supabase (Postgres + auth + RLS)
- Expo Push Notifications (post-MVP)
- No payment processor in MVP

## Branding notes

<!-- Name, tone, colour direction, any assets that will be created manually later.
     If custom artwork is a post-step, say so here so Copilot scaffolds
     placeholder assets instead of inventing them. -->

Working name: **Joe's Barber Shop** (or a fun nickname TBD).
Tone: casual, funny, inside-joke-friendly — this is for a tight friend group, not a professional business.
Custom graphics (logo, icons, mascot, meme-style assets tied to our inside jokes) will be created **manually later** — scaffold placeholder assets in the meantime, do NOT generate generic stock-style artwork.

> **TODO (manual):** Set aside a dedicated design session to nail down the theme, color palette, inside jokes, and custom graphics before going to TestFlight.


## Anything else Claude should know

<!-- Edge cases, special flows, known tricky parts, reference apps to draw inspiration from. -->

- The "barber shop" is literally our basement — keep the UX dead simple. Members just need to see what days are open and tap to book.
- Joe is not always available; he controls the schedule 100%. There are NO standing weekly appointments.
- Day-request flow: member submits a date → Joe sees a pending request badge → Joe taps approve or decline → member is notified of the outcome.
- If Joe cancels an open day after people have already booked, all bookers should be notified.
- Concurrency edge case: two members tapping "Book" on the last slot at the same time — the backend must enforce slot limits (Supabase RLS / DB constraint, not just frontend validation).
- **Branding/theme work is intentionally deferred** and will require a manual design session. Do not block MVP build on graphics.

