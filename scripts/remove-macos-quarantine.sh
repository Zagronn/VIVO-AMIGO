#!/bin/sh
set -eu

APP_PATH="${1:-release/mac-arm64/VIVO AMIGO Command Center.app}"
ZIP_PATH="${2:-dist/VIVO_AMIGO_Command_Center_Mac.zip}"

if ! command -v xattr >/dev/null 2>&1; then
  echo "xattr is required on macOS to remove quarantine metadata." >&2
  exit 1
fi

for path in "$APP_PATH" "$ZIP_PATH"; do
  if [ -e "$path" ]; then
    xattr -cr "$path" 2>/dev/null || true
    echo "macOS extended attributes cleared: $path"
  fi
done

echo "Unsigned local build ready. For public distribution, notarize with an Apple Developer ID certificate."
