---
description: Ask relentless clarifying questions about a feature before any code is written. Use when starting a new feature, planning a significant change, or before any work where requirements are unclear. Prevents rework.
---

# Grill Me

Ask probing questions about this feature/task before any code is written: $ARGUMENTS

Ask questions **one at a time**. Wait for the answer before asking the next. Do not assume.

## Required Topic Areas

Work through each area. Skip only if the answer is already unambiguous.

**Scope & Goals**
- What is the exact user-visible behavior when this is complete?
- What does "done" look like — what can a user do that they can't do today?

**Data Model**
- What data is involved? Are new tables, columns, or models needed?
- Where does the data come from — user input, existing DB, external API?

**Access Control**
- Who can see or mutate this data?
- What permissions or roles apply?

**State & Flows**
- Are there multiple states or phases this feature interacts with?
- What triggers state transitions?
- What are the valid state transitions?

**Edge Cases & Failure Modes**
- What happens if the network fails mid-action?
- What if the user performs the action twice?
- What if required data is missing or malformed?

**Rollback & Safety**
- Is this change reversible?
- Does it require a migration? Is the migration reversible?
- What happens to existing data during rollout?

## Rules

- One question at a time — do not list them all at once
- Do not write any code until all topic areas have been addressed
- If the user says "just build it", push back once with the most critical unanswered question
- When all questions are answered, produce a concise spec in bullet form before writing code
