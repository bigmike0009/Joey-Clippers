---
description: Full QA pass over a feature before it ships. Use when a feature is complete and ready for review, before opening a PR, or when doing pre-release testing.
---

# QA Pass

Run a structured quality assurance pass on: $ARGUMENTS

## Step 1: Map the Happy Path

List every user action in the feature from start to finish:
1. User navigates to the entry point
2. Data loads (or form is presented)
3. User performs the core action
4. System processes the action
5. UI updates / confirmation shown
6. User sees the expected result

## Step 2: Generate Edge Cases

For each step in the happy path, ask:
- What if the data is missing or `null`?
- What if the network fails at this moment?
- What if the user repeats this action twice rapidly?
- What if a different role / permission level performs this?
- What if the system is in an unexpected state?

## Step 3: Security Check

- Does this expose data to users who shouldn't see it?
- Are all inputs validated before reaching the data layer?
- Does this create a new attack surface (IDOR, injection, XSS)?

## Step 4: Regression Risk

- What adjacent features could this break?
- What shared state or data does this touch?
- Are there any other consumers of the code changed?

## Output

```
**Happy path:** <summary in one sentence>

**Edge cases to verify:**
- [ ] <case 1>
- [ ] <case 2>

**Security checks:**
- [ ] <check 1>

**Regression risk:** <what adjacent features could break and why>

**Verdict:** READY / NEEDS FIXES
```

## Rules

- Do not mark a feature "done" if any critical edge case has no mitigation
- Test mutations under non-admin / unprivileged user context
- State-gated features must be verified in both the correct state AND an incorrect state
