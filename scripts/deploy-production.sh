#!/usr/bin/env bash
set -Eeuo pipefail

log() { printf '[vivoamigo] %s\n' "$1"; }
fail() { printf '[vivoamigo] ERROR: %s\n' "$1" >&2; exit 1; }

log 'Production deployment preflight starting.'
command -v npm >/dev/null 2>&1 || fail 'npm is required.'

log 'Installing locked dependencies.'
npm ci --no-audit --no-fund

log 'Running application and security validation.'
npm test
npm run check:mobile
npm run check:native

if [[ "${VIVO_SKIP_BUILD:-0}" != '1' ]]; then
  if npm run | grep -q '^  build$'; then
    npm run build
  else
    fail 'No npm build script is configured. This repository has no Next.js build toolchain; set VIVO_SKIP_BUILD=1 only for validation-only runs.'
  fi
fi

if [[ "${VIVO_SKIP_PROCESS_RESTART:-0}" != '1' ]]; then
  command -v pm2 >/dev/null 2>&1 || fail 'PM2 is required for process restart. Set VIVO_SKIP_PROCESS_RESTART=1 for artifact validation only.'
  pm2 restart vivoamigo-production || pm2 start npm --name vivoamigo-production -- start
fi

log 'Production deployment gates passed.'
