#!/bin/bash
cd "$CLAUDE_PROJECT_DIR" || exit 0

TYPE_OUTPUT=$(pnpm tsc --noEmit 2>&1)
if [ $? -ne 0 ]; then
  echo "[tsc] TypeScript type errors detected:" >&2
  echo "$TYPE_OUTPUT" >&2
  exit 2
fi
exit 0
