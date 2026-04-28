# Joe's Clippers — Integrations

## Supabase

**Purpose:** Postgres database, user authentication (email/password), Row Level Security enforcement, and SECURITY DEFINER RPCs for booking/invite logic.

**Config location:**
- Project URL and anon key: `.env` (gitignored)
- Variable names (no values): `.env.example`
- Variables accessed in code: `process.env.EXPO_PUBLIC_SUPABASE_URL`, `process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Supabase client singleton: `src/lib/supabase.ts`
- MCP server config: `.mcp.json` (project ref: `wdyseexaijxwmqukjbde`)

**Setup:**
1. Create a Supabase project at supabase.com
2. Copy Project URL and anon key from Project Settings → API
3. Add to `.env`
4. Run `npm run db:seed` to apply migrations and seed data

## Expo Push Notifications (Post-MVP)

**Purpose:** Notify members when Joe opens a new shop day, cancels a day, or responds to a day request.

**Status:** `push_token` column exists on `profiles` but is inert in MVP. No notification code in Phase 1.

**Config location (future):** Will require `EXPO_ACCESS_TOKEN` in `.env` and EAS project ID in `eas.json`.

## EAS (Expo Application Services)

**Purpose:** Build and distribute the iOS app to TestFlight and the App Store.

**Config location:** `eas.json` (checked in, no secrets). Bundle identifier: `com.bigmike0009.joeysclippers`.
