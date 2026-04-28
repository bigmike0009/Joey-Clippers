# [App Name] — Claude Instructions

<!--
This file is loaded by Claude at the start of every session.
Fill out each section during or after Phase 1 of the pipeline.
The richer this file is, the more consistent Claude's output will be.
-->

## How to Start the Pipeline

Open Claude Code in this project and say:

> "Follow PIPELINE.md to build the app from IDEA.md"

Claude will read both files, create a task list for each phase, and work through them in order — generating the PRD, features, scaffold, and one feature PR at a time. See `PIPELINE.md` for full phase details and how to resume if interrupted.

---

## Project Overview

[One or two sentences: what the app does and for whom.]

Stack: [e.g. React Native · Expo · TypeScript · Supabase · React Query · React Native Paper]

## Repository Layout

```
src/
  [describe your source layout here]
docs/
  PRD.md           # Product requirements — read before designing features
  FEATURES.md      # Ordered feature list — read before implementing
  INTEGRATIONS.md  # External services and config locations
```

## Core Conventions

### TypeScript
- Strict mode. No `any` unless interfacing with untyped third-party data.
- Prefer `unknown` over `any` for parameters of uncertain shape.

### Data Layer
- [Describe your data access pattern — e.g. "Never call the DB client directly from a component; use service classes and query hooks."]

### UI
- [Describe your component/styling conventions.]

### State Management
- [Describe your state approach — e.g. "Server state via React Query; local UI state only in useState."]

### Error Handling
- [Describe your error surface pattern.]

### Security
- No credentials or secrets in source files. Use env vars for client-safe values.
- [Add any project-specific security rules.]

## MCP Tools Available

| Server | Use for |
|--------|---------|
| **github** | Read/search repo files, list issues and PRs, check CI runs |
| **supabase** | Introspect live schema, list tables/columns, run read-only SQL, inspect RLS policies |
| **context7** | Fetch up-to-date library docs — always resolve library ID first, then fetch docs |
| **aws-docs** | Look up AWS service docs |

## Custom Commands Available

| Command | Purpose |
|---------|---------|
**Planning & Design**
| Command | When to use |
|---------|-------------|
| `/plan` | Before any non-trivial feature — align on approach first |
| `/ultrathink` | Hard architectural decisions, subtle bugs, conflicting requirements |
| `/grill-me` | Requirements feel fuzzy — resolve before writing code |
| `/app-design` | Set up design system (once, at scaffold), review screen for consistency, or generate layout options |

**Implementation**
| Command | When to use |
|---------|-------------|
| `/new-screen` | Adding a new route or screen |
| `/tdd` | When correctness matters — write tests before implementation |
| `/supabase-migrations` | Any schema change — column, table, RLS policy |

**Quality & Review**
| Command | When to use |
|---------|-------------|
| `/ship` | Feature complete — run full pre-ship checklist |
| `/code-review` | Before committing or opening a PR |
| `/qa` | Feature done — structured test plan before merge |
| `/systematic-debugging` | Bug with unclear root cause |
| `/triage-issue` | Bug report → investigate → fix |
| `/supabase-rls-audit` | 42501 errors, new tables, or security review |
| `/rn-performance` | Jank, slow screens, excessive re-renders |

**Release**
| Command | When to use |
|---------|-------------|
| `/expo-deployment` | Build and submit via EAS |
| `/app-store-connect` | TestFlight distribution, metadata uploads, review submission via CLI |
| `/app-store-preflight` | Before every TestFlight or App Store submission |
| `/aso-optimization` | App Store metadata and keyword optimization |

**Utilities**
| Command | When to use |
|---------|-------------|
| `/auto-commit` | Generate conventional commit message from staged diff |
| `/skill-creator` | Create or refine a custom command |

> Find community commands: [skillsmp.com](https://skillsmp.com) · [github.com/mattpocock/skills](https://github.com/mattpocock/skills)
> Install community commands: `npx skills@latest add <repo>/<skill-name>`

## What NOT to Do

- Do not create helper utilities for one-time use. Inline it.
- Do not add comments to code you didn't write in this session.
- Do not refactor working code while fixing an unrelated bug.
- Do not leave TODO comments or stub implementations.
- Do not suggest migrating to a different library or framework.
