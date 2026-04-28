---
description: Run the complete pre-ship checklist before opening a PR or merging. Use when a feature is complete and you're ready to ship. Runs code review, QA pass, and commit hygiene in sequence.
---

# Ship Checklist

Run the full pre-ship sequence for: $ARGUMENTS

Work through each step in order. Do not skip steps.

## Step 1: Code Review

Run `/code-review` on all changes since branching from main.

Fix any **critical** or **major** issues before continuing.
Note any **minor** issues — fix them now or document why they're deferred.

## Step 2: QA Pass

Run `/qa` on the feature being shipped.

Verify:
- Happy path works end to end
- Critical edge cases are handled
- No obvious regression risk left unaddressed

## Step 3: Commit Hygiene

- [ ] No debug logging or `console.log` left in production code
- [ ] No TODO comments or stub implementations
- [ ] No commented-out code blocks
- [ ] All new files are intentional (no test fixtures or temp files committed)
- [ ] Commit messages follow conventional commit format

Run `git diff main` and confirm the diff contains only what belongs in this PR.

## Step 4: Tests

- [ ] Existing tests pass (`npm test` or equivalent)
- [ ] New code has test coverage for happy path and critical edge cases
- [ ] No tests were deleted to make the suite pass

## Step 5: Final Diff Check

- [ ] No secrets, tokens, or credentials in the diff
- [ ] `.env` and sensitive files not staged
- [ ] `package-lock.json` or `yarn.lock` updated if dependencies changed

## Output

```
**Ship verdict:** READY / NOT READY

**Blockers (must fix):**
- [list or "none"]

**Deferred (can ship with these):**
- [list or "none"]
```

If READY, run `/auto-commit` and open the PR.
