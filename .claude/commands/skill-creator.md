---
description: Create a new Claude custom command (skill) from scratch or improve an existing one. Use when you want to turn a repeated workflow into a reusable slash command, when a command isn't producing good outputs, or any time you say "create a command", "make a skill", or "improve this command".
---

# Skill Creator

Create or improve a Claude custom command for: $ARGUMENTS

## Step 1: Capture Intent

If the workflow is already visible in this conversation, extract answers from it directly.

Otherwise ask:
1. What should this command enable Claude to do?
2. When should it be used? (specific phrases, file types, project contexts)
3. What is the expected output format?
4. What should it explicitly NOT do, or what are common mistakes to avoid?

## Step 2: Write the Command File

Create `.claude/commands/<name>.md`.

**Format:**
```markdown
---
description: One sentence capability statement. Use when [specific triggers with keywords].
---

# Command Name

Instructions for what Claude should do when this command is invoked.

Use $ARGUMENTS for any text passed after the command name.
```

**Rules:**
- The `description` field is shown in `/help` — make it specific and include trigger keywords
- Body should be under 300 lines — move detail to separate reference files if needed
- Write in imperative form: "Run X", not "You should run X"
- Include at least one concrete output format or example
- Use `$ARGUMENTS` where the user will provide the target/subject

## Step 3: Test the Command

Come up with 2–3 realistic test prompts — things a real user would type.

For each test prompt, follow the command's instructions and produce the output.
Ask: Does the output match expectations? What's missing?

## Step 4: Refine

Apply feedback. Principles:
- **Generalize**: avoid rules that only work for the test examples
- **Keep lean**: remove steps that produce no useful output
- **Explain why**: if writing `ALWAYS` or `NEVER`, reframe with reasoning instead

## Folder for commands

All project-specific commands: `.claude/commands/<name>.md`
Global commands (all projects): `~/.claude/commands/<name>.md`

## Output

Present the complete command file content, ready to save.
Then ask: "Should I save this to `.claude/commands/<name>.md`?"
