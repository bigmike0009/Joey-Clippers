---
description: Test-driven development with a red-green-refactor loop. Use when building a new function, service, hook, or module where correctness matters, when you want tests to drive the design of an API, or any time you say "write tests first" or "TDD".
---

# TDD — Red-Green-Refactor

Apply test-driven development to: $ARGUMENTS

## The Loop

Repeat until the feature is complete:

### Red — Write a failing test

1. Write the smallest test that describes one piece of behavior
2. Run the test suite — confirm this test fails (and only this test)
3. **Do not write implementation code yet**

```bash
npm test -- --watch
```

The test name should read like a specification:
```ts
it('returns null when user is not authenticated', ...)
it('throws if required field is missing', ...)
it('calls the API exactly once per request', ...)
```

### Green — Make it pass with minimal code

4. Write the simplest implementation that makes the failing test pass
5. Run the test suite — confirm only the target test now passes
6. **Do not optimize or generalize yet**

### Refactor — Clean up without breaking tests

7. Refactor the implementation for clarity, removing duplication
8. Run the test suite — confirm all tests still pass
9. **Do not add behavior during refactor**

Then move to the next behavior and repeat.

---

## Starting a new module

Before writing any test, define the interface:

```ts
// What inputs does this take?
// What does it return?
// What errors can it throw?
// What side effects does it have?
```

Write your first test against this interface before writing any implementation. Let the tests drive the interface design — if a test is hard to write, the interface design is wrong.

---

## What to test

**Test these:**
- Pure functions with logic (calculations, transformations, validations)
- Service methods (mock the DB/HTTP layer)
- React Query hooks (use a query client wrapper)
- State transitions and business rules

**Don't test these:**
- React Native Paper components (UI library, not your logic)
- Supabase client calls directly (test the service that wraps them)
- Implementation details (internal variables, private methods)

---

## Test structure

```ts
describe('<module name>', () => {
  describe('<function or behavior group>', () => {
    it('<does X when Y>', () => {
      // Arrange
      const input = ...

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toEqual(expected)
    })
  })
})
```

## Rules

- One assertion per test where possible — a failing test should point to exactly one thing
- Test behavior, not implementation — if refactoring breaks a test without changing behavior, the test was wrong
- Never write implementation to make multiple tests pass at once — one test at a time
- If a test is hard to write, the design needs to change, not the test
