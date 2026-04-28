---
description: Investigate a bug report, build a fix plan, and apply the fix. Use when given a bug report, a broken-in-prod issue, or any problem that needs investigation before coding.
---

# Triage Issue

Investigate and fix: $ARGUMENTS

## Phase 1: Investigate

1. Read the bug report or error message carefully
2. Identify what is failing and where (file, function, query, network call)
3. Reproduce the failure if possible — find the smallest case that triggers it
4. **Do not write any fix yet**

## Phase 2: Root Cause Analysis

Ask and answer:
- What is the code actually doing vs. what it should do?
- What assumption in the code is wrong?
- When did this break? (recent change, always broken, environment-specific?)
- Is this the root cause or a symptom?

Document the root cause in one clear sentence before continuing.

## Phase 3: Fix Plan

Write a fix plan:
- What exactly will change?
- What is the minimal change that fixes the root cause?
- What could this fix break? (regression risk)
- Is a migration, data backfill, or rollback needed?

## Phase 4: Apply Fix

Make the minimal change. Then:
- [ ] Reproduce the original failure — confirm it no longer occurs
- [ ] Check adjacent behavior — nothing adjacent is broken
- [ ] Remove debug logging added during investigation
- [ ] Write a test that covers the failure case

## Output

```
**Root cause:** <one sentence>
**Fix:** <what changed and why>
**Regression risk:** <what to watch>
**Test added:** yes / no / not applicable
```
