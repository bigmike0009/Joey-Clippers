---
description: 4-phase debugging methodology for tracking down bugs. Use when a bug needs root cause analysis before fixing, something is broken and you don't know why, an error is hard to reproduce, or before making any speculative fix.
---

# Systematic Debugging

Work through the 4 phases in order. Do not skip ahead.

## Phase 1: Reproduce

1. Identify the **smallest failing case** — strip away unrelated code
2. Define reproduction steps that reliably trigger the failure
3. Confirm the failure is deterministic before proceeding
4. **Do not touch the code yet**

## Phase 2: Narrow the Root Cause

1. Form a hypothesis: what is the most likely cause?
2. Use logging, breakpoints, or query introspection to test the hypothesis
3. Rule out one layer at a time: is it the data? The query? The policy? The component? The state?
4. **Do not fix anything until the root cause is confirmed**

## Phase 3: Apply a Single Fix

1. Make the minimal change that addresses the confirmed root cause
2. Do not refactor or clean up anything adjacent
3. Do not fix multiple bugs in one change

## Phase 4: Verify

1. Run the reproduction case — confirm it now passes
2. Check no adjacent behavior is broken
3. Run tests if they exist
4. Remove any debug logging added in Phase 2

## Rules

- Never skip to Phase 3 — speculative fixes waste more time than they save
- One hypothesis at a time; confirm or disprove before moving on
- If Phase 2 produces no result after 2 attempts, go back to Phase 1 and reframe

$ARGUMENTS
