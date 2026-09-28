#!/usr/bin/env bash
# Pins REACT_VERSION (and TYPES_VERSION / TYPES_DOM_VERSION when set) at the
# workspace root and in every package FILTERS selects, then fails unless the
# root and each of those packages resolve exactly that `react` and `react-dom`.
set -euo pipefail

: "${REACT_VERSION:?the react-version input is required}"

specs=("react@${REACT_VERSION}" "react-dom@${REACT_VERSION}")
if [ -n "${TYPES_VERSION:-}" ]; then specs+=("@types/react@${TYPES_VERSION}"); fi
if [ -n "${TYPES_DOM_VERSION:-}" ]; then specs+=("@types/react-dom@${TYPES_DOM_VERSION}"); fi

filter_args=()
for filter in ${FILTERS:-}; do filter_args+=(--filter "$filter"); done

echo "::group::pin ${specs[*]} at the workspace root"
pnpm add --save-dev --save-exact --workspace-root "${specs[@]}"
echo "::endgroup::"

if [ "${#filter_args[@]}" -gt 0 ]; then
  echo "::group::pin ${specs[*]} in ${FILTERS}"
  pnpm "${filter_args[@]}" add --save-dev --save-exact "${specs[@]}"
  echo "::endgroup::"
fi

# Resolved from each directory the way the code under test resolves it, and
# from each of its dependencies that peers on React, so a second copy anywhere
# in the chain shows up here rather than as a hook error in the suite.
check="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/check-react.cjs"
status=0
node "$check" || status=1
if [ "${#filter_args[@]}" -gt 0 ]; then
  pnpm "${filter_args[@]}" exec node "$check" || status=1
fi
if [ "$status" -ne 0 ]; then
  echo "::error::a pinned directory still resolves a React other than ${REACT_VERSION}"
  exit 1
fi
echo "react ${REACT_VERSION} resolves at the root and in every pinned package"
