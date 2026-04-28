---
description: Diagnose and fix React Native performance issues. Use when the app feels slow or laggy, FlatList is janky, there are too many re-renders, or startup time is slow.
---

# React Native Performance

Investigate and fix performance issues in: $ARGUMENTS

## Step 1: Identify the Symptom

Classify the issue:
- **List jank** — FlatList or ScrollView dropping frames
- **Re-render storm** — component tree re-rendering too often
- **Slow screen mount** — screen takes too long to appear
- **Slow startup** — app takes too long to reach the first screen
- **Memory pressure** — app growing in memory over time

## Step 2: Diagnose

### Re-renders
- Use React DevTools Profiler to identify which components re-render on each action
- Check for unstable references: objects/arrays/functions created inline in JSX
- Check for missing `useMemo`, `useCallback`, or `React.memo` on expensive computations/callbacks

### List Jank
- Confirm `keyExtractor` returns a stable, unique string (not the array index)
- Check `renderItem` for inline object/function creation — stabilize with `useCallback`
- Check item component for unnecessary re-renders (`React.memo` if pure)
- Add `getItemLayout` if items have a fixed height — eliminates measurement
- Check `ListHeaderComponent` / `ListFooterComponent` for heavyweight content

### Slow Screen Mount
- Check if expensive work is happening synchronously on mount
- Defer non-critical work with `InteractionManager.runAfterInteractions`
- Check if images are loaded without caching or size constraints

### Startup
- Reduce work in `useEffect` calls that run on the root screen
- Lazy-load screens and heavy dependencies
- Defer analytics/logging initialization

## Step 3: Apply Fix

Make the minimal change that addresses the root cause. Do not pre-optimize unrelated code.

## Step 4: Verify Improvement

- [ ] Manually test the affected interaction — does it feel smooth?
- [ ] Check React DevTools Profiler — render count reduced
- [ ] No new TypeScript errors introduced

## Rules

- Profile before optimizing — do not guess
- `React.memo` only helps if props are referentially stable
- `useCallback` and `useMemo` have a cost — only add them where profiling confirms benefit
- FlatList virtualization works correctly only when items have stable keys
