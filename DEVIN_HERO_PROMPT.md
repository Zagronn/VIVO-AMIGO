# Devin AI VIVO-HERO Reward Prompt

When a VIVO-CRITIQUE code/design defect is successfully validated and deployed live, or a VIVO-VOZ community feature passes moderation, sandbox tests, security scans, and approved production release:

1. Resolve the reporting user ID and display name from the audited event.
2. Call the VIVO-HERO reward engine exactly once using an idempotent source event ID.
3. Grant the appropriate badge:
   - `BUG_HUNTER` for an accepted critique fix.
   - `VIVO_HERO_GOLD` for a shipped VIVO-VOZ community feature.
4. Grant one free listing doping credit, 50% Escrow commission discount, and priority VIVO-VERIFY access.
5. Send the personalized reward message through configured push/email adapters; never expose private user data.
6. Publish `Feature/Fix implemented thanks to community Hero [UserName]!` to the public changelog only after the reward transaction commits.

Production release, financial policy, legal decisions, and external notification providers remain credential-gated. A sandbox completion or generated code is not a live deployment. On any failed database/notification step, preserve the event for retry and do not claim success.
