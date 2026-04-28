---
description: Add a new screen to the app following project conventions. Use when adding a new route, page, or screen to the navigation. Handles file creation, navigation registration, and type safety.
---

# New Screen

Add a new screen: $ARGUMENTS

Read `CLAUDE.md` for the project's specific navigation library and conventions before proceeding.

## Step 1: Plan the Screen

Determine:
- Screen name (PascalCase, e.g. `UserProfileScreen`)
- Route name (e.g. `UserProfile`)
- Navigation stack it belongs to (root, tab, modal, etc.)
- Parameters it receives (typed)
- Data it fetches (which service/hook)

## Step 2: Create the Screen File

Create `src/screens/<ScreenName>.tsx` (or the project's equivalent path).

Structure:
```tsx
// Props typed from navigation
// Data fetching via hook (not inline)
// Loading state shown while data fetches
// Error state surfaced to user
// Pull-to-refresh if applicable
// No business logic inline — pass handlers as props or call hooks
```

## Step 3: Register the Route

1. Add the screen to the navigator (`src/navigation/` or equivalent)
2. Add the route params to the navigation type definitions
3. Export the screen from any relevant barrel files

## Step 4: Add Navigation

Add navigation triggers to the appropriate places:
- List items, buttons, or tabs that navigate to this screen
- Back navigation if this is a detail screen

## Step 5: Verify

- [ ] Screen renders without errors
- [ ] Navigation to and from the screen works
- [ ] Screen params are correctly typed
- [ ] Loading and error states are handled
- [ ] No TypeScript errors (`npm run typecheck`)

## Output

List the files created or modified with a one-line description of each change.
