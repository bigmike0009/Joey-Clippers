---
description: Pre-submission checklist to catch common Apple App Store rejection reasons before submitting for review. Use when preparing an App Store submission, after a rejection, or during final QA before release.
---

# App Store Preflight

Scan for common rejection reasons before submitting: $ARGUMENTS

## Metadata

- [ ] App name matches the actual functionality (no keyword stuffing)
- [ ] Description is accurate and matches what the app does
- [ ] Screenshots match the current UI (no old designs or placeholder screens)
- [ ] Screenshots are the correct resolution for each required device size
- [ ] Privacy policy URL is live and accessible
- [ ] Support URL is live and accessible
- [ ] Age rating is set correctly and matches content

## Authentication & Onboarding

- [ ] App does not require account creation to access core functionality (Guideline 5.1.1)
  - Exception: apps whose core functionality is user-specific (social, e-commerce)
- [ ] If account creation is required, there is a "Sign in with Apple" option if any other third-party login is offered (Guideline 4.8)
- [ ] Account deletion is available in-app if users can create accounts (Guideline 5.1.1(v))
- [ ] Demo account credentials are provided in App Review notes if the app requires login

## In-App Purchases

- [ ] All digital goods and subscriptions use Apple IAP (no linking to external payment for digital goods)
- [ ] Subscription terms and pricing are clearly disclosed before purchase
- [ ] Restore purchases button is present in subscription/purchase flows

## Permissions

- [ ] Every permission requested has a clear, honest usage description string
- [ ] Permissions are requested only when needed (not all at launch)
- [ ] App functions gracefully when permission is denied

## Content & Safety

- [ ] No mention of "Android", competitor app stores, or alternative payment methods
- [ ] User-generated content (if any) has a moderation/reporting mechanism
- [ ] No placeholder content, lorem ipsum, or broken links visible to users

## Technical

- [ ] App does not crash on launch or during the core flow
- [ ] App works without a network connection or degrades gracefully
- [ ] App works on the oldest supported iOS version in `app.json`
- [ ] No private API usage

## App Review Notes

Prepare notes for the reviewer:
```
Demo account: [email] / [password]
Key flow to test: [brief description of the main feature]
Special setup needed: [or "none"]
```

## Output

```
**Preflight verdict:** READY / NEEDS FIXES

**Blockers (will cause rejection):**
- [list or "none"]

**Warnings (may cause rejection):**
- [list or "none"]
```
