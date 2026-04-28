---
description: Deploy to TestFlight or the App Store via Expo Application Services (EAS). Use when building for distribution, submitting to Apple review, or pushing an OTA update.
---

# Expo Deployment

Deploy: $ARGUMENTS

Read `CLAUDE.md` for project-specific EAS configuration before proceeding.

## Prerequisites Check

- [ ] `eas.json` exists and has `preview` and `production` profiles
- [ ] `app.json` / `app.config.js` has correct `bundleIdentifier` (iOS) and `package` (Android)
- [ ] EAS project is linked: `eas project:info` returns project details
- [ ] Credentials are configured: `eas credentials` for iOS certificates + provisioning profiles

## OTA Update (fastest — no app store review)

Use for JS-only changes (no native code changes):

```bash
eas update --branch production --message "description of what changed"
```

Verify the update appears in the EAS dashboard before marking done.

## TestFlight Build

```bash
# Build for internal testing
eas build --platform ios --profile preview

# Submit to TestFlight after build completes
eas submit --platform ios --profile preview
```

After submission:
- [ ] Build appears in App Store Connect → TestFlight
- [ ] Add internal testers if not auto-added
- [ ] Wait for Apple processing (typically 15–30 min)

## App Store Production Build

```bash
# Production build
eas build --platform ios --profile production

# Submit for App Store review
eas submit --platform ios --profile production
```

After submission:
- [ ] Complete App Store Connect metadata (screenshots, description, keywords)
- [ ] Submit for review in App Store Connect
- [ ] Monitor review status (typically 1–3 days)

## Build Failure Checklist

- [ ] Check EAS build logs for the specific error
- [ ] For native dependency issues: `expo doctor` and check for incompatible versions
- [ ] For certificate issues: `eas credentials` and re-configure
- [ ] For bundle ID issues: verify in Apple Developer portal

## Rules

- Never use OTA updates for native code changes — always do a full build
- Production builds require signing certificates — confirm before triggering a build
- Keep `eas.json` in version control (without secrets)
- Store credentials in EAS — do not commit `.p8`, `.p12`, or provisioning profiles
