---
description: Security audit for Supabase Row Level Security policies. Use when getting 42501 permission denied errors, after adding a new table, after a security review, or any time RLS policy correctness is in question.
---

# Supabase RLS Audit

Audit RLS policies for: $ARGUMENTS (or all tables if not specified)

## Step 1: Inventory

Use the supabase MCP to list:
- All tables and whether RLS is enabled
- All existing policies per table (name, command, using/check expressions)

Flag any table with RLS disabled that contains user data.

## Step 2: Audit Each Policy

For each policy, verify:

**Completeness**
- [ ] SELECT policy: user can only read their own rows OR rows they have explicit access to
- [ ] INSERT policy: user can only insert rows they own (check `auth.uid() = user_id`)
- [ ] UPDATE policy: user can only update their own rows
- [ ] DELETE policy: user can only delete their own rows
- [ ] No policy gaps — every operation (SELECT/INSERT/UPDATE/DELETE) is covered or intentionally blocked

**Correctness**
- [ ] `auth.uid()` used for user identity (not a hardcoded value or service role bypass)
- [ ] Joins to other tables in the policy don't inadvertently expose rows
- [ ] `USING` clause (read gate) is separate from `WITH CHECK` clause (write gate) where needed

**Least Privilege**
- [ ] Users cannot read each other's private data through any policy
- [ ] Admin operations use the service role (server-side only), not a permissive client policy
- [ ] No policy grants broader access than the feature requires

## Step 3: Test Under a Non-Admin User

Attempt each operation (SELECT, INSERT, UPDATE, DELETE) as a regular user:
- On rows they own — should succeed
- On rows owned by another user — should fail with 42501

## Output

```
**Table: <name>**
- RLS enabled: yes / no
- Policies: <list>
- Issues found:
  - [CRITICAL] <description>
  - [WARNING] <description>
- Verdict: SECURE / NEEDS FIXES
```

## Common Issues

| Error | Likely cause |
|-------|--------------|
| 42501 on valid operation | Missing or overly restrictive USING clause |
| User can read others' data | USING clause missing `auth.uid()` check |
| Insert fails for valid user | Missing or wrong WITH CHECK clause |
| Service role leaking to client | `service_role` key used in client-side code |
