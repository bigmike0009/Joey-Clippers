---
description: Force deep, extended reasoning on a hard problem before answering or acting. Use when facing a complex architectural decision, a subtle bug with no obvious cause, a tricky algorithm, conflicting requirements, or any problem where a quick answer feels risky.
---

# Ultrathink

Think deeply and carefully about this problem before responding: $ARGUMENTS

## Instructions

Take as much reasoning space as needed. Work through:

1. **Restate the problem** in your own words to confirm understanding
2. **List all constraints** — hard rules, soft preferences, existing code conventions
3. **Generate multiple approaches** — at least 3 if possible, including non-obvious ones
4. **Evaluate each approach**:
   - What does it do well?
   - What are its failure modes?
   - What does it cost (complexity, performance, maintainability)?
5. **Select the best approach** and justify why
6. **Identify what could go wrong** with your chosen approach and how to mitigate it

## Rules

- Do not rush to an answer. Depth of reasoning matters more than speed here.
- If you realize mid-reasoning that your initial framing was wrong, reframe and continue.
- Only begin implementation (if applicable) after the reasoning is complete.
- Flag any remaining uncertainty explicitly rather than hiding it in confident-sounding prose.
