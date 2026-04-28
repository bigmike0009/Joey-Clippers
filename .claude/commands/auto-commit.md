---
description: Generate a conventional commit message from staged changes. Use when ready to commit, want a well-structured commit message, or when using conventional commit format (feat/fix/chore/refactor/docs).
---

# Auto-Commit

Generate a conventional commit message from the staged diff.

Additional context: $ARGUMENTS

## Procedure

1. Read the staged diff (`git diff --staged`)
2. Identify the primary type of change:
   - `feat:` — new user-visible capability
   - `fix:` — bug fix
   - `refactor:` — restructuring without behavior change
   - `chore:` — tooling, deps, config
   - `docs:` — documentation only
   - `test:` — tests only
   - `perf:` — performance improvement
3. Identify the scope (the domain, screen, or module affected)
4. Write a subject line: imperative mood, max 72 chars, no period
5. Add a body only if the WHY is non-obvious

## Output Format

```
<type>(<optional-scope>): <subject>

<optional body — what and why, not how>
```

## Examples

```
fix(auth): redirect to login when session expires unexpectedly
```

```
feat(notifications): add push notification on new message received
```

```
chore: regenerate database types after migration 016
```

```
refactor(settings-screen): extract form logic into useSettingsForm hook

Simplifies the screen component and makes the form logic independently testable.
```

## Rules

- Never use past tense ("fixed", "added") — use imperative ("fix", "add")
- Do not mention file names in the subject unless there is no better description
- If the diff touches more than 2 unrelated concerns, suggest splitting the commit
- After generating the message, run `git commit -m "..."` to apply it
