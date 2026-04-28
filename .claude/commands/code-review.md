---
description: Systematic code review covering security, correctness, performance, and architecture. Use when reviewing a PR or diff, checking work before committing, doing a security pass, or evaluating a new feature.
---

# Code Review

Review the current diff or staged changes (or the scope specified in $ARGUMENTS).

## Security (check first)

- [ ] No credentials, tokens, or secrets in source
- [ ] User input not passed directly into raw SQL or shell commands
- [ ] No `any` casts that bypass type checking on user-supplied data
- [ ] Auth/permission checks present on all mutations
- [ ] Sensitive data not logged to the console

## Correctness

- [ ] Error paths are caught and surfaced to the user
- [ ] `undefined` / `null` cases are handled — no unchecked property accesses
- [ ] Async operations awaited; no floating promises
- [ ] Mutations invalidate or refetch affected queries on success
- [ ] Optimistic updates (if used) have rollback on error

## Architecture

- [ ] No business logic inside display/UI components
- [ ] No server state mirrored into local state unnecessarily
- [ ] Prop-drilling not beyond 2 levels
- [ ] New code follows existing patterns (check adjacent files)
- [ ] No premature abstractions for one-time use

## Performance

- [ ] No unnecessary re-renders (stable refs, memoization where appropriate)
- [ ] Heavy computations not blocking the render path
- [ ] Lists are virtualized if they could grow large
- [ ] No N+1 query patterns

## Output Format

For each issue found:

```
[SEVERITY: critical|major|minor] <file>:<line>
Issue: <what is wrong>
Fix: <what to do instead>
```

Severities:
- **critical**: security or data loss risk — must fix before merge
- **major**: bug or broken contract — should fix before merge
- **minor**: style, performance opportunity, or improvement — fix when convenient

After the issue list, give a one-line summary verdict: APPROVE / REQUEST CHANGES.
