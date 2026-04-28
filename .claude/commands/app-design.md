---
description: Establish or enforce a design system for an Expo/React Native app. Use when starting UI work on a new screen, when the app looks like a default template, when colors or spacing are inconsistent, or when you need to define the visual language before building features.
---

# App Design

Design task: $ARGUMENTS

Read `CLAUDE.md` for the project's stack and any existing design tokens before proceeding.

## Mode A: Design System Setup (run once, during scaffold)

If no design system exists yet, create one now. Do not let it emerge screen by screen.

### 1. Color Palette

Define a primary, secondary, and neutral palette. Every color used in the app must come from this file.

Create `src/theme/colors.ts`:
```ts
export const colors = {
  primary:   { default: '#...', light: '#...', dark: '#...' },
  secondary: { default: '#...', light: '#...', dark: '#...' },
  neutral:   { 50: '#...', 100: '#...', ..., 900: '#...' },
  semantic:  { success: '#...', warning: '#...', error: '#...', info: '#...' },
  surface:   { background: '#...', card: '#...', overlay: '#...' },
  text:      { primary: '#...', secondary: '#...', disabled: '#...', inverse: '#...' },
}
```

### 2. Typography Scale

Create `src/theme/typography.ts`:
```ts
export const typography = {
  fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36 },
  fontWeight: { normal: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.75 },
}
```

### 3. Spacing Scale

Create `src/theme/spacing.ts`:
```ts
export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
}
```

### 4. Border Radius

```ts
export const radius = { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 }
```

### 5. Theme Export

Create `src/theme/index.ts` that re-exports all tokens and a `useTheme()` hook (or configure the UI library's theme provider with these values).

### Rules for design system setup
- Derive all values from a single source of truth (`src/theme/`)
- No hex values in component files — import from theme
- When using a UI library (React Native Paper, NativeBase, etc.), configure its theme provider with these tokens rather than duplicating values

---

## Mode B: Screen Design Review (run per screen/feature)

Review the current screen or component for design consistency.

### Checklist
- [ ] All colors sourced from `src/theme/colors.ts` — no inline hex values
- [ ] Spacing uses scale values, not arbitrary numbers
- [ ] Typography uses scale values — no hardcoded `fontSize: 15`
- [ ] Touch targets are at least 44×44pt (Apple HIG requirement)
- [ ] Text contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- [ ] Loading states shown while data fetches (skeleton or spinner)
- [ ] Empty states shown when a list has no data
- [ ] Error states shown when a fetch fails
- [ ] Content does not overflow or clip on smaller screen sizes (iPhone SE)
- [ ] Safe area insets respected (use `SafeAreaView` or equivalent)

### Output
List each violation as:
```
[file:line] Issue: hardcoded color '#3B82F6' → use colors.primary.default
```

Apply all fixes directly.

---

## Mode C: Interface Design Options (run before building a new screen)

Generate 3 radically different layout options for: $ARGUMENTS

For each option, describe:
- Layout structure (card-based vs list vs grid vs full-screen hero)
- Key visual hierarchy decisions (what draws the eye first)
- Navigation pattern (tabs, stack, modal, bottom sheet)
- One trade-off (what this approach gives up)

Do not write any code yet. Present all 3 options and ask which direction to pursue.
