# Pipeline Runbook

When asked to **"build the app"** or **"follow the pipeline"**, execute this file as your instructions.

## Before Starting

1. Read `IDEA.md` and this file completely before taking any action
2. Create a todo item for each phase using your task list
3. Check which phases are already done (see `docs/IMPLEMENTATION_TRACKER.md` if it exists) and skip them
4. After completing each phase, append a line to `docs/IMPLEMENTATION_TRACKER.md` (local only — not committed)
5. Surface blockers immediately rather than guessing past them

### Prerequisites check

Before Phase 0, verify:
- `IDEA.md` is filled out beyond the template placeholders
- `gh auth status` succeeds
- `git rev-parse --show-toplevel` succeeds (inside a git repo)
- `claude --version` is available (for any subagent spawning)

If any prerequisite fails, stop and tell the user what to fix.

---

## Phase 0 — Data Architecture Blueprint *(required first)*

**Skip if:** `docs/DATA_ARCHITECTURE.md` already exists and matches the current `IDEA.md` scope.

**Instructions:**

Read `IDEA.md` in full and produce a backend-first architecture plan from a senior data architect perspective.

Required workflow:
- Run `/ultrathink` to pressure-test domain boundaries, tenancy, lifecycle, and scaling risks
- Run `/plan` specifically for data modeling before app scaffolding work
- Create `docs/DATA_ARCHITECTURE.md` with concrete, implementation-ready decisions

Use this exact structure:

```
# [App name] Data Architecture
## Modeling assumptions
## Canonical entities
## Relational schema
### Tables and columns
### Keys and constraints
### Relationships and cardinality
## Access patterns and indexing strategy
## Multi-tenant and authorization model
## Data lifecycle
### Creation and ownership
### Updates and concurrency
### Soft delete / archival / retention
## RLS policy plan (if Supabase/Postgres)
## Migration plan
## Mock data plan
### Seed strategy
### Required dataset shape
### Edge-case records
```

Rules:
- No placeholders or pseudo-schema
- Explicit primary keys, foreign keys, unique constraints, and nullability
- Indexes must map to expected query patterns
- Include at least 3 edge cases that must be represented in mock data

**Done when:** `docs/DATA_ARCHITECTURE.md` exists, is specific, and can be implemented without guessing.

**Commit:** `docs: add data architecture blueprint`

---

## Phase 1 — PRD Generation

**Skip if:** `docs/PRD.md` already exists. Ask the user whether to regenerate or use the existing file.

**Instructions:**

Read `IDEA.md` in full. Create `docs/PRD.md` (create the `docs/` directory if needed) with this exact structure:

```
# [App name] PRD
## Problem
## Target users
## Goals
## Non-goals
## Core features (MVP Phase 1)
## Post-MVP features
## Technical design
### Stack
### Data model
### Key screens / surfaces
## Phases
### Phase 1 — MVP
### Phase 2
## Acceptance criteria
```

Rules:
- Make real decisions — no placeholder text anywhere
- The stack decision is final; it drives all code in Phase 4
- Non-goals must be explicit — they prevent scope creep in Phase 4
- Acceptance criteria must be testable
- The `### Data model` section must align with `docs/DATA_ARCHITECTURE.md` (summarize, do not contradict)

**Done when:** `docs/PRD.md` exists, all sections are filled, no placeholders remain.

**Commit:** `docs: add PRD`

---

## Phase 2 — Feature Decomposition

**Skip if:** `docs/FEATURES.md` already exists.

**Instructions:**

Read `docs/PRD.md`. Create `docs/FEATURES.md` with 5–10 Phase 1 MVP features, ordered by dependency (things other features depend on come first).

Use this exact format for every feature:

```
## [n]. [Feature name]

**Description:** One sentence explaining what this feature does for the user.

**Acceptance criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Dependencies:** [Feature numbers this depends on, or "none"]
**Complexity:** [S / M / L]

---
```

Rules:
- Each feature must be independently implementable on its own branch
- Features should represent a complete user-facing capability, not a subtask
- If the PRD implies more than 10 features, group related ones

**Done when:** `docs/FEATURES.md` has 5–10 ordered features in the correct format.

**Commit:** `docs: add feature list`

---

## Phase 2b — Update CLAUDE.md

**Instructions:**

Read `docs/PRD.md` and `docs/FEATURES.md`. Update `CLAUDE.md` to replace every placeholder section with specific, actionable guidance for this project:

- **Project Overview**: what the app does, the exact stack chosen
- **Repository Layout**: expected folder structure for this stack
- **Core Conventions**: TypeScript config, data layer pattern, UI library rules, state management, error handling, security rules
- **MCP Tools**: keep the existing table, add any project-specific tools
- **What NOT to Do**: add non-goals from the PRD as explicit rules

Every rule in CLAUDE.md must be concrete and testable. Remove all `[describe your...]` placeholders.

**Done when:** `CLAUDE.md` has no placeholder sections. Every convention is specific to this project.

**Commit:** `docs: update CLAUDE.md with project conventions`

---

## Phase 3 — Human Checkpoint *(optional)*

**Only run this phase if the user explicitly asked for a review pause.**

Stop here. Tell the user:

> "Phase 1–2b complete. Please review:
> - `docs/PRD.md` — does the problem statement and data model match your vision?
> - `docs/FEATURES.md` — are features well-scoped and in the right order?
> - `CLAUDE.md` — do the conventions match your intended stack?
>
> Edit any of these files, then tell me 'ready' to continue to Phase 4."

Wait for explicit confirmation before proceeding.

---

## Phase 3b — Integration Setup *(optional, run if PRD references external services)*

If `docs/PRD.md` mentions Supabase, Stripe, external APIs, or any service requiring credentials:

Tell the user:

> "Before Phase 4, set up each integration:
> 1. Create accounts and generate API keys
> 2. Add secrets to `.env` (`.env` is gitignored)
> 3. Add non-secret config to `src/config/` or equivalent
> 4. For MCP servers: update `.claude/settings.local.json`
>
> Create `docs/INTEGRATIONS.md` documenting each service (purpose + config location, no secret values).
> Tell me 'ready' when done, or 'skip' to continue without setup."

If they say 'skip', proceed but note that MCP-dependent features may need manual intervention.

If Supabase is in the chosen stack and credentials are unavailable, stop and surface this as a blocker before Phase 4.

---

## Phase 4a — GitHub Repo + Backend Foundation + Setup PR

### Create the GitHub repo

```bash
gh repo create <project-name> --private --source=. --remote=origin --push
```

If a remote already exists, skip creation and just push.

### Create the scaffold

Create branch `setup/scaffold`, push it, then implement the full project foundation:

**Backend foundation (required when Supabase is in the selected stack)**

Run this before UI-heavy implementation work.

- Run `/supabase-migrations` to convert `docs/DATA_ARCHITECTURE.md` into concrete SQL migrations
- Apply migrations to Supabase and verify schema objects exist (tables, constraints, indexes, RLS)
- Generate typed database definitions (for example with Supabase type generation) and commit them
- Add deterministic seed data (`supabase/seed.sql` or equivalent) and ensure it can be re-run safely
- Seed mock data that is realistic and relationally complete for every core table
- Mock data is mandatory: include happy-path, empty-ish, and edge-case records from `docs/DATA_ARCHITECTURE.md`
- Add a script/command for reseeding (example: `npm run db:seed`) and document usage
- Create `docs/MOCK_DATA.md` listing record volumes, scenarios covered, and reseed/reset instructions

Mock data minimum bar:
- Every core table has representative rows
- Every foreign key path has valid linked records
- Status/state columns include multiple states (not a single default state)
- At least 3 edge-case records are present and queryable

**Code structure**
- `package.json`, `tsconfig.json` (strict mode), app config files for the chosen stack
- All shared dependencies installed
- Base folder structure per `CLAUDE.md`
- `npm run typecheck`, `npm run lint`, `npm run test` scripts (test can exit 0 if no tests yet)
- `.env.example` with all required variable names (no values)
- EAS config (`eas.json`) if Expo

**Design system** *(do not skip — this prevents the "default template" problem)*

Run `/app-design` first to plan the visual language, then create:
- `src/theme/colors.ts` — full palette: primary, secondary, neutral, semantic (success/warning/error/info), surface, text
- `src/theme/typography.ts` — font size scale, font weights, line heights
- `src/theme/spacing.ts` — numeric scale (4px base unit)
- `src/theme/radius.ts` — border radius values
- `src/theme/index.ts` — re-exports all tokens; configures UI library theme provider

No hex values anywhere except `src/theme/colors.ts`. No magic numbers except `src/theme/spacing.ts`.

**Navigation skeleton**
- Base navigator structure (stack, tabs, modals — whatever the PRD calls for)
- Placeholder screens that render without crashing
- `npm run typecheck` passes

**Commit:** `chore(setup): initialize scaffold, backend foundation, and design system`

### Open and merge the PR

```bash
gh pr create --title "chore(setup): initialize scaffold, backend foundation, and design system" \
   --body "Project foundation: Supabase schema + seed data, dependencies, design system, navigation skeleton, tooling." \
  --base main
```

Run `/code-review` on the diff. Fix any critical or major issues. Push fixes. Merge:

```bash
gh pr merge <number> --squash --delete-branch
git checkout main && git pull
```

**Done when:** Setup PR is merged, `main` is up to date, `npm run typecheck` passes on main.

---

## Phase 4b+4c — Feature PRs

Work through each feature in `docs/FEATURES.md` in order. For each feature:

### Check if already done

```bash
gh pr list --state merged --search "feat(<slug>)"
```

If a matching merged PR exists, skip this feature and move to the next.

### Implement the feature

1. Pull latest main and create a feature branch:
   ```bash
   git checkout main && git pull
   git checkout -b feature/<n>-<slug>
   ```

2. Run `/plan` — produce an implementation plan for this feature. Confirm the plan is sound before writing code. The plan must:
   - List every file to create or modify
   - Sequence changes (schema/types → services → UI)
   - Identify regression risk

3. Implement following `CLAUDE.md` conventions:
   - All colors from `src/theme/colors.ts` — no inline hex values
   - All spacing from `src/theme/spacing.ts` — no magic numbers
   - All font sizes from `src/theme/typography.ts`
   - Every screen handles: loading state, error state, empty state, happy path
   - Tests alongside code (TDD preferred — run `/tdd` for complex logic)

4. Run `/ship` — work through the full pre-ship checklist. Fix everything flagged critical or major.

5. Push and open PR:
   ```bash
   git push -u origin feature/<n>-<slug>
   gh pr create --title "feat(<slug>): <name>" \
     --body "<feature description and acceptance criteria>" \
     --base main
   ```

6. Run `/code-review` and `/qa` on the PR diff. Apply all fixes. Push.

7. Wait for CI, then merge:
   ```bash
   gh pr checks <number> --watch
   gh pr review <number> --approve --body "Automated review complete."
   gh pr merge <number> --squash --delete-branch
   git checkout main && git pull
   ```

8. Record in tracker: `echo "- [$(date)] Feature <n> '<name>' merged" >> docs/IMPLEMENTATION_TRACKER.md`

Repeat for every feature.

---

## Done

When all features are merged:

1. Run `/app-store-preflight` if this is a mobile app — address any blockers
2. Report a summary:
   - Features implemented (list)
   - Any features skipped and why
   - Suggested next steps (TestFlight, beta testing, post-MVP features from PRD)

---

## Resuming an interrupted pipeline

If the pipeline was stopped mid-run:

1. Read `docs/IMPLEMENTATION_TRACKER.md` to see what completed
2. Check `gh pr list --state all` to see PR status
3. Run `git log --oneline -10` to see recent commits
4. Pick up from the first incomplete phase
5. For partially implemented features: check out the existing branch, assess what's done, continue from there
