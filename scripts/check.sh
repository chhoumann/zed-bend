#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
ts="${TREE_SITTER:-./node_modules/tree-sitter-cli/tree-sitter}"
"$ts" test
fail=0
for f in examples/*.bend; do
  if ! "$ts" parse "$f" --quiet >/dev/null; then
    echo "ERROR nodes in $f"
    fail=1
  fi
done
exit "$fail"
