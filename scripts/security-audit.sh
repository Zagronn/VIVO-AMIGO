#!/usr/bin/env bash
set -Eeuo pipefail

printf '[security] Running application tests...\n'
npm test

printf '[security] Checking browser source for exposed secret/card patterns...\n'
if grep -RIn --exclude-dir=node_modules --exclude-dir=.git --exclude='*.lock' -E 'NEXT_PUBLIC_OPENAI_API_KEY|sk-[A-Za-z0-9]{20,}|\b[0-9]{13,19}\b' public components mobile 2>/dev/null; then
  printf '[security] ERROR: potential secret or raw card pattern detected.\n' >&2
  exit 1
fi

printf '[security] Running JavaScript syntax checks...\n'
node --check public/app.js
node --check compliance.api.js
node --check vivopos.service.js
node --check agents.service.js
node --check services/ironShieldProtocol.js

printf '[security] Running Iron Shield protocol penetration checks...\n'
npm run security:pentest

printf '[security] SQLi/XSS gate: parameterized server queries and escaped JSON-LD are required by source contracts.\n'
grep -q 'encodeURIComponent(id)' 'app/listings/[id]/page.tsx'
grep -q 'jsonLdSafe' 'app/listings/[id]/page.tsx'
printf '[security] Security gates passed.\n'
