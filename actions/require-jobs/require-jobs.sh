#!/usr/bin/env bash
# Reads RESULTS, the JSON of a job's `needs` context, and exits 1 when any job
# ended other than `success` or `skipped`, naming each one.
set -euo pipefail

: "${RESULTS:?the needs input is required}"
if ! echo "$RESULTS" | jq -e 'type == "object" and all(.[]; type == "object" and has("result"))' >/dev/null 2>&1; then
  echo "::error::the needs input is not the JSON of a needs context: pass \${{ toJSON(needs) }}"
  exit 1
fi

echo "$RESULTS" | jq -r 'to_entries[] | "\(.key): \(.value.result)"'
bad=$(echo "$RESULTS" | jq -r 'to_entries[]
  | select(.value.result != "success" and .value.result != "skipped")
  | "\(.key): \(.value.result)"')

if [ -n "$bad" ]; then
  echo "::error::a required job did not pass"
  echo "$bad"
  exit 1
fi
echo "every job passed or was deliberately skipped"
