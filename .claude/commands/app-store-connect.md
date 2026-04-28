---
description: Manage App Store Connect operations without leaving Claude Code — version management, TestFlight distribution, metadata uploads, review submission, and certificate management. Use when submitting a build, distributing to testers, uploading metadata, or monitoring review status.
---

# App Store Connect

App Store Connect task: $ARGUMENTS

This command uses the App Store Connect CLI (`asc`) to handle all App Store operations from inside the session. No browser tab switching.

## Prerequisites

```bash
# Install the CLI
brew install rudrankriyam/tap/asc

# Authenticate (generates a key config)
asc auth --key-id KEY_ID --issuer-id ISSUER_ID --key-path path/to/AuthKey.p8
```

Store credentials in `.env` (never commit):
```
ASC_KEY_ID=...
ASC_ISSUER_ID=...
ASC_KEY_PATH=./AuthKey.p8
```

---

## Common Workflows

### Upload and distribute to TestFlight

```bash
# Upload IPA
asc builds upload --path build/MyApp.ipa

# List available builds to confirm upload
asc builds list --app-id BUNDLE_ID

# Distribute to internal testers
asc testflight distribute --build-id BUILD_ID --group "Internal Testers"

# Distribute to external testers (triggers Apple review for first submission)
asc testflight distribute --build-id BUILD_ID --group "Beta Testers" --external
```

### Submit for App Store review

```bash
# List current app versions
asc versions list --app-id BUNDLE_ID

# Submit for review
asc submissions submit --app-id BUNDLE_ID --version VERSION

# Monitor review status
asc submissions status --app-id BUNDLE_ID

# Cancel submission (if needed)
asc submissions cancel --app-id BUNDLE_ID
```

### Upload metadata

```bash
# Sync metadata from local files to App Store Connect
asc metadata sync --app-id BUNDLE_ID --locale en-US

# Audit keywords
asc metadata audit --app-id BUNDLE_ID
```

### Upload screenshots

```bash
# Upload screenshots for a specific device and locale
asc screenshots upload --app-id BUNDLE_ID --device iphone-6-5 --locale en-US --path screenshots/
```

### Certificates and provisioning

```bash
# List certificates
asc certificates list

# List provisioning profiles
asc profiles list --bundle-id BUNDLE_ID
```

---

## Workflow: First Submission

1. Run `/app-store-preflight` first — fix any blockers before spending time on submission
2. Build and upload the IPA (or use EAS: `eas build --platform ios --profile production`)
3. Distribute to internal TestFlight group for final smoke test
4. Sync metadata: title, subtitle, description, keywords, screenshots
5. Submit for App Store review
6. Monitor status: `asc submissions status --app-id BUNDLE_ID`

## Workflow: Version Update

1. Increment build number (use `asc builds calculate-number` to get next number)
2. Build and upload the new IPA
3. Distribute to TestFlight for regression testing
4. Update metadata if anything changed
5. Submit for review

---

## Rules

- Never commit `AuthKey.p8` or `.env` — keep them out of git
- Run `/app-store-preflight` before every submission to TestFlight or App Store
- External TestFlight distributions require Apple's own Beta App Review (usually 1–2 days)
- App Store review typically takes 1–3 days — plan for this in release timelines
