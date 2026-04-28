---
description: Create a detailed implementation plan before writing any code. Use when starting a non-trivial feature, when the scope is large, or when you want to align on approach before implementation begins. Prevents over-building and missed dependencies.
---

# Implementation Plan

Create a detailed plan for: $ARGUMENTS

Do NOT write any code during this command. Produce a plan only.

## Step 1: Understand the Scope

Read all relevant context:
- `CLAUDE.md` for project conventions
- `docs/PRD.md` and `docs/FEATURES.md` if they exist
- Any files directly referenced in the request

## Step 2: Identify All Affected Areas

List every file, module, or system that will need to change:
- New files to create
- Existing files to modify
- Schema or data changes required
- External services or APIs involved
- Tests to write or update

## Step 3: Sequence the Work

Order the changes so each step is safe to commit independently:
1. Foundation changes first (schema, types, interfaces)
2. Data layer next (services, queries)
3. UI layer last (screens, components)

## Step 4: Identify Risks

- What could go wrong?
- What assumptions are being made that might be wrong?
- What existing behavior could this break?
- What needs to be tested manually vs. in tests?

## Output Format

```
## Plan: [Feature Name]

### Scope
[One paragraph summary of what will be built]

### Files to change
- `path/to/file.ts` — [what changes]
- `path/to/new-file.ts` — [create: what it does]

### Sequence
1. [Step 1 — what and why first]
2. [Step 2]
...

### Risks & open questions
- [Risk or assumption that needs validation]

### Out of scope
- [Things this plan explicitly does NOT include]
```

After presenting the plan, ask: "Does this look right before I start implementing?"
