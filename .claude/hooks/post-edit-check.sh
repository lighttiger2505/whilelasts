#!/bin/bash
cd "$CLAUDE_PROJECT_DIR" || exit 0

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

ERRORS=""

FMT_OUTPUT=$(pnpm oxfmt --check "$FILE_PATH" 2>&1)
if [ $? -ne 0 ]; then
  ERRORS="${ERRORS}[oxfmt] Format issues in ${FILE_PATH}:\n${FMT_OUTPUT}\n\n"
fi

LINT_OUTPUT=$(pnpm oxlint "$FILE_PATH" --tsconfig tsconfig.json 2>&1)
if [ $? -ne 0 ]; then
  ERRORS="${ERRORS}[oxlint] Lint issues in ${FILE_PATH}:\n${LINT_OUTPUT}\n\n"
fi

if [ -n "$ERRORS" ]; then
  printf "%b" "$ERRORS" >&2
  exit 2
fi
exit 0
