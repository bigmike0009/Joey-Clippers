---
description: Run the full Supabase migration workflow: write the SQL, apply it, and regenerate TypeScript types. Use when adding columns, creating tables, changing RLS policies, or any schema change.
---

# Supabase Migrations

Apply a schema change: $ARGUMENTS

## Step 1: Introspect Current Schema

Use the supabase MCP tool to:
- List existing tables and columns
- Check existing RLS policies on affected tables
- Confirm the next migration number (look at `supabase/migrations/` for the highest number)

## Step 2: Write the Migration

Create `supabase/migrations/<NNN>_<slug>.sql` where `<NNN>` is the next sequential number.

Requirements:
- Migration must be idempotent where possible (`IF NOT EXISTS`, `IF EXISTS`)
- Never modify existing migration files — append only
- Include RLS policies for any new tables
- Add indexes for any foreign keys or frequently-queried columns

```sql
-- Example structure
alter table public.my_table
  add column if not exists new_col text;

-- RLS (if new table)
alter table public.my_table enable row level security;

create policy "Users can read their own rows"
  on public.my_table for select
  using (auth.uid() = user_id);
```

## Step 3: Apply the Migration

```bash
# Against local Supabase:
supabase db push

# Or against remote:
supabase db push --linked
```

If the migration fails, read the error, fix the SQL, and retry. Never skip a failed migration.

## Step 4: Regenerate TypeScript Types

```bash
# Local:
supabase gen types typescript --local > src/lib/supabase/database.types.ts

# Remote:
supabase gen types typescript --project-id <PROJECT_ID> > src/lib/supabase/database.types.ts
```

## Step 5: Verify

- [ ] Types file updated and compiles (`npm run typecheck`)
- [ ] New columns / tables appear in the types
- [ ] RLS policies are correct — test under a non-admin user
- [ ] No existing queries are broken by the schema change

## Rules

- Migrations are append-only. Never edit an existing migration file.
- Always write RLS policies for new tables before writing application code against them.
- If rollback is needed, write a new down migration — do not delete the up migration.
