#!/bin/sh
# Usage: reindex-if-changed.sh <from-rev> <to-rev>
# Runs incremental indexing if on main and knowledge-base/ changed between revs.

from="$1"
to="$2"

branch=$(git rev-parse --abbrev-ref HEAD)
[ "$branch" = "main" ] || exit 0

if git diff --quiet "$from" "$to" -- knowledge-base/; then
  exit 0
fi

echo "knowledge-base/ changed on main, running indexing..."
if ! npm run index; then
  echo ""
  echo "=================================================="
  echo " INDEXING FAILED. Run 'npm run index' manually."
  echo "=================================================="
fi
