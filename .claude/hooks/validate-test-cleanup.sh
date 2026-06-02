#!/bin/bash

# Validates that test files restore any globals they mutate.
# Used as a PostToolUse hook for Edit/Write on test files.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# Only validate test files
if [[ ! "$FILE_PATH" =~ \.(test|spec)\.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

HAS_CLEANUP=$(grep -c 'afterEach\|afterAll' "$FILE_PATH" 2>/dev/null)

if [ "$HAS_CLEANUP" -gt 0 ]; then
  exit 0
fi

# Detect assignments to window/document/global properties, localStorage, sessionStorage
# Matches: window.X =, Object.defineProperty(window, ...), delete window.X
# Also: localStorage.setItem, sessionStorage.setItem, global.X =, globalThis.X =
MUTATION_PATTERNS=(
  'window\.[a-zA-Z_]*\s*='
  'Object\.defineProperty\s*(\s*window'
  'Object\.defineProperty\s*(\s*document'
  'Object\.defineProperty\s*(\s*global'
  'delete\s\+window\.'
  'document\.[a-zA-Z_]*\s*='
  'localStorage'
  'sessionStorage'
  'global\.[a-zA-Z_]*\s*='
  'globalThis\.[a-zA-Z_]*\s*='
)

for pattern in "${MUTATION_PATTERNS[@]}"; do
  if grep -q "$pattern" "$FILE_PATH" 2>/dev/null; then
    echo "Test mutates a global ($pattern) but has no afterEach/afterAll to restore it."
    exit 2
  fi
done

exit 0
