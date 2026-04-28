# Joe's Clippers — Claude Instructions

## How to Start the Pipeline

Open Claude Code in this project and say:

> "Follow PIPELINE.md to build the app from IDEA.md"

Claude will read both files, create a task list for each phase, and work through them in order — generating the PRD, features, scaffold, and one feature PR at a time. See `PIPELINE.md` for full phase details and how to resume if interrupted.

---

## Project Overview

Joe's Clippers is a private, invite-only booking app for Joe's basement barber shop. Joe (the single admin) publishes open shop days with a slot count; his friends (members) book slots, cancel bookings, and request new days. Built for iOS-first with ~20–30 members.

Stack: React Native · Expo (SDK 51+, Expo Router v3) · TypeScript · Supabase (Postgres 15 + Auth + RLS) · TanStack Query v5 · React Native Paper v5

## Repository Layout

```
src/
  app/                    # Expo Router file-based routes
    (auth)/               # Unauthenticated screens (login, register, invite)
    (tabs)/               # Tab navigator for authenticated users
      index.tsx           # Home — upcoming open shop days
      bookings.tsx        # My Bookings (member) / day detail (admin)
      requests.tsx        # Day requests (member submit / admin respond)
      members.tsx         # Member directory + invite management (admin)
      profile.tsx         # User profile + sign out
  components/             # Shared UI components
  services/               # Supabase query functions (no DB calls in components)
  hooks/                  # React Query hooks wrapping services
  theme/                  # Design tokens
    colors.ts
    typography.ts
    spacing.ts
    radius.ts
    index.ts
  lib/
    supabase.ts           # Supabase client singleton
  types/
    database.types.ts     # Generated Supabase types (do not edit manually)
    index.ts              # App-level types and enums
supabase/
  migrations/             # Ordered SQL migration files
  seed.sql                # Deterministic seed data
docs/
  PRD.md                  # Product requirements — read before designing features
  FEATURES.md             # Ordered feature list — read before implementing
  DATA_ARCHITECTURE.md    # Schema decisions and RLS plan
  INTEGRATIONS.md         # External services and config locations
  MOCK_DATA.md            # Seed data volumes, scenarios, and reseed instructions
```

## Core Conventions

### TypeScript
- Strict mode (`"strict": true` in tsconfig). No `any` — use `unknown` for parameters of uncertain shape.
- All Supabase table types come from `src/types/database.types.ts` (generated). Never hand-write DB types.
- App-level enums and domain types live in `src/types/index.ts`.

### Data Layer
- Never call `supabase` directly from a component or screen. All DB access goes through `src/services/`.
- Each service module corresponds to one table or RPC group (e.g., `services/shopDays.ts`, `services/bookings.ts`).
- Service functions return typed Supabase responses. They do not throw — they return `{ data, error }`.
- React Query hooks in `src/hooks/` wrap service functions. Components only import hooks, never services directly.
- Slot booking and cancellation always go through the `book_slot` and `cancel_booking` RPCs — never direct INSERT/UPDATE on `bookings`.

### UI
- All colors from `src/theme/colors.ts` — no inline hex values anywhere else in the codebase.
- All spacing from `src/theme/spacing.ts` — no magic numbers. Use `spacing[4]` not `16`.
- All font sizes and weights from `src/theme/typography.ts`.
- Border radius from `src/theme/radius.ts`.
- Use React Native Paper components as the base (Button, Card, List, FAB, Badge, etc.). Wrap in project components only when customization is needed.
- Every screen must handle four states: loading, error, empty, and happy path. No screen ships without all four.
- Admin-only UI elements are gated by checking `profile.role === 'admin'` from the auth context — never hard-coded.

### State Management
- Server state: TanStack Query v5 (`useQuery`, `useMutation`). Query keys are defined as constants in `src/hooks/queryKeys.ts`.
- Local UI state: `useState` only. No Zustand, Redux, or Context for data that comes from the server.
- Auth state: Supabase `onAuthStateChange` listener wrapped in an `AuthContext` provider at the root.
- Optimistic updates are acceptable for booking/cancellation mutations — roll back on error.

### Error Handling
- Supabase RPC exceptions use machine-readable string codes (e.g., `'no_slots_available'`, `'already_booked'`). Map these to user-friendly messages in a `getBookingErrorMessage(code: string): string` utility in `src/lib/errors.ts`.
- Network errors display a generic "Something went wrong" message with a Retry button.
- Form validation errors display inline beneath the relevant field.
- Never swallow errors silently. All `useMutation` `onError` callbacks must surface feedback to the user.

### Security
- No Supabase service key in the client app — never. Only the anon key goes in `.env`.
- All privileged operations (invite generation, booking enforcement, cancellation) go through `SECURITY DEFINER` RPCs. The client never bypasses RLS.
- Invite tokens are UUIDs — sufficiently unguessable for this use case. Do not log tokens.
- `.env` is gitignored. `.env.example` lists all required variable names with no values.

## MCP Tools Available

| Server | Use for |
|--------|---------|
| **github** | Read/search repo files, list issues and PRs, check CI runs |
| **supabase** | Introspect live schema, list tables/columns, run read-only SQL, inspect RLS policies |
| **context7** | Fetch up-to-date library docs — always resolve library ID first, then fetch docs |
| **aws-docs** | Look up AWS service docs |

## Custom Commands Available

**Planning & Design**
| Command | When to use |
|---------|-------------|
| `/plan` | Before any non-trivial feature — align on approach first |
| `/ultrathink` | Hard architectural decisions, subtle bugs, conflicting requirements |
| `/grill-me` | Requirements feel fuzzy — resolve before writing code |
| `/app-design` | Set up design system (once, at scaffold), review screen for consistency, or generate layout options |

**Implementation**
| Command | When to use |
|---------|-------------|
| `/new-screen` | Adding a new route or screen |
| `/tdd` | When correctness matters — write tests before implementation |
| `/supabase-migrations` | Any schema change — column, table, RLS policy |

**Quality & Review**
| Command | When to use |
|---------|-------------|
| `/ship` | Feature complete — run full pre-ship checklist |
| `/code-review` | Before committing or opening a PR |
| `/qa` | Feature done — structured test plan before merge |
| `/systematic-debugging` | Bug with unclear root cause |
| `/triage-issue` | Bug report → investigate → fix |
| `/supabase-rls-audit` | 42501 errors, new tables, or security review |
| `/rn-performance` | Jank, slow screens, excessive re-renders |

**Release**
| Command | When to use |
|---------|-------------|
| `/expo-deployment` | Build and submit via EAS |
| `/app-store-connect` | TestFlight distribution, metadata uploads, review submission via CLI |
| `/app-store-preflight` | Before every TestFlight or App Store submission |
| `/aso-optimization` | App Store metadata and keyword optimization |

**Utilities**
| Command | When to use |
|---------|-------------|
| `/auto-commit` | Generate conventional commit message from staged diff |
| `/skill-creator` | Create or refine a custom command |

> Find community commands: [skillsmp.com](https://skillsmp.com) · [github.com/mattpocock/skills](https://github.com/mattpocock/skills)
> Install community commands: `npx skills@latest add <repo>/<skill-name>`

## What NOT to Do

- Do not create helper utilities for one-time use. Inline it.
- Do not add comments to code you didn't write in this session.
- Do not refactor working code while fixing an unrelated bug.
- Do not leave TODO comments or stub implementations.
- Do not suggest migrating to a different library or framework.
- Do not add payments, tipping, or any monetization features — explicitly out of scope for MVP.
- Do not build a public-facing landing page or any unauthenticated browsable content.
- Do not add recurring/auto-scheduled shop days — Joe opens each day manually, always.
- Do not add multi-barber support — Joe is the only barber; the schema has no `barber_id`.
- Do not add time-slot granularity within a day — slot count is the only limit.
- Do not add push notification code in MVP — the `push_token` column exists but is inert until Phase 2.
- Do not hard-code hex colors, magic number spacing, or magic number font sizes anywhere outside `src/theme/`.
- Do not call Supabase directly from a component — use hooks that wrap service functions.
- Do not use the Supabase service key on the client — anon key only.
