#!/usr/bin/env bash
# Sends the `docs` repository_dispatch described in action.yml. Reads PROJECT,
# BASE, FRAMEWORK, REPOSITORY and DRY_RUN, plus the run's GITHUB_REF_NAME,
# GITHUB_SHA and GITHUB_RUN_ID.
set -euo pipefail

: "${PROJECT:?the project input is required}"
: "${GITHUB_REF_NAME:?}" "${GITHUB_SHA:?}" "${GITHUB_RUN_ID:?}"
base="${BASE:-/packages/${PROJECT}/}"
framework="${FRAMEWORK:-astro}"
repository="${REPOSITORY:-rxova/rxova-website}"

# `schema` goes through `-F` so the aggregator receives the number 1; everything
# else goes through `-f` so it stays a string, and an all-digit ref or sha
# cannot arrive as a number.
args=(
  api "repos/${repository}/dispatches"
  -f event_type=docs
  -F 'client_payload[schema]=1'
  -f "client_payload[project]=${PROJECT}"
  -f "client_payload[ref]=${GITHUB_REF_NAME}"
  -f "client_payload[sha]=${GITHUB_SHA}"
  -f "client_payload[run_id]=${GITHUB_RUN_ID}"
  -f "client_payload[base]=${base}"
  -f "client_payload[framework]=${framework}"
)

if [ "${DRY_RUN:-false}" = "true" ]; then
  printf 'dry run: gh'
  printf ' %q' "${args[@]}"
  printf '\n'
  exit 0
fi

: "${GH_TOKEN:?the token input is required}"
gh "${args[@]}"
echo "dispatched docs for ${PROJECT} (${base}, ${framework}) to ${repository}"
