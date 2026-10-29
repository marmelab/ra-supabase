#!/bin/bash

# Auto-lint files after Edit/Write.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# Only lint ts/tsx/js/jsx files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Skip if file doesn't exist (e.g. deleted)
if [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

npx eslint --fix "$FILE_PATH" 2>/dev/null

exit 0
